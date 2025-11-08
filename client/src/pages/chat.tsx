import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { MessageList, type Message as UIMessage } from "@/components/message-list";
import { MessageInput } from "@/components/message-input";
import { WalletButton } from "@/components/wallet-button";
import { ConnectionStatus } from "@/components/connection-status";
import { ThemeToggle } from "@/components/theme-toggle";
import { WalletConnectionDialog } from "@/components/wallet-connection-dialog";
import { RoomCreationDialog } from "@/components/room-creation-dialog";
import { KeyManagementDialog } from "@/components/key-management-dialog";
import { connectWallet, disconnectWallet, encryptMessage, decryptMessage, hashMessage, type WalletState } from "@/lib/web3";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Room, Message } from "@shared/schema";

const ENCRYPTION_KEY_STORAGE_PREFIX = "encryption_key_";

export default function Chat() {
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);
  
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    connected: false,
    balance: null,
  });
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [encryptionKeys, setEncryptionKeys] = useState<Record<string, string>>({});
  
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [keyDialogOpen, setKeyDialogOpen] = useState(false);
  const [walletError, setWalletError] = useState<string>("");

  // Fetch rooms
  const { data: rooms = [], isLoading: roomsLoading } = useQuery<Room[]>({
    queryKey: ["/api/rooms"],
    refetchOnWindowFocus: false,
  });

  // Set initial active room when rooms load
  useEffect(() => {
    if (rooms.length > 0 && !activeRoomId) {
      setActiveRoomId(rooms[0].id);
    }
  }, [rooms, activeRoomId]);

  // Fetch messages for active room
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/rooms", activeRoomId, "messages"],
    enabled: !!activeRoomId,
    refetchOnWindowFocus: false,
  });

  // Load encryption keys from localStorage
  useEffect(() => {
    if (rooms.length === 0) return;
    
    const keys: Record<string, string> = {};
    rooms.forEach(room => {
      const key = localStorage.getItem(`${ENCRYPTION_KEY_STORAGE_PREFIX}${room.id}`);
      if (key) {
        keys[room.id] = key;
      }
    });
    
    setEncryptionKeys(prev => {
      // Only update if keys actually changed
      const hasChanges = rooms.some(room => 
        (keys[room.id] || null) !== (prev[room.id] || null)
      );
      return hasChanges ? keys : prev;
    });
  }, [rooms.length]);

  // WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "new_message" && data.message) {
          // Update the cache directly with the new message
          queryClient.setQueryData<Message[]>(
            ["/api/rooms", data.roomId, "messages"],
            (oldMessages = []) => [...oldMessages, data.message]
          );
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      ws.close();
    };
  }, []);

  // Create room mutation
  const createRoomMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/rooms", { name });
      return await res.json() as Room;
    },
    onSuccess: (newRoom) => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      setActiveRoomId(newRoom.id);
      toast({
        title: "Room Created",
        description: `Room "${newRoom.name}" has been created`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create room",
        variant: "destructive",
      });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ roomId, content, senderOverride }: { 
      roomId: string; 
      content: string;
      senderOverride?: string;
    }) => {
      const sender = senderOverride || walletState.address;
      if (!sender) throw new Error("No sender address available");
      
      const key = encryptionKeys[roomId];
      if (!key) throw new Error("No encryption key set for this room");

      const encryptedContent = encryptMessage(content, key);
      const messageHash = hashMessage(encryptedContent);

      const res = await apiRequest("POST", `/api/rooms/${roomId}/messages`, {
        sender,
        encryptedContent,
        hash: messageHash,
        verified: "false",
      });
      return await res.json() as Message;
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Message encrypted and sent",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleConnectWallet = async () => {
    try {
      setWalletError("");
      const state = await connectWallet();
      setWalletState(state);
      setWalletDialogOpen(false);
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to MetaMask",
      });
    } catch (error: any) {
      setWalletError(error.message || "Failed to connect wallet");
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };

  const handleDisconnectWallet = () => {
    setWalletState(disconnectWallet());
    toast({
      title: "Wallet Disconnected",
      description: "Wallet has been disconnected",
    });
  };

  const handleSendMessage = (content: string) => {
    if (!activeRoomId) {
      toast({
        title: "No Room Selected",
        description: "Please select a room first",
        variant: "destructive",
      });
      return;
    }

    if (!encryptionKeys[activeRoomId]) {
      toast({
        title: "No Encryption Key",
        description: "Please set an encryption key for this room",
        variant: "destructive",
      });
      setKeyDialogOpen(true);
      return;
    }

    // Use wallet address if connected, otherwise use a temporary anonymous ID
    const senderAddress = walletState.address || `anon_${Math.random().toString(36).substr(2, 9)}`;
    
    if (!walletState.address) {
      toast({
        title: "Sending Anonymously",
        description: "Connect wallet for blockchain verification",
      });
    }

    sendMessageMutation.mutate({ 
      roomId: activeRoomId, 
      content,
      senderOverride: senderAddress 
    });
  };

  const handleCreateRoom = (roomName: string) => {
    createRoomMutation.mutate(roomName);
  };

  const handleSetKey = (key: string) => {
    if (!activeRoomId) return;
    
    localStorage.setItem(`${ENCRYPTION_KEY_STORAGE_PREFIX}${activeRoomId}`, key);
    setEncryptionKeys(prev => ({
      ...prev,
      [activeRoomId]: key,
    }));
    
    toast({
      title: "Encryption Key Set",
      description: "Messages will now be encrypted with this key",
    });
  };

  // Decrypt messages for display
  const decryptedMessages: UIMessage[] = messages.map(msg => {
    const key = encryptionKeys[msg.roomId];
    let decryptedContent = msg.encryptedContent;
    
    if (key) {
      try {
        decryptedContent = decryptMessage(msg.encryptedContent, key);
      } catch (error) {
        console.error("Failed to decrypt message:", error);
        decryptedContent = "[Unable to decrypt - wrong key?]";
      }
    } else {
      decryptedContent = "[Encrypted - set key to view]";
    }

    return {
      id: msg.id,
      sender: msg.sender,
      content: decryptedContent,
      timestamp: new Date(msg.timestamp),
      verified: msg.verified === "true",
    };
  });

  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar
          rooms={rooms}
          activeRoomId={activeRoomId}
          onRoomSelect={setActiveRoomId}
          onCreateRoom={() => setRoomDialogOpen(true)}
          onManageKeys={() => setKeyDialogOpen(true)}
        />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <ConnectionStatus 
                connected={walletState.connected} 
                network="Local Network"
              />
            </div>
            <div className="flex items-center gap-2">
              <WalletButton
                address={walletState.address}
                connected={walletState.connected}
                onConnect={() => setWalletDialogOpen(true)}
                onDisconnect={handleDisconnectWallet}
              />
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-hidden">
            {messagesLoading ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Loading messages...
              </div>
            ) : (
              <MessageList 
                messages={decryptedMessages} 
                currentUserAddress={walletState.address}
              />
            )}
          </main>
          <MessageInput 
            onSend={handleSendMessage}
            disabled={!activeRoomId || sendMessageMutation.isPending}
            encrypted={activeRoomId ? !!encryptionKeys[activeRoomId] : false}
          />
        </div>
      </div>

      <WalletConnectionDialog
        open={walletDialogOpen}
        onOpenChange={setWalletDialogOpen}
        onConnect={handleConnectWallet}
        error={walletError}
      />

      <RoomCreationDialog
        open={roomDialogOpen}
        onOpenChange={setRoomDialogOpen}
        onCreate={handleCreateRoom}
      />

      <KeyManagementDialog
        open={keyDialogOpen}
        onOpenChange={setKeyDialogOpen}
        currentKey={activeRoomId ? encryptionKeys[activeRoomId] : null}
        onSetKey={handleSetKey}
      />
    </SidebarProvider>
  );
}
