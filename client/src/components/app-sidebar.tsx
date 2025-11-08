import { Hash, Plus, Key, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Room {
  id: string;
  name: string;
  unreadCount?: number;
}

interface AppSidebarProps {
  rooms: Room[];
  activeRoomId: string | null;
  onRoomSelect: (roomId: string) => void;
  onCreateRoom: () => void;
  onManageKeys: () => void;
}

export function AppSidebar({ 
  rooms, 
  activeRoomId, 
  onRoomSelect, 
  onCreateRoom,
  onManageKeys 
}: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Decentralized Chat</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between">
            <span>Rooms</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={onCreateRoom}
              data-testid="button-create-room"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {rooms.map((room) => (
                <SidebarMenuItem key={room.id}>
                  <SidebarMenuButton 
                    onClick={() => onRoomSelect(room.id)}
                    isActive={activeRoomId === room.id}
                    data-testid={`button-room-${room.id}`}
                  >
                    <Hash className="h-4 w-4" />
                    <span>{room.name}</span>
                    {room.unreadCount ? (
                      <Badge variant="default" className="ml-auto">
                        {room.unreadCount}
                      </Badge>
                    ) : null}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2"
          onClick={onManageKeys}
          data-testid="button-manage-keys"
        >
          <Key className="h-4 w-4" />
          Manage Encryption Keys
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
