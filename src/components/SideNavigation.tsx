
import { Home, Upload, Film, TrendingUp, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export const SideNavigation = () => {
  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Upload, label: 'Upload Film', path: '/dashboard/upload' },
    { icon: Film, label: 'My Films', path: '/dashboard/films' },
    { icon: TrendingUp, label: 'Revenue', path: '/dashboard/revenue' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' }
  ];

  return (
    <nav className="fixed left-0 top-0 h-full w-64 glass-card m-4 rounded-2xl p-6">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 bg-tiketx-gradient rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-lg">T</span>
        </div>
        <h1 className="text-xl font-bold">TiketX Director</h1>
      </div>
      
      <div className="space-y-2">
        {navItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-tiketx-gradient text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`
            }
          >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
