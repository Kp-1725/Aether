import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import type { Message as DbMessage } from "@shared/schema";
import type { Message as UIMessage } from "@/components/message-list";
import type { FileAttachment } from "@/components/file-attachment";
import {
  decryptWithSharedKey,
  encryptWithSharedKey,
  getWalletSigner,
  signEncryptedPayload,
} from "@/lib/crypto";
import {
  useFileTransfer,
  type FileTransferProgress,
} from "@/hooks/useFileTransfer";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

interface P2PMessageWire {
  id: string;
  roomId: string;
  sender: string;
  senderAvatar?: string;
  ciphertext: string;
  hash: string;
  signature: string;
  timestamp: number;
  file?: {
    id: string;
    name: string;
    size: number;
    type: string;
    data: string;
  };
}

interface P2PPeerInfo {
  id: string;
  connectionState: RTCPeerConnectionState;
  dataChannelState: RTCDataChannelState;
}

interface UseP2PChatOptions {
  roomId: string | null;
  sharedKey: string | null;
  userAvatar?: string;
}

interface UseP2PChatResult {
  messages: UIMessage[];
  peers: P2PPeerInfo[];
  connectionStatus: ConnectionStatus;
  sendMessage: (plaintext: string, file?: FileAttachment) => Promise<void>;
  fileTransfers: FileTransferProgress[];
}

