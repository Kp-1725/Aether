import { useState } from "react";
import { Wallet, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { truncateAddress } from "@/lib/web3";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WalletButtonProps {
  address: string | null;
  connected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function WalletButton({ address, connected, onConnect, onDisconnect }: WalletButtonProps) {
  if (!connected || !address) {
    return (
      <Button onClick={onConnect} data-testid="button-connect-wallet">
        <Wallet className="h-4 w-4 mr-2" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" data-testid="button-wallet-menu">
          <Wallet className="h-4 w-4 mr-2" />
          {truncateAddress(address)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Wallet</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="font-mono text-xs" data-testid="text-wallet-address">
          {address}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDisconnect} data-testid="button-disconnect-wallet">
          <LogOut className="h-4 w-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
