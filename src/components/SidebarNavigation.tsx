
import { Home, Search, Grid3X3, Bookmark, Ticket, Settings, Menu, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';

export const SidebarNavigation = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Grid3X3, label: 'Categories', path: '/categories' },
    { icon: Bookmark, label: 'Watchlist', path: '/watchlist' },
    { icon: Ticket, label: 'My Tickets', path: '/my-tickets' },
    { icon: Settings, label: 'Settings', path: '/settings' }
  ];

  // Add CSS custom property to communicate collapsed state to the document
  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', isCollapsed ? '80px' : '288px');
  }, [isCollapsed]);

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className={`hidden lg:flex fixed left-0 top-0 h-full bg-black/60 backdrop-blur-lg border-r border-white/20 transition-all duration-300 z-40 ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}>
        <div className="flex flex-col w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <img src="/lovable-uploads/407505aa-5215-4c3d-ab75-8fd6ea8f6416.png" alt="TiketX" className="w-10 h-10" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-tiketx-blue via-tiketx-violet to-tiketx-pink bg-clip-text text-transparent">
                  TiketX
                </h1>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {isCollapsed ? <Menu size={24} /> : <X size={24} />}
            </button>
          </div>
          
          {/* Navigation Items */}
          <div className="flex-1 py-8">
            <div className="space-y-3 px-4">
              {navItems.map(({ icon: Icon, label, path }) => (
                <NavLink
                  key={path}
                  to={path}
                  className={({ isActive }) =>
                    `flex items-center space-x-4 px-4 py-4 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-tiketx-blue/20 via-tiketx-violet/20 to-tiketx-pink/20 text-white border border-white/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  <Icon size={24} />
                  {!isCollapsed && <span className="font-medium text-lg">{label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};
