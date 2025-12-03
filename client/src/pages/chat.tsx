import { useState, useEffect, useCallback, useRef } from "react";
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
import { SettingsDialog } from "@/components/settings-dialog";
import { FileTransferProgressBar } from "@/components/file-transfer-progress";
import {
  EncryptionAnimation,
  EncryptionStatus,
} from "@/components/encryption-indicator";
import { PrivacyOverlay, PrivacyBadge } from "@/components/privacy-overlay";
import { connectWallet, disconnectWallet, type WalletState } from "@/lib/web3";
import { useP2PChat } from "@/hooks/useP2PChat";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/useNotifications";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useScreenshotProtection } from "@/hooks/useScreenshotProtection";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useUserAvatar } from "@/components/avatar-selection-dialog";
import type { Room } from "@shared/schema";
import type { FileAttachment } from "@/components/file-attachment";

const ENCRYPTION_KEY_STORAGE_PREFIX = "encryption_key_";
const PINNED_MESSAGES_PREFIX = "pinned_messages_";

export default function Chat() {
  const { toast } = useToast();
  const { avatar, updateAvatar } = useUserAvatar();
  const { sendNotification, isEnabled: isNotificationsEnabled } =
    useNotifications();
  const { playSend, playReceive, playPin } = useSoundEffects();

  // Screenshot protection - Snapchat-style content protection
  const { isBlurred, isProtected, attemptCount } = useScreenshotProtection({
    enabled: true,
    blurOnInactive: true,
    preventSelection: true,
    preventContextMenu: false, // Allow right-click
    preventPrint: true,
    preventDevTools: false,
  });

  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    connected: false,
    balance: null,
  });
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [encryptionKeys, setEncryptionKeys] = useState<Record<string, string>>(
    {}
  );
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [pinnedMessageIds, setPinnedMessageIds] = useState<Set<string>>(
    new Set()
  );

  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [keyDialogOpen, setKeyDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [walletError, setWalletError] = useState<string>("");
  const [isEncrypting, setIsEncrypting] = useState(false);

  // Track previous message count to detect new messages
  const prevMessageCountRef = useRef<number>(0);

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
    fileTransfers,
  } = useP2PChat({
    roomId: activeRoomId,
    sharedKey: activeRoomKey,
    userAvatar: avatar,
  });

  const handleSendMessage = (content: string, file?: FileAttachment) => {
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

    sendP2PMessage(content, file).catch((error: any) => {
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

  // Load pinned messages from localStorage
  useEffect(() => {
    if (!activeRoomId) return;
    const stored = localStorage.getItem(
      `${PINNED_MESSAGES_PREFIX}${activeRoomId}`
    );
    if (stored) {
      try {
        setPinnedMessageIds(new Set(JSON.parse(stored)));
      } catch {
        setPinnedMessageIds(new Set());
      }
    } else {
      setPinnedMessageIds(new Set());
    }
  }, [activeRoomId]);

  // Handle pinning messages
  const handlePinMessage = useCallback(
    (messageId: string) => {
      if (!activeRoomId) return;
      setPinnedMessageIds((prev) => {
        const next = new Set(prev);
        next.add(messageId);
        localStorage.setItem(
          `${PINNED_MESSAGES_PREFIX}${activeRoomId}`,
          JSON.stringify([...next])
        );
        return next;
      });
      playPin();
      toast({
        title: "Message Pinned",
        description: "Message has been pinned to the top",
      });
    },
    [activeRoomId, playPin, toast]
  );

  const handleUnpinMessage = useCallback(
    (messageId: string) => {
      if (!activeRoomId) return;
      setPinnedMessageIds((prev) => {
        const next = new Set(prev);
        next.delete(messageId);
        localStorage.setItem(
          `${PINNED_MESSAGES_PREFIX}${activeRoomId}`,
          JSON.stringify([...next])
        );
        return next;
      });
      toast({
        title: "Message Unpinned",
        description: "Message has been unpinned",
      });
    },
    [activeRoomId, toast]
  );

  // Handle new message notifications and sounds
  useEffect(() => {
    if (p2pMessages.length > prevMessageCountRef.current) {
      const newMessages = p2pMessages.slice(prevMessageCountRef.current);

      newMessages.forEach((msg) => {
        const isOwnMessage =
          walletState.address &&
          msg.sender.toLowerCase() === walletState.address.toLowerCase();

        if (isOwnMessage) {
          playSend();
        } else {
          playReceive();

          // Send notification for messages from others
          if (isNotificationsEnabled()) {
            sendNotification("New Message", {
              body: `${msg.senderAvatar || "👤"} ${msg.content.substring(
                0,
                50
              )}${msg.content.length > 50 ? "..." : ""}`,
              tag: msg.id,
            });
          }
        }
      });
    }
    prevMessageCountRef.current = p2pMessages.length;
  }, [
    p2pMessages,
    walletState.address,
    playSend,
    playReceive,
    sendNotification,
    isNotificationsEnabled,
  ]);

  // Messages with pinned status
  const messagesWithPinStatus: UIMessage[] = p2pMessages.map((msg) => ({
    ...msg,
    isPinned: pinnedMessageIds.has(msg.id),
  }));

  // Get pinned messages
  const pinnedMessages = messagesWithPinStatus.filter((msg) => msg.isPinned);

  // Rooms with unread counts
  const roomsWithUnread = rooms.map((room) => ({
    ...room,
    unreadCount: unreadCounts[room.id] || 0,
  }));

  // Clear unread count when room is selected
  useEffect(() => {
    if (activeRoomId) {
      setUnreadCounts((prev) => ({
        ...prev,
        [activeRoomId]: 0,
      }));
    }
  }, [activeRoomId]);

  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar
          rooms={roomsWithUnread}
          activeRoomId={activeRoomId}
          onRoomSelect={setActiveRoomId}
          onCreateRoom={() => setRoomDialogOpen(true)}
          onManageKeys={() => setKeyDialogOpen(true)}
          onOpenSettings={() => setSettingsDialogOpen(true)}
          onAvatarChange={updateAvatar}
        />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <ConnectionStatus
                connected={p2pStatus === "connected"}
                network="P2P Network"
              />
              {/* Encryption Status */}
              {activeRoomId && (
                <EncryptionStatus
                  encryptionKey={activeRoomKey}
                  className="hidden sm:flex"
                />
              )}
              {/* Privacy Protection Badge */}
              <PrivacyBadge
                isProtected={isProtected}
                attemptCount={attemptCount}
                className="hidden md:flex"
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
              messages={messagesWithPinStatus}
              currentUserAddress={walletState.address}
              userAvatar={avatar}
              pinnedMessages={pinnedMessages}
              onPinMessage={handlePinMessage}
              onUnpinMessage={handleUnpinMessage}
            />
          </main>
          <MessageInput
            onSend={handleSendMessage}
            disabled={!activeRoomId || sendMessageMutation.isPending}
            encrypted={activeRoomId ? !!encryptionKeys[activeRoomId] : false}
            onEncryptingChange={setIsEncrypting}
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

      <SettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
      />

      {/* File Transfer Progress */}
      <FileTransferProgressBar transfers={fileTransfers} />

      {/* Encryption Animation Overlay */}
      <EncryptionAnimation isVisible={isEncrypting} />

      {/* Privacy Protection Overlay - Snapchat style blur when inactive */}
      <PrivacyOverlay
        isActive={isBlurred}
        message="Return to the window to view messages. Content is hidden for privacy protection."
      />
    </SidebarProvider>
  );
}
