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
import {
  AvatarSelectionDialog,
  useUserAvatar,
} from "@/components/avatar-selection-dialog";
import { Separator } from "@/components/ui/separator";

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
  onOpenSettings: () => void;
  onAvatarChange?: (avatar: string) => void;
}

export function AppSidebar({
  rooms,
  activeRoomId,
  onRoomSelect,
  onCreateRoom,
  onManageKeys,
  onOpenSettings,
  onAvatarChange,
}: AppSidebarProps) {
  const { avatar } = useUserAvatar();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Decentralized Chat</h2>
        </div>
        {/* User Avatar Section */}
        <div className="flex items-center gap-3 mt-4 p-3 rounded-lg bg-muted/50">
          <AvatarSelectionDialog
            onAvatarChange={onAvatarChange}
            trigger={
              <button className="h-12 w-12 rounded-full bg-background border-2 border-primary/20 hover:border-primary/50 transition-colors flex items-center justify-center text-2xl shadow-sm hover:shadow-md">
                {avatar}
              </button>
            }
          />
          <div className="flex flex-col">
            <span className="text-sm font-medium">Your Avatar</span>
            <span className="text-xs text-muted-foreground">
              Click to change
            </span>
          </div>
        </div>
      </SidebarHeader>
      <Separator />
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
      <SidebarFooter className="p-4 space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={onManageKeys}
          data-testid="button-manage-keys"
        >
          <Key className="h-4 w-4" />
          Manage Encryption Keys
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={onOpenSettings}
          data-testid="button-settings"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
