import { Search, User } from 'lucide-react';
import { CategorySlider } from '@/components/CategorySlider';
import { BannerSlider } from '@/components/BannerSlider';
import { SectionRow } from '@/components/SectionRow';

const Home = () => {
  const categories = ['Action', 'Romance', 'Comedy', 'Thriller', 'Sci-Fi', 'Drama'];
  
  const banners = [
    {
      id: 1,
      title: 'Thor: Love and Thunder',
      subtitle: 'The God of Thunder returns in an epic adventure that will test his limits like never before.',
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=600&fit=crop',
      filmId: 1
    },
    {
      id: 2,
      title: 'Midnight Mystery',
      subtitle: 'A gripping thriller that will keep you on the edge of your seat until the very last moment.',
      image: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=1200&h=600&fit=crop',
      filmId: 2
    },
    {
      id: 3,
      title: 'Ocean Dreams',
      subtitle: 'Dive into an underwater adventure filled with wonder, mystery, and breathtaking visuals.',
      image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200&h=600&fit=crop',
      filmId: 3
    }
  ];

  const trendingNow = [
    {
      id: 1,
      title: 'Thor: Love and Thunder',
      poster: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&h=450&fit=crop',
      genre: 'Action',
      rating: 4.8,
      duration: '118 min',
      type: 'movie' as const
    },
    {
      id: 2,
      title: 'Murder Mystery',
      poster: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=300&h=450&fit=crop',
      genre: 'Mystery',
      rating: 4.2,
      duration: '97 min'
    },
    {
      id: 3,
      title: 'Ocean Adventure',
      poster: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=300&h=450&fit=crop',
      genre: 'Adventure',
      rating: 4.5,
      duration: '142 min'
    }
  ];

  const directorsPicks = [
    {
      id: 4,
      title: 'Starlight Dreams',
      poster: 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=300&h=450&fit=crop',
      genre: 'Fantasy',
      rating: 4.9,
      duration: '156 min',
      type: 'series' as const
    },
    {
      id: 5,
      title: 'Neon Nights',
      poster: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&h=450&fit=crop',
      genre: 'Thriller',
      rating: 4.6,
      duration: '134 min',
      type: 'movie' as const
    }
  ];

  const regionalFavourites = [
    {
      id: 6,
      title: 'Tamil Classic',
      poster: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=300&h=450&fit=crop',
      genre: 'Drama',
      rating: 4.7,
      duration: '142 min',
      type: 'movie' as const
    },
    {
      id: 7,
      title: 'Malayalam Masterpiece',
      poster: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=300&h=450&fit=crop',
      genre: 'Drama',
      rating: 4.8,
      duration: '128 min',
      type: 'movie' as const
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Welcome, Angeline 👋</h1>
          <p className="text-gray-400">Let's relax and watch a movie!</p>
        </div>
        <div className="w-12 h-12 bg-tiketx-gradient rounded-full flex items-center justify-center">
          <User size={24} className="text-white" />
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-6 mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search movies, series, shows..."
            className="w-full glass-card pl-12 pr-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-tiketx-blue"
          />
        </div>
      </div>

      {/* Banner Slider */}
      <BannerSlider banners={banners} />

      {/* Categories */}
      <div className="mb-8">
        <CategorySlider categories={categories} />
      </div>

      {/* Content Sections */}
      <SectionRow title="Trending Now" items={trendingNow} sectionId="trending" />
      <SectionRow title="Director's Picks" items={directorsPicks} sectionId="directors-picks" />
      <SectionRow title="Regional Favourites" items={regionalFavourites} sectionId="regional" />
    </div>
  );
};

export default Home;
