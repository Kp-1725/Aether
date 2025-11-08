import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { MessageList, type Message } from "@/components/message-list";
import { MessageInput } from "@/components/message-input";
import { WalletButton } from "@/components/wallet-button";
import { ConnectionStatus } from "@/components/connection-status";
import { ThemeToggle } from "@/components/theme-toggle";
import { WalletConnectionDialog } from "@/components/wallet-connection-dialog";
import { RoomCreationDialog } from "@/components/room-creation-dialog";
import { KeyManagementDialog } from "@/components/key-management-dialog";
import { connectWallet, disconnectWallet, encryptMessage, hashMessage, type WalletState } from "@/lib/web3";
import { useToast } from "@/hooks/use-toast";

// TODO: remove mock functionality
const MOCK_ROOMS = [
  { id: '1', name: 'general' },
  { id: '2', name: 'announcements' },
  { id: '3', name: 'random' },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  '1': [
    {
      id: '1',
      sender: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      content: 'Welcome to the decentralized chat! All messages are encrypted end-to-end.',
      timestamp: new Date(Date.now() - 3600000),
      verified: true,
    },
    {
      id: '2',
      sender: '0x9876543210987654321098765432109876543210',
      content: 'Thanks! How does the blockchain verification work?',
      timestamp: new Date(Date.now() - 1800000),
      verified: true,
    },
    {
      id: '3',
      sender: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      content: 'Each message hash is stored on-chain for verification, but the content stays encrypted locally.',
      timestamp: new Date(Date.now() - 900000),
      verified: true,
    },
  ],
  '2': [],
  '3': [],
};

export default function Chat() {
  const { toast } = useToast();
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    connected: false,
    balance: null,
  });
  const [activeRoomId, setActiveRoomId] = useState<string>('1');
  const [messages, setMessages] = useState<Record<string, Message[]>>(MOCK_MESSAGES);
  const [encryptionKey, setEncryptionKey] = useState<string | null>(null);
  
  const [walletDialogOpen, setWalletDialogOpen] = useState(false);
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [keyDialogOpen, setKeyDialogOpen] = useState(false);
  const [walletError, setWalletError] = useState<string>("");

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
    if (!walletState.address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to send messages",
        variant: "destructive",
      });
      return;
    }

    if (!encryptionKey) {
      toast({
        title: "No Encryption Key",
        description: "Please set an encryption key first",
        variant: "destructive",
      });
      setKeyDialogOpen(true);
      return;
    }

    // TODO: remove mock functionality - encrypt and send to blockchain
    const encryptedContent = encryptMessage(content, encryptionKey);
    const messageHash = hashMessage(encryptedContent);
    
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: walletState.address,
      content,
      timestamp: new Date(),
      verified: false,
    };

    setMessages(prev => ({
      ...prev,
      [activeRoomId]: [...(prev[activeRoomId] || []), newMessage],
    }));

    toast({
      title: "Message Sent",
      description: "Message encrypted and hash sent to blockchain",
    });

    console.log('Encrypted:', encryptedContent);
    console.log('Hash:', messageHash);
  };

  const handleCreateRoom = (roomName: string) => {
    // TODO: remove mock functionality
    console.log('Creating room:', roomName);
    toast({
      title: "Room Created",
      description: `Room "${roomName}" has been created`,
    });
  };

  const handleSetKey = (key: string) => {
    setEncryptionKey(key);
    toast({
      title: "Encryption Key Set",
      description: "Messages will now be encrypted with this key",
    });
  };

  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar
          rooms={MOCK_ROOMS}
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
            <MessageList 
              messages={messages[activeRoomId] || []} 
              currentUserAddress={walletState.address}
            />
          </main>
          <MessageInput 
            onSend={handleSendMessage}
            disabled={!walletState.connected}
            encrypted={!!encryptionKey}
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
        currentKey={encryptionKey}
        onSetKey={handleSetKey}
      />
    </SidebarProvider>
  );
}
