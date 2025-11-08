import { AppSidebar } from '../app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function AppSidebarExample() {
  const rooms = [
    { id: '1', name: 'general', unreadCount: 3 },
    { id: '2', name: 'announcements', unreadCount: 0 },
    { id: '3', name: 'random', unreadCount: 1 },
  ];

  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-[500px] w-full border rounded-md">
        <AppSidebar
          rooms={rooms}
          activeRoomId="1"
          onRoomSelect={(id) => console.log('Room selected:', id)}
          onCreateRoom={() => console.log('Create room clicked')}
          onManageKeys={() => console.log('Manage keys clicked')}
        />
      </div>
    </SidebarProvider>
  );
}
