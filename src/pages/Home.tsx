
import { Search, User } from 'lucide-react';
import { CategorySlider } from '@/components/CategorySlider';
import { HeroBannerSlider } from '@/components/HeroBannerSlider';
import { SectionRowCarousel } from '@/components/SectionRowCarousel';

const Home = () => {
  const categories = ['Action', 'Romance', 'Comedy', 'Thriller', 'Sci-Fi', 'Drama'];
  
  const heroBanners = [
    {
      id: 1,
      title: 'THOR: LOVE AND THUNDER',
      year: '2024',
      language: 'English',
      duration: '1h 53m',
      certificate: 'U/A 16+',
      description: 'The God of Thunder returns in an epic adventure that will test his limits like never before. An intergalactic journey filled with action, humor, and heart.',
      genres: ['Action', 'Adventure', 'Fantasy'],
      backgroundImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=600&fit=crop',
      posterImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&h=450&fit=crop',
      filmId: 1,
      hasTicket: false,
      rating: 4.8,
      imdbRating: 6.3
    },
    {
      id: 2,
      title: 'EVERY BODY',
      year: '2023',
      language: 'English',
      duration: '1h 28m',
      certificate: 'U/A 18+',
      description: 'From silenced childhoods marked by harmful surgeries, three intersex adults share their stories of resilience and triumph.',
      genres: ['Documentary', 'Biography', 'True Crime', 'LGBTQ+'],
      backgroundImage: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=1200&h=600&fit=crop',
      posterImage: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=300&h=450&fit=crop',
      filmId: 2,
      hasTicket: true,
      ticketExpiry: '05 Jul, 11:30 PM',
      rating: 4.3,
      imdbRating: 7.2
    },
    {
      id: 3,
      title: 'OCEAN DREAMS',
      year: '2024',
      language: 'Hindi',
      duration: '2h 22m',
      certificate: 'U',
      description: 'Dive into an underwater adventure filled with wonder, mystery, and breathtaking visuals that will transport you to another world.',
      genres: ['Adventure', 'Family', 'Fantasy'],
      backgroundImage: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200&h=600&fit=crop',
      posterImage: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=300&h=450&fit=crop',
      filmId: 3,
      hasTicket: false,
      rating: 4.5,
      imdbRating: 6.8
    }
  ];

  const latestReleases = [
    {
      id: 1,
      title: 'Thor: Love and Thunder',
      poster: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&h=450&fit=crop',
      genre: 'Action',
      rating: 4.8,
      duration: '118 min',
      year: '2024',
      certificate: 'U/A 16+',
      language: 'English',
      description: 'The God of Thunder returns in an epic adventure that will test his limits like never before.',
      type: 'movie' as const,
      hasTicket: false,
      votes: 2847
    },
    {
      id: 2,
      title: 'Murder Mystery',
      poster: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=300&h=450&fit=crop',
      genre: 'Mystery',
      rating: 4.2,
      duration: '97 min',
      year: '2023',
      certificate: 'U/A 16+',
      language: 'English',
      description: 'A gripping thriller that will keep you on the edge of your seat.',
      hasTicket: true,
      ticketExpiry: '15 Jul, 10:00 PM',
      votes: 1456
    },
    {
      id: 3,
      title: 'Ocean Adventure',
      poster: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=300&h=450&fit=crop',
      genre: 'Adventure',
      rating: 4.5,
      duration: '142 min',
      year: '2024',
      certificate: 'U',
      language: 'Hindi',
      description: 'An underwater adventure filled with wonder and mystery.',
      hasTicket: false,
      votes: 987
    },
    {
      id: 4,
      title: 'Urban Chronicles',
      poster: 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=300&h=450&fit=crop',
      genre: 'Drama',
      rating: 4.6,
      duration: '128 min',
      year: '2024',
      certificate: 'U/A 16+',
      language: 'Tamil',
      description: 'A compelling urban drama that explores modern relationships.',
      type: 'series' as const,
      hasTicket: false,
      votes: 3421
    }
  ];

  const actionPicks = [
    {
      id: 5,
      title: 'Starlight Dreams',
      poster: 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=300&h=450&fit=crop',
      genre: 'Fantasy',
      rating: 4.9,
      duration: '156 min',
      year: '2024',
      certificate: 'U/A 13+',
      language: 'English',
      description: 'An epic fantasy adventure that will take you to new worlds.',
      type: 'series' as const,
      hasTicket: false,
      votes: 5632
    },
    {
      id: 6,
      title: 'Neon Nights',
      poster: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&h=450&fit=crop',
      genre: 'Thriller',
      rating: 4.6,
      duration: '134 min',
      year: '2023',
      certificate: 'A',
      language: 'English',
      description: 'A cyberpunk thriller set in a neon-lit future.',
      type: 'movie' as const,
      hasTicket: true,
      ticketExpiry: '20 Jul, 9:45 PM',
      votes: 2198
    }
  ];

  const shortFilms = [
    {
      id: 7,
      title: 'Morning Coffee',
      poster: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=300&h=450&fit=crop',
      genre: 'Drama',
      rating: 4.3,
      duration: '15 min',
      year: '2024',
      certificate: 'U',
      language: 'Hindi',
      description: 'A heartwarming short film about everyday connections.',
      type: 'short' as const,
      hasTicket: false,
      votes: 456
    },
    {
      id: 8,
      title: 'The Last Dance',
      poster: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=300&h=450&fit=crop',
      genre: 'Romance',
      rating: 4.7,
      duration: '22 min',
      year: '2024',
      certificate: 'U/A 13+',
      language: 'English',
      description: 'A beautiful story about love and letting go.',
      type: 'short' as const,
      hasTicket: false,
      votes: 789
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Main Content - Responsive to sidebar */}
      <div className="transition-all duration-300">
        {/* Desktop & Tablet Search & User - Top Bar */}
        <div className="hidden md:flex items-center justify-between p-6 bg-black/30 backdrop-blur-lg border-b border-white/20">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search movies, series, shows..."
                className="w-full bg-black/40 border border-white/30 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-tiketx-blue focus:border-transparent backdrop-blur-lg"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-lg font-semibold bg-gradient-to-r from-tiketx-blue via-tiketx-violet to-tiketx-pink bg-clip-text text-transparent">
              Welcome, Angeline 👋
            </span>
            <div className="w-10 h-10 bg-tiketx-gradient rounded-full flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
          </div>
        </div>

        {/* Hero Banner Slider */}
        <HeroBannerSlider banners={heroBanners} showMobileOverlay />

        {/* Categories - hidden on mobile */}
        <div className="hidden md:block mb-8">
          <CategorySlider categories={categories} />
        </div>

        {/* Content Sections */}
        <SectionRowCarousel title="Now Showing" items={latestReleases} sectionId="latest" />
        <SectionRowCarousel title="Action Picks" items={actionPicks} sectionId="action" />
        <SectionRowCarousel title="Short Films" items={shortFilms} sectionId="shorts" />
      </div>
    </div>
  );
};

export default Home;
