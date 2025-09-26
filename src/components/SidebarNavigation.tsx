
import { Home, Search, Grid3X3, Bookmark, Ticket, Settings, Menu, X, ChevronLeft } from 'lucide-react';
import { LuLayoutDashboard } from 'react-icons/lu';
import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const SidebarNavigation = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hasSubmissions, setHasSubmissions] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user has film submissions
  useEffect(() => {
    const checkSubmissions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('film_submissions')
            .select('id')
            .eq('user_id', user.id)
            .limit(1);
          
          if (!error && data && data.length > 0) {
            setHasSubmissions(true);
          } else {
            setHasSubmissions(false);
          }
        } else {
          setHasSubmissions(false);
        }
      } catch (error) {
        console.error('Error checking submissions:', error);
        setHasSubmissions(false);
      } finally {
        setLoading(false);
      }
    };

    checkSubmissions();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        checkSubmissions();
      }
    });

    // Listen for film submission events
    const handleFilmSubmission = () => {
      checkSubmissions();
    };

    window.addEventListener('filmSubmitted', handleFilmSubmission);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('filmSubmitted', handleFilmSubmission);
    };
  }, []);

  const baseNavItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Bookmark, label: 'Watchlist', path: '/watchlist' },
    { icon: Ticket, label: 'My Tikets', path: '/my-tikets' },
    { icon: Settings, label: 'Settings', path: '/settings' }
  ];

  // Add Creator Dashboard at the bottom if user has submissions
  const creatorNavItems = hasSubmissions ? [
    { icon: LuLayoutDashboard, label: 'Creator Dashboard', path: '/creator' }
  ] : [];

  const navItems = [...baseNavItems, ...creatorNavItems];

  // Add CSS custom property to communicate collapsed state to the document
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', isCollapsed ? '80px' : '220px');
  }, [isCollapsed]);

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className={`hidden md:flex fixed top-0 left-0 h-screen bg-black/60 backdrop-blur-lg border-r border-white/20 transition-all duration-300 z-50 min-w-[var(--sidebar-width)] max-w-[var(--sidebar-width)]`}>
        <div className="flex flex-col w-full">
          {/* Header */}
          <div className={`p-6 border-b border-white/20 ${isCollapsed ? 'flex items-center justify-center' : 'flex items-center justify-between'}`}>
            {!isCollapsed && (
              <div className="flex items-center w-full">
                <img 
                  src="/tiketx-logo-text.png" 
                  alt="TiketX Logo" 
                  className="h-[41px] w-auto max-w-[232px] object-contain" 
                  style={{ minWidth: 0 }}
                />
              </div>
            )}
            <div className={`${isCollapsed ? '' : 'flex items-center justify-center h-[41px] w-[41px]'}`}>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-[7px] hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center"
              >
                {isCollapsed ? <Menu size={21} /> : <ChevronLeft size={21} />}
              </button>
            </div>
          </div>
          
          {/* Navigation Items */}
          <div className="flex-1 py-8 flex flex-col">
            <div className="space-y-3 px-4 flex-1">
              {baseNavItems.map(({ icon: Icon, label, path }) => (
                <NavLink
                  key={path}
                  to={path}
                  className={({ isActive }) =>
                    `flex ${isCollapsed ? 'flex-col items-center justify-center' : 'flex-row items-center'} px-4 py-2 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-tiketx-blue/20 via-tiketx-violet/20 to-tiketx-pink/20 text-white border border-white/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  <div className="flex items-center justify-center w-[41px] h-[41px] rounded-lg transition-all duration-200">
                    <Icon size={21} />
                  </div>
                  {!isCollapsed && <span className="font-medium text-lg ml-4">{label}</span>}
                </NavLink>
              ))}
            </div>
            
            {/* Creator Dashboard at bottom */}
            {hasSubmissions && (
              <div className="px-4 pb-4">
                <NavLink
                  to="/creator"
                  className={({ isActive }) =>
                    `flex ${isCollapsed ? 'flex-col items-center justify-center' : 'flex-row items-center'} px-4 py-2 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-tiketx-blue/20 via-tiketx-violet/20 to-tiketx-pink/20 text-white border border-white/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  <div className="flex items-center justify-center w-[41px] h-[41px] rounded-lg transition-all duration-200">
                    <LuLayoutDashboard size={21} />
                  </div>
                  {!isCollapsed && <span className="font-medium text-lg ml-4">Creator Dashboard</span>}
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};
