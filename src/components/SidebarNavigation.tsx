
import { Home, Search, Grid3X3, Bookmark, Ticket, Settings, Menu, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useState } from 'react';

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

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className={`hidden lg:flex fixed left-0 top-0 h-full glass-card m-4 rounded-2xl transition-all duration-300 z-40 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        <div className="flex flex-col w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <img src="/lovable-uploads/407505aa-5215-4c3d-ab75-8fd6ea8f6416.png" alt="TiketX" className="w-8 h-8" />
                <h1 className="text-xl font-bold">TiketX</h1>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {isCollapsed ? <Menu size={20} /> : <X size={20} />}
            </button>
          </div>
          
          {/* Navigation Items */}
          <div className="flex-1 py-6">
            <div className="space-y-2 px-3">
              {navItems.map(({ icon: Icon, label, path }) => (
                <NavLink
                  key={path}
                  to={path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? 'bg-tiketx-gradient text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  <Icon size={20} />
                  {!isCollapsed && <span className="font-medium">{label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Button */}
      <button className="lg:hidden fixed top-4 left-4 z-50 glass-card p-3 rounded-xl">
        <Menu size={20} />
      </button>
    </>
  );
};
