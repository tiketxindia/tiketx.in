
import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { BottomNavigation } from './BottomNavigation';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isAdmin = location.pathname.startsWith('/admin');
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen bg-tiketx-navy text-white">
      <div className="flex">
        <main className={`flex-1 ${isMobile ? 'pb-20' : ''}`}>
          {children}
        </main>
      </div>
      
      {isMobile && !isDashboard && !isAdmin && <BottomNavigation />}
    </div>
  );
};
