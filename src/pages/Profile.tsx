
import { User, Calendar, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();

  const user = {
    name: 'Angeline Johnson',
    email: 'angeline@example.com',
    avatar: null
  };

  const ticketHistory = [
    {
      id: 1,
      title: 'Thor: Love and Thunder',
      type: 'Series',
      status: 'Active',
      purchaseDate: '2024-01-15',
      expiryDate: '2024-07-15',
      poster: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&h=150&fit=crop'
    },
    {
      id: 2,
      title: 'Midnight Mystery',
      type: 'Movie',
      status: 'Expired',
      purchaseDate: '2024-01-10',
      expiryDate: '2024-01-12',
      poster: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=100&h=150&fit=crop'
    },
    {
      id: 3,
      title: 'Ocean Dreams',
      type: 'Movie',
      status: 'Active',
      purchaseDate: '2024-01-20',
      expiryDate: '2024-07-20',
      poster: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=100&h=150&fit=crop'
    }
  ];

  return (
    <div className="min-h-screen p-6">
      {/* Profile Header */}
      <div className="glass-card p-6 mb-6 text-center">
        <div className="w-24 h-24 bg-tiketx-gradient rounded-full flex items-center justify-center mx-auto mb-4">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
          ) : (
            <User size={40} className="text-white" />
          )}
        </div>
        <h1 className="text-2xl font-bold mb-2">{user.name}</h1>
        <p className="text-gray-400">{user.email}</p>
      </div>

      {/* Ticket History */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Calendar className="mr-2" size={20} />
          Ticket History
        </h2>
        
        <div className="space-y-4">
          {ticketHistory.map((ticket) => (
            <div key={ticket.id} className="flex items-center space-x-4 p-4 glass-card rounded-xl">
              <img
                src={ticket.poster}
                alt={ticket.title}
                className="w-16 h-24 object-cover rounded-lg"
              />
              
              <div className="flex-1">
                <h3 className="font-semibold">{ticket.title}</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-400 mt-1">
                  <span className="bg-tiketx-violet/20 text-tiketx-violet px-2 py-1 rounded">
                    {ticket.type}
                  </span>
                  <span className={`px-2 py-1 rounded ${
                    ticket.status === 'Active' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
                <div className="text-sm text-gray-400 mt-2">
                  <p>Purchased: {new Date(ticket.purchaseDate).toLocaleDateString()}</p>
                  <p>Expires: {new Date(ticket.expiryDate).toLocaleDateString()}</p>
                </div>
              </div>
              
              {ticket.status === 'Active' && (
                <button 
                  className="gradient-button text-sm px-4 py-2"
                  onClick={() => navigate(`/watch/${ticket.id}`)}
                >
                  Watch
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Settings className="mr-2" size={20} />
          Settings
        </h2>
        
        <div className="space-y-4">
          <button className="w-full text-left p-4 glass-card rounded-xl hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-between">
              <span>Change Password</span>
              <span className="text-gray-400">→</span>
            </div>
          </button>
          
          <div className="p-4 glass-card rounded-xl">
            <div className="flex items-center justify-between">
              <span>Email Notifications</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tiketx-blue"></div>
              </label>
            </div>
          </div>
          
          <button className="w-full text-left p-4 glass-card rounded-xl hover:bg-white/10 transition-colors text-red-400">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <LogOut className="mr-2" size={20} />
                <span>Logout</span>
              </div>
              <span className="text-gray-400">→</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
