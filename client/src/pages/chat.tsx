import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import {
  MessageList,
  type Message as UIMessage,
} from "@/components/message-list";
import { MessageInput } from "@/components/message-input";
import { WalletButton } from "@/components/wallet-button";
import { ConnectionStatus } from "@/components/connection-status";
import { ThemeToggle } from "@/components/theme-toggle";
import { WalletConnectionDialog } from "@/components/wallet-connection-dialog";
import { RoomCreationDialog } from "@/components/room-creation-dialog";
import { KeyManagementDialog } from "@/components/key-management-dialog";
import { connectWallet, disconnectWallet, type WalletState } from "@/lib/web3";
import { useP2PChat } from "@/hooks/useP2PChat";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Room } from "@shared/schema";

const ENCRYPTION_KEY_STORAGE_PREFIX = "encryption_key_";

export default function Chat() {
  const { toast } = useToast();

  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    connected: false,
    balance: null,
  });
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [encryptionKeys, setEncryptionKeys] = useState<Record<string, string>>(
    {}
  );

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

  // Load encryption keys from localStorage
  useEffect(() => {
    if (rooms.length === 0) return;

    const keys: Record<string, string> = {};
    rooms.forEach((room) => {
      const key = localStorage.getItem(
        `${ENCRYPTION_KEY_STORAGE_PREFIX}${room.id}`
      );
      if (key) {
        keys[room.id] = key;
      }
    });

    setEncryptionKeys((prev) => {
      // Only update if keys actually changed
      const hasChanges = rooms.some(
        (room) => (keys[room.id] || null) !== (prev[room.id] || null)
      );
      return hasChanges ? keys : prev;
    });
  }, [rooms.length]);

  // Create room mutation
  const createRoomMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiRequest("POST", "/api/rooms", { name });
      return (await res.json()) as Room;
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

  const sendMessageMutation = useMutation({
    mutationFn: async () => {},
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

  const activeRoomKey = activeRoomId
    ? encryptionKeys[activeRoomId] ?? null
    : null;

  const {
    messages: p2pMessages,
    connectionStatus: p2pStatus,
    sendMessage: sendP2PMessage,
  } = useP2PChat({
    roomId: activeRoomId,
    sharedKey: activeRoomKey,
  });

  const handleSendMessage = (content: string) => {
    if (!activeRoomId) {
      toast({
        title: "No Room Selected",
        description: "Please select a room first",
        variant: "destructive",
      });
      return;
    }

    if (!activeRoomKey) {
      toast({
        title: "No Encryption Key",
        description: "Please set an encryption key for this room",
        variant: "destructive",
      });
      setKeyDialogOpen(true);
      return;
    }

    sendP2PMessage(content).catch((error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send P2P message",
        variant: "destructive",
      });
    });
  };

  const handleCreateRoom = (roomName: string) => {
    createRoomMutation.mutate(roomName);
  };

  const handleSetKey = (key: string) => {
    if (!activeRoomId) return;

    localStorage.setItem(
      `${ENCRYPTION_KEY_STORAGE_PREFIX}${activeRoomId}`,
      key
    );
    setEncryptionKeys((prev) => ({
      ...prev,
      [activeRoomId]: key,
    }));

    toast({
      title: "Encryption Key Set",
      description: "Messages will now be encrypted with this key",
    });
  };

  // Decrypt messages for display
  const decryptedMessages: UIMessage[] = p2pMessages;

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
                connected={p2pStatus === "connected"}
                network="P2P Network"
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
            <MessageList
              messages={decryptedMessages}
              currentUserAddress={walletState.address}
            />
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
