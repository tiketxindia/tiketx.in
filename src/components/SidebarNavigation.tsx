
import { Home, Search, Grid3X3, Bookmark, Ticket, Settings, Menu, X, ChevronLeft } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';

export const SidebarNavigation = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Bookmark, label: 'Watchlist', path: '/watchlist' },
    { icon: Ticket, label: 'My Tikets', path: '/my-tikets' },
    { icon: Settings, label: 'Settings', path: '/settings' }
  ];

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
          <div className="flex-1 py-8">
            <div className="space-y-3 px-4">
              {navItems.map(({ icon: Icon, label, path }) => (
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
          </div>
        </div>
      </nav>
    </>
  );
};
