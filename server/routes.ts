import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertRoomSchema, insertMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: "/ws"
  });

  // Store active WebSocket connections
  const clients = new Set<WebSocket>();

  // WebSocket connection handler
  wss.on("connection", (ws: WebSocket) => {
    clients.add(ws);
    console.log("Chat WebSocket client connected");

    ws.on("close", () => {
      clients.delete(ws);
      console.log("Chat WebSocket client disconnected");
    });

    ws.on("error", (error) => {
      console.error("Chat WebSocket error:", error);
    });
  });

  // Broadcast message to all connected clients
  function broadcastMessage(roomId: string, message: any) {
    const payload = JSON.stringify({
      type: "new_message",
      roomId,
      message,
    });

    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }

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
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid room data", details: error.errors });
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
      const message = await storage.createMessage(validatedData);
      
      // Broadcast to all connected WebSocket clients
      broadcastMessage(roomId, message);
      
      res.status(201).json(message);
    } catch (error: any) {
      console.error("Error creating message:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid message data", details: error.errors });
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