export function useP2PChat({
  roomId,
  sharedKey,
  userAvatar,
}: UseP2PChatOptions): UseP2PChatResult {
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [peers, setPeers] = useState<P2PPeerInfo[]>([]);

  const {
    transfers: fileTransfers,
    sendFileChunked,
    handleIncomingChunk,
    isFileTransferMessage,
    setOnFileReceived,
  } = useFileTransfer();

  const signalingRef = useRef<WebSocket | null>(null);
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const dataChannels = useRef<Map<string, RTCDataChannel>>(new Map());
  const localPeerIdRef = useRef<string | null>(null);
  // Use a ref to always have access to the current sharedKey in callbacks
  const sharedKeyRef = useRef<string | null>(sharedKey);
  // Keep avatar ref for use in callbacks
  const userAvatarRef = useRef<string | undefined>(userAvatar);
  // Pending file messages waiting for file transfer to complete
  const pendingFileMessagesRef = useRef<
    Map<string, { wire: P2PMessageWire; sender: string }>
  >(new Map());

  // Keep the ref in sync with the prop
  useEffect(() => {
    sharedKeyRef.current = sharedKey;
    console.log(
      "[P2P] sharedKey updated:",
      sharedKey ? `"${sharedKey}"` : "null"
    );
  }, [sharedKey]);

  // Keep avatar ref in sync
  useEffect(() => {
    userAvatarRef.current = userAvatar;
  }, [userAvatar]);

  // Handle received files from chunked transfer
  useEffect(() => {
    setOnFileReceived((file) => {
      // Find pending message for this file
      const pending = pendingFileMessagesRef.current.get(file.id);
      if (pending) {
        // Update the message with the complete file
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === pending.wire.id
              ? {
                  ...msg,
                  file: {
                    ...file,
                    preview: file.type.startsWith("image/")
                      ? file.data
                      : undefined,
                  } as FileAttachment,
                }
              : msg
          )
        );
        pendingFileMessagesRef.current.delete(file.id);
      }
    });
  }, [setOnFileReceived]);

  const signalUrl = useMemo(() => {
    if (typeof window === "undefined") return null;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}/signal`;
  }, []);

  // Establish signaling connection and join room
  useEffect(() => {
    if (!signalUrl || !roomId) {
      return;
    }

    setConnectionStatus("connecting");
    const ws = new WebSocket(signalUrl);
    signalingRef.current = ws;

    ws.onopen = () => {
      console.log("[P2P] Signaling WebSocket connected to", signalUrl);
      setConnectionStatus("connected");
      const joinMessage = {
        type: "join-room",
        roomId,
        peerId: "", // server will assign an id and echo back
      };
      ws.send(JSON.stringify(joinMessage));
      console.log("[P2P] Sent join-room for", roomId);
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("[P2P] Received signaling message:", data.type, data);

        if (data.type === "room-peers") {
          localPeerIdRef.current = data.peerId as string;
          const existingPeers: string[] = data.peers ?? [];
          console.log(
            "[P2P] I am peer",
            data.peerId,
            "- existing peers in room:",
            existingPeers
          );
          await Promise.all(
            existingPeers.map((peerId: string) => createPeerConnection(peerId))
          );
        } else if (data.type === "peer-joined") {
          const newPeerId = data.peerId as string;
          console.log("[P2P] New peer joined:", newPeerId);
          await createPeerConnection(newPeerId, true);
        } else if (data.type === "peer-left") {
          const id = data.peerId as string;
          console.log("[P2P] Peer left:", id);
          cleanupPeer(id);
        } else if (data.type === "signal-offer") {
          console.log("[P2P] Received offer from", data.from);
          await handleOffer(data);
        } else if (data.type === "signal-answer") {
          console.log("[P2P] Received answer from", data.from);
          await handleAnswer(data);
        } else if (data.type === "signal-ice-candidate") {
          console.log("[P2P] Received ICE candidate from", data.from);
          await handleIceCandidate(data);
        }
      } catch (err) {
        console.error("[P2P] Error handling signaling message", err);
        setConnectionStatus("error");
      }
    };

    ws.onerror = () => {
      setConnectionStatus("error");
    };

    ws.onclose = () => {
      setConnectionStatus("disconnected");
      peerConnections.current.forEach((pc) => pc.close());
      peerConnections.current.clear();
      dataChannels.current.clear();
      setPeers([]);
    };

    return () => {
      ws.close();
    };
  }, [roomId, signalUrl]);

  async function createPeerConnection(
    peerId: string,
    isInitiator = false
  ): Promise<void> {
    if (!roomId) return;

    if (peerConnections.current.has(peerId)) {
      return;
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:19302" },
        // Free TURN servers from Open Relay Project
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:openrelay.metered.ca:443",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:openrelay.metered.ca:443?transport=tcp",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
      ],
    });

    peerConnections.current.set(peerId, pc);

    pc.onicecandidate = (event) => {
      if (!event.candidate || !signalingRef.current || !localPeerIdRef.current)
        return;
      signalingRef.current.send(
        JSON.stringify({
          type: "signal-ice-candidate",
          roomId,
          from: localPeerIdRef.current,
          to: peerId,
          candidate: event.candidate,
        })
      );
    };

    pc.onconnectionstatechange = () => {
      updatePeerInfo(peerId, pc, dataChannels.current.get(peerId) ?? null);
    };

    let channel: RTCDataChannel | null = null;

    if (isInitiator) {
      channel = pc.createDataChannel("chat", { ordered: true });
      setupDataChannel(peerId, channel);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      if (signalingRef.current && localPeerIdRef.current) {
        signalingRef.current.send(
          JSON.stringify({
            type: "signal-offer",
            roomId,
            from: localPeerIdRef.current,
            to: peerId,
            sdp: offer,
          })
        );
      }
    } else {
      pc.ondatachannel = (event) => {
        const receivedChannel = event.channel;
        setupDataChannel(peerId, receivedChannel);
      };
    }

    if (channel) {
      dataChannels.current.set(peerId, channel);
    }

    updatePeerInfo(peerId, pc, channel);
  }

  function setupDataChannel(peerId: string, channel: RTCDataChannel) {
    dataChannels.current.set(peerId, channel);
    console.log(
      "[P2P] DataChannel setup for peer",
      peerId,
      "state:",
      channel.readyState
    );

    channel.onopen = () => {
      console.log("[P2P] DataChannel OPEN with peer", peerId);
      updatePeerInfo(
        peerId,
        peerConnections.current.get(peerId) ?? null,
        channel
      );
    };

    channel.onclose = () => {
      console.log("[P2P] DataChannel CLOSED with peer", peerId);
      updatePeerInfo(
        peerId,
        peerConnections.current.get(peerId) ?? null,
        channel
      );
    };

    channel.onmessage = (event) => {
      console.log("[P2P] Received message on DataChannel from", peerId);
      try {
        const data = JSON.parse(event.data);

        // Check if this is a file transfer message
        if (isFileTransferMessage(data)) {
          handleIncomingChunk(data);
          return;
        }

        // Regular message
        const wire = data as P2PMessageWire;
        const currentKey = sharedKeyRef.current;

        console.log(
          "[P2P] Attempting decryption with key:",
          currentKey ? `"${currentKey}"` : "null"
        );
        console.log(
          "[P2P] Ciphertext preview:",
          wire.ciphertext.substring(0, 50) + "..."
        );

        if (!currentKey) {
          console.warn("[P2P] No shared key set, cannot decrypt message");
          return;
        }

        let decrypted: string;
        let verified = true;

        try {
          decrypted = decryptWithSharedKey(wire.ciphertext, currentKey);
          console.log("[P2P] Decryption successful:", decrypted);
        } catch (decryptError) {
          console.warn(
            "[P2P] Decryption failed - keys may not match:",
            decryptError
          );
          decrypted = "[Unable to decrypt - encryption keys don't match]";
          verified = false;
        }

        // If message has a file reference, store it for when file transfer completes
        if (wire.file?.id && !wire.file.data) {
          pendingFileMessagesRef.current.set(wire.file.id, {
            wire,
            sender: wire.sender,
          });
        }

        const uiMessage: UIMessage = {
          id: wire.id,
          sender: wire.sender,
          content: decrypted,
          timestamp: new Date(wire.timestamp),
          verified,
          senderAvatar: wire.senderAvatar,
          file: wire.file as FileAttachment | undefined,
        };
        setMessages((prev) => [...prev, uiMessage]);
      } catch (err) {
        console.error("[P2P] Error parsing data channel message", err);
      }
    };
  }

  async function handleOffer(data: any): Promise<void> {
    const { from, sdp } = data;
    if (!roomId) return;
    let pc = peerConnections.current.get(from);
    if (!pc) {
      await createPeerConnection(from, false);
      pc = peerConnections.current.get(from) ?? null;
    }
    if (!pc) return;
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    if (signalingRef.current && localPeerIdRef.current) {
      signalingRef.current.send(
        JSON.stringify({
          type: "signal-answer",
          roomId,
          from: localPeerIdRef.current,
          to: from,
          sdp: answer,
        })
      );
    }
  }

  async function handleAnswer(data: any): Promise<void> {
    const { from, sdp } = data;
    const pc = peerConnections.current.get(from);
    if (!pc) return;
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
  }

  async function handleIceCandidate(data: any): Promise<void> {
    const { from, candidate } = data;
    const pc = peerConnections.current.get(from);
    if (!pc || !candidate) return;
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  }

  function cleanupPeer(peerId: string) {
    const pc = peerConnections.current.get(peerId);
    if (pc) {
      pc.close();
      peerConnections.current.delete(peerId);
    }
    const channel = dataChannels.current.get(peerId);
    if (channel) {
      channel.close();
      dataChannels.current.delete(peerId);
    }
    setPeers((prev) => prev.filter((p) => p.id !== peerId));
  }

  function updatePeerInfo(
    peerId: string,
    pc: RTCPeerConnection | null,
    channel: RTCDataChannel | null
  ) {
    setPeers((prev) => {
      const others = prev.filter((p) => p.id !== peerId);
      return [
        ...others,
        {
          id: peerId,
          connectionState: pc?.connectionState ?? "disconnected",
          dataChannelState: channel?.readyState ?? "closed",
        },
      ];
    });
  }

  async function sendMessage(
    plaintext: string,
    file?: FileAttachment
  ): Promise<void> {
    if (!roomId) return;
    if (!sharedKey) {
      throw new Error("No shared encryption key for this room");
    }

    console.log("[P2P] Sending message with key:", `"${sharedKey}"`);

    const signer = await getWalletSigner();
    const encrypted = encryptWithSharedKey(plaintext || "[File]", sharedKey);

    console.log(
      "[P2P] Encrypted ciphertext preview:",
      encrypted.ciphertext.substring(0, 50) + "..."
    );

    const signed = await signEncryptedPayload(encrypted, signer);

    // For large files (>1MB), use chunked transfer
    const useChunkedTransfer = file && file.size > 1024 * 1024;

    const wire: P2PMessageWire = {
      id: crypto.randomUUID(),
      roomId,
      sender: signed.sender,
      senderAvatar: userAvatarRef.current,
      ciphertext: signed.ciphertext,
      hash: signed.hash,
      signature: signed.signature,
      timestamp: Date.now(),
      file: file
        ? {
            id: file.id,
            name: file.name,
            size: file.size,
            type: file.type,
            // For chunked transfer, don't include data in the message
            data: useChunkedTransfer ? "" : file.data,
          }
        : undefined,
    };

    const payload = JSON.stringify(wire);

    // Send message to all peers
    const openChannels: RTCDataChannel[] = [];
    dataChannels.current.forEach((channel) => {
      if (channel.readyState === "open") {
        channel.send(payload);
        openChannels.push(channel);
      }
    });

    // If using chunked transfer, send file chunks after the message
    if (useChunkedTransfer && file && openChannels.length > 0) {
      const sendChunk = (chunkPayload: string) => {
        openChannels.forEach((channel) => {
          if (channel.readyState === "open") {
            channel.send(chunkPayload);
          }
        });
      };

      // Send file in chunks with progress tracking
      await sendFileChunked(file, sendChunk);
    }

    const uiMessage: UIMessage = {
      id: wire.id,
      sender: wire.sender,
      content: plaintext,
      timestamp: new Date(wire.timestamp),
      verified: true,
      senderAvatar: userAvatarRef.current,
      file: file,
    };
    setMessages((prev) => [...prev, uiMessage]);

    // Optional: relay to server for indexing
    try {
      await fetch(`/api/rooms/${roomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: signed.sender,
          senderPublicKey: signed.sender,
          roomId,
          encryptedContent: signed.ciphertext,
          hash: signed.hash,
          signature: signed.signature,
        } satisfies Partial<DbMessage>),
      });
    } catch (err) {
      console.error("Failed to relay message to server", err);
    }
  }

  return {
    messages,
    peers,
    connectionStatus,
    sendMessage,
    fileTransfers,
  };
}
