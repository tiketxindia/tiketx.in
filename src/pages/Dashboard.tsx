
import { TrendingUp, Film, Upload, DollarSign } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { title: 'Total Films', value: '12', icon: Film, color: 'text-tiketx-blue' },
    { title: 'Total Sales', value: '$2,845', icon: DollarSign, color: 'text-green-400' },
    { title: 'Active Screenings', value: '8', icon: TrendingUp, color: 'text-tiketx-violet' },
    { title: 'This Month', value: '$1,240', icon: Upload, color: 'text-tiketx-pink' }
  ];

  const films = [
    {
      id: 1,
      title: 'Midnight in Paris',
      status: 'Active',
      ticketsSold: 156,
      revenue: '$1,872',
      poster: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=100&h=150&fit=crop'
    },
    {
      id: 2,
      title: 'Ocean Dreams',
      status: 'Pending',
      ticketsSold: 0,
      revenue: '$0',
      poster: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=100&h=150&fit=crop'
    },
    {
      id: 3,
      title: 'Starlight Noir',
      status: 'Active',
      ticketsSold: 89,
      revenue: '$1,068',
      poster: 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=100&h=150&fit=crop'
    }
  ];

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Director Dashboard</h1>
        <p className="text-gray-400">Manage your films and track performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(({ title, value, icon: Icon, color }) => (
          <div key={title} className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <Icon className={`${color} w-6 h-6`} />
              <span className="text-2xl font-bold">{value}</span>
            </div>
            <p className="text-gray-400 text-sm">{title}</p>
          </div>
        ))}
      </div>

      {/* Films Table */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Your Films</h2>
          <button className="gradient-button">
            Upload New Film
          </button>
        </div>

        <div className="space-y-4">
          {films.map((film) => (
            <div key={film.id} className="flex items-center space-x-4 p-4 glass-card rounded-xl hover:bg-white/10 transition-colors">
              <img
                src={film.poster}
                alt={film.title}
                className="w-16 h-24 object-cover rounded-lg"
              />
              
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{film.title}</h3>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                  <span className={`px-2 py-1 rounded-lg ${
                    film.status === 'Active' 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {film.status}
                  </span>
                  <span>{film.ticketsSold} tickets sold</span>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-xl font-bold text-tiketx-blue">{film.revenue}</p>
                <p className="text-sm text-gray-400">Revenue</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
