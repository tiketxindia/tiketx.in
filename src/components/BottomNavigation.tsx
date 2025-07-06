
import { Home, Search, Film, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export const BottomNavigation = () => {
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: Film, label: 'My Movies', path: '/my-movies' },
    { icon: User, label: 'Profile', path: '/profile' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full glass-card rounded-2xl pb-[env(safe-area-inset-bottom)] min-h-[64px] z-50">
      <div className="flex justify-around items-center py-3">
        {navItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-tiketx-blue bg-tiketx-blue/20'
                  : 'text-gray-400 hover:text-white'
              }`
            }
          >
            <Icon size={20} />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
