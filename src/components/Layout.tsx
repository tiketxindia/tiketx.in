
import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { BottomNavigation } from './BottomNavigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarNavigation } from './SidebarNavigation';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex">
        {/* Only show sidebar on non-dashboard/admin pages and non-mobile */}
        {!isDashboard && !isAdmin && !isMobile && <SidebarNavigation />}
        
        <main className={`flex-1 transition-all duration-300 ${
          isMobile ? 'pb-20' : ''
        } ${!isDashboard && !isAdmin && !isMobile ? 'lg:ml-0' : ''}`}>
          {children}
        </main>
      </div>
      
      {isMobile && !isDashboard && !isAdmin && <BottomNavigation />}
    </div>
  );
};
