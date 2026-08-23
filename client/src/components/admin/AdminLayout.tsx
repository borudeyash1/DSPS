import { useState } from 'react';
import PageSwitcherFloater from './PageSwitcherFloater';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-muted">
      <AdminSidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <main className={`flex-1 p-8 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <Outlet />
      </main>
      <PageSwitcherFloater isSidebarCollapsed={isSidebarCollapsed} />
    </div>
  );
};

export default AdminLayout;
