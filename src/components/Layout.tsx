
import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { BottomNavigation } from './BottomNavigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { SidebarNavigation } from './SidebarNavigation';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const isAdmin = location.pathname.startsWith('/admin');
  const hideFooter = location.pathname.startsWith('/movie/');

  return (
    <div className="min-h-screen h-auto flex flex-row items-stretch bg-black text-white">
      {/* Only show sidebar on non-dashboard/admin pages and non-mobile */}
      {!isDashboard && !isAdmin && !isMobile && <SidebarNavigation />}
      <div
        className={`flex-1 w-0 min-w-0 flex flex-col transition-all duration-300 ${
          !isMobile && !isDashboard && !isAdmin ? 'ml-[var(--sidebar-width)]' : ''
        }`}
      >
        <main className={`flex-1 transition-all duration-300 ${
          isMobile ? 'pb-20' : ''
        }`}>
          {children}
        </main>
        {isMobile && !isDashboard && !isAdmin && <BottomNavigation />}
        {!hideFooter && <Footer className="w-full" />}
      </div>
    </div>
  );
};
