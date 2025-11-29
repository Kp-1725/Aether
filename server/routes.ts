import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { randomUUID } from "crypto";
import { storage } from "./storage";
import { insertRoomSchema, insertMessageSchema } from "@shared/schema";
import { verifySignedMessage } from "./crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const signalingWss = new WebSocketServer({
    server: httpServer,
    path: "/signal",
  });

  // --- WebRTC signaling server (P2P mode) ---

  interface SignalJoinRoom {
    type: "join-room";
    roomId: string;
    peerId: string;
  }

  interface SignalOffer {
    type: "signal-offer";
    roomId: string;
    from: string;
    to: string;
    sdp: unknown;
  }

  interface SignalAnswer {
    type: "signal-answer";
    roomId: string;
    from: string;
    to: string;
    sdp: unknown;
  }

  interface SignalIceCandidate {
    type: "signal-ice-candidate";
    roomId: string;
    from: string;
    to: string;
    candidate: unknown;
  }

  type SignalMessage =
    | SignalJoinRoom
    | SignalOffer
    | SignalAnswer
    | SignalIceCandidate;

  const roomPeers = new Map<string, Set<WebSocket>>();
  const socketRoom = new Map<WebSocket, string>();
  const socketId = new Map<WebSocket, string>();

  signalingWss.on("connection", (ws: WebSocket) => {
    const id = randomUUID();
    socketId.set(ws, id);

    ws.on("message", (data) => {
      try {
        const parsed = JSON.parse(data.toString()) as SignalMessage;

        if (parsed.type === "join-room") {
          const { roomId } = parsed;
          socketRoom.set(ws, roomId);
          let peers = roomPeers.get(roomId);
          if (!peers) {
            peers = new Set();
            roomPeers.set(roomId, peers);
          }

          // Get existing peers BEFORE adding this socket
          const existingPeers = Array.from(peers)
            .map((peer) => socketId.get(peer))
            .filter((peerId): peerId is string => Boolean(peerId));

          // Now add this socket to the room
          peers.add(ws);

          // Send existing peers to the new joiner (excluding self)
          ws.send(
            JSON.stringify({
              type: "room-peers",
              roomId,
              peerId: id,
              peers: existingPeers,
            })
          );

          // Notify existing peers about the new joiner
          peers.forEach((peer) => {
            if (peer !== ws && peer.readyState === WebSocket.OPEN) {
              peer.send(
                JSON.stringify({
                  type: "peer-joined",
                  roomId,
                  peerId: id,
                })
              );
            }
          });
          return;
        }

        if (
          parsed.type === "signal-offer" ||
          parsed.type === "signal-answer" ||
          parsed.type === "signal-ice-candidate"
        ) {
          const targetSocket = Array.from(socketId.entries()).find(
            ([, value]) => value === parsed.to
          )?.[0];
          if (targetSocket && targetSocket.readyState === WebSocket.OPEN) {
            targetSocket.send(
              JSON.stringify({
                ...parsed,
                from: socketId.get(ws),
              })
            );
          }
        }
      } catch (err) {
        console.error("Error handling signaling message", err);
      }
    });

    ws.on("close", () => {
      const roomId = socketRoom.get(ws);
      const idToRemove = socketId.get(ws);
      socketRoom.delete(ws);
      socketId.delete(ws);

      if (roomId) {
        const peers = roomPeers.get(roomId);
        if (peers) {
          peers.delete(ws);
          if (peers.size === 0) {
            roomPeers.delete(roomId);
          } else {
            peers.forEach((peer) => {
              if (peer.readyState === WebSocket.OPEN && idToRemove) {
                peer.send(
                  JSON.stringify({
                    type: "peer-left",
                    roomId,
                    peerId: idToRemove,
                  })
                );
              }
            });
          }
        }
      }
    });

    ws.on("error", (error) => {
      console.error("Signaling WebSocket error:", error);
    });
  });

  // Room routes
  app.get("/api/rooms", async (req, res) => {
    try {
      const rooms = await storage.listRooms();
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      res.status(500).json({ error: "Failed to fetch rooms" });
    }
  });

  app.post("/api/rooms", async (req, res) => {
    try {
      const validatedData = insertRoomSchema.parse(req.body);
      const room = await storage.createRoom(validatedData);
      res.status(201).json(room);
    } catch (error: any) {
      console.error("Error creating room:", error);
      if (error.name === "ZodError") {
        return res
          .status(400)
          .json({ error: "Invalid room data", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Message routes
  app.get("/api/rooms/:roomId/messages", async (req, res) => {
    try {
      const { roomId } = req.params;
      const messages = await storage.getMessagesByRoom(roomId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/rooms/:roomId/messages", async (req, res) => {
    try {
      const { roomId } = req.params;

      // Check if room exists
      const room = await storage.getRoom(roomId);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      const messageData = {
        ...req.body,
        roomId,
      };

      const validatedData = insertMessageSchema.parse(messageData);

      const isValid = verifySignedMessage({
        ciphertext: validatedData.encryptedContent,
        hash: validatedData.hash,
        signature: validatedData.signature ?? "",
        sender: validatedData.sender,
      });

      if (!isValid) {
        return res
          .status(400)
          .json({ error: "Invalid message signature or hash" });
      }

      const message = await storage.createMessage(validatedData);
      res.status(201).json(message);
    } catch (error: any) {
      console.error("Error creating message:", error);
      if (error.name === "ZodError") {
        return res
          .status(400)
          .json({ error: "Invalid message data", details: error.errors });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update message verification status (for blockchain confirmation)
  app.patch("/api/messages/:id/verify", async (req, res) => {
    try {
      const { id } = req.params;
      const { verified, txHash } = req.body;

      await storage.updateMessageVerification(id, verified, txHash);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating message verification:", error);
      res.status(500).json({ error: "Failed to update message" });
    }
  });

  return httpServer;
}
