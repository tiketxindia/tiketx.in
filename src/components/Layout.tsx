
import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { BottomNavigation } from './BottomNavigation';
import { SideNavigation } from './SideNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <div className="min-h-screen bg-tiketx-navy text-white">
      <div className="flex">
        {!isMobile && isDashboard && <SideNavigation />}
        
        <main className={`flex-1 ${!isMobile && isDashboard ? 'ml-64' : ''} ${isMobile ? 'pb-20' : ''}`}>
          {children}
        </main>
      </div>
      
      {isMobile && !isDashboard && <BottomNavigation />}
    </div>
  );
};
