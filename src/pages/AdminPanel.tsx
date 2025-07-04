
import { useState } from 'react';
import { Upload, Image, Users, BarChart3, Settings, Plus, Edit, Trash2 } from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: BarChart3 },
    { id: 'banners', label: 'Homepage Banners', icon: Image },
    { id: 'sections', label: 'Homepage Sections', icon: Settings },
    { id: 'creators', label: 'Manage Creators', icon: Users },
    { id: 'sales', label: 'Viewers & Sales', icon: BarChart3 }
  ];

  const banners = [
    {
      id: 1,
      title: 'Thor: Love and Thunder',
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=200&fit=crop',
      filmId: 1,
      order: 1
    },
    {
      id: 2,
      title: 'Midnight Mystery',
      image: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=400&h=200&fit=crop',
      filmId: 2,
      order: 2
    }
  ];

  const sections = [
    { id: 1, name: 'Trending Now', filmCount: 8, order: 1 },
    { id: 2, name: 'Director\'s Picks', filmCount: 5, order: 2 },
    { id: 3, name: 'Regional Favourites', filmCount: 12, order: 3 }
  ];

  const creators = [
    {
      id: 1,
      name: 'John Director',
      email: 'john@example.com',
      status: 'Approved',
      filmsCount: 3,
      totalRevenue: '$2,450'
    },
    {
      id: 2,
      name: 'Sarah Producer',
      email: 'sarah@example.com',
      status: 'Pending',
      filmsCount: 1,
      totalRevenue: '$0'
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-2">Total Films</h3>
                <p className="text-3xl font-bold text-tiketx-blue">142</p>
              </div>
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-2">Active Creators</h3>
                <p className="text-3xl font-bold text-tiketx-violet">28</p>
              </div>
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
                <p className="text-3xl font-bold text-green-400">$45,230</p>
              </div>
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-2">Active Users</h3>
                <p className="text-3xl font-bold text-tiketx-pink">1,850</p>
              </div>
            </div>
          </div>
        );

      case 'banners':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Homepage Banners</h2>
              <button className="gradient-button flex items-center space-x-2">
                <Plus size={20} />
                <span>Add Banner</span>
              </button>
            </div>

            <div className="grid gap-4">
              {banners.map((banner) => (
                <div key={banner.id} className="glass-card p-4 flex items-center space-x-4">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-32 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">{banner.title}</h3>
                    <p className="text-sm text-gray-400">Order: {banner.order}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 bg-tiketx-blue/20 text-tiketx-blue rounded-lg hover:bg-tiketx-blue/30 transition-colors">
                      <Edit size={16} />
                    </button>
                    <button className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'sections':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Homepage Sections</h2>
              <button className="gradient-button flex items-center space-x-2">
                <Plus size={20} />
                <span>Add Section</span>
              </button>
            </div>

            <div className="grid gap-4">
              {sections.map((section) => (
                <div key={section.id} className="glass-card p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{section.name}</h3>
                    <p className="text-sm text-gray-400">{section.filmCount} films • Order: {section.order}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 bg-tiketx-blue/20 text-tiketx-blue rounded-lg hover:bg-tiketx-blue/30 transition-colors">
                      <Edit size={16} />
                    </button>
                    <button className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'creators':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Manage Creators</h2>

            <div className="grid gap-4">
              {creators.map((creator) => (
                <div key={creator.id} className="glass-card p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{creator.name}</h3>
                      <p className="text-sm text-gray-400">{creator.email}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm">
                        <span>{creator.filmsCount} films</span>
                        <span>Revenue: {creator.totalRevenue}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-lg text-sm ${
                        creator.status === 'Approved' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {creator.status}
                      </span>
                      <div className="flex space-x-2">
                        <button className="gradient-button text-sm px-3 py-1">
                          {creator.status === 'Approved' ? 'Edit' : 'Approve'}
                        </button>
                        <button className="bg-red-500/20 text-red-400 text-sm px-3 py-1 rounded-lg hover:bg-red-500/30 transition-colors">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'sales':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Viewers & Ticket Sales</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Sales</h3>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex justify-between items-center p-3 glass-card rounded-lg">
                      <div>
                        <p className="font-medium">Thor: Love and Thunder</p>
                        <p className="text-sm text-gray-400">Purchased by user@email.com</p>
                      </div>
                      <span className="text-tiketx-blue font-semibold">$12.99</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Top Performing Films</h3>
                <div className="space-y-3">
                  {[
                    { title: 'Thor: Love and Thunder', sales: 156, revenue: '$1,872' },
                    { title: 'Ocean Dreams', sales: 89, revenue: '$1,068' },
                    { title: 'Starlight Noir', sales: 67, revenue: '$804' }
                  ].map((film, i) => (
                    <div key={i} className="flex justify-between items-center p-3 glass-card rounded-lg">
                      <div>
                        <p className="font-medium">{film.title}</p>
                        <p className="text-sm text-gray-400">{film.sales} tickets sold</p>
                      </div>
                      <span className="text-green-400 font-semibold">{film.revenue}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-tiketx-navy">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 glass-card m-4 rounded-2xl p-6 h-fit">
          <div className="flex items-center space-x-3 mb-8">
            <img src="/lovable-uploads/407505aa-5215-4c3d-ab75-8fd6ea8f6416.png" alt="TiketX" className="w-10 h-10" />
            <h1 className="text-xl font-bold">TiketX Admin</h1>
          </div>
          
          <nav className="space-y-2">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === id
                    ? 'bg-tiketx-gradient text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
