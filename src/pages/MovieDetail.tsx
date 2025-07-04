
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, Calendar } from 'lucide-react';
import { EpisodeList } from '@/components/EpisodeList';
import { CastList } from '@/components/CastList';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock movie/series data
  const content = {
    id: 1,
    title: 'Thor: Love and Thunder',
    type: 'series', // 'movie' or 'series'
    poster: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=1200&fit=crop',
    banner: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&h=600&fit=crop',
    genre: ['Action', 'Adventure', 'Fantasy'],
    rating: 4.8,
    imdbRating: 6.3,
    runtime: '118 min',
    description: 'Thor embarks on a journey unlike anything he has ever faced – a quest for inner peace. However, his retirement gets interrupted by Gorr the God Butcher, a galactic killer who seeks the extinction of the gods.',
    price: '$12.99',
    availableUntil: '2024-07-15T23:59:59'
  };

  const episodes = content.type === 'series' ? [
    {
      id: 1,
      title: 'The Beginning of the End',
      duration: '45 min',
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&h=120&fit=crop',
      episodeNumber: 1,
      hasAccess: true,
      description: 'Thor discovers a new threat that could destroy everything he holds dear.'
    },
    {
      id: 2,
      title: 'Gods and Monsters',
      duration: '42 min',
      thumbnail: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=200&h=120&fit=crop',
      episodeNumber: 2,
      hasAccess: true,
      description: 'The battle intensifies as ancient powers awaken.'
    },
    {
      id: 3,
      title: 'Thunder and Lightning',
      duration: '48 min',
      thumbnail: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=200&h=120&fit=crop',
      episodeNumber: 3,
      hasAccess: false,
      description: 'The final confrontation approaches. Purchase to unlock.'
    }
  ] : [];

  const cast = [
    { id: 1, name: 'Chris Hemsworth', role: 'Thor' },
    { id: 2, name: 'Natalie Portman', role: 'Jane Foster' },
    { id: 3, name: 'Christian Bale', role: 'Gorr' },
    { id: 4, name: 'Tessa Thompson', role: 'Valkyrie' }
  ];

  const crew = [
    { id: 1, name: 'Taika Waititi', role: 'Director' },
    { id: 2, name: 'Jennifer Kaytin Robinson', role: 'Writer' },
    { id: 3, name: 'Kevin Feige', role: 'Producer' }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <button 
          onClick={() => navigate(-1)}
          className="glass-card p-3 rounded-xl hover:bg-white/20 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold">
          {content.type === 'series' ? 'Series Details' : 'Movie Details'}
        </h1>
        <div className="w-10 h-10" />
      </div>

      {/* Hero Banner */}
      <div className="relative mb-6">
        <div className="h-[300px] md:h-[400px] relative overflow-hidden rounded-2xl mx-6">
          <img
            src={content.banner}
            alt={content.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          <div className="absolute inset-0 flex items-center justify-center">
            <button className="gradient-button flex items-center space-x-2 text-lg">
              <Play size={24} />
              <span>Watch Trailer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Info */}
      <div className="px-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-3">{content.title}</h1>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {content.genre.map((g) => (
              <span key={g} className="bg-tiketx-violet/20 text-tiketx-violet px-3 py-1 rounded-lg text-sm">
                {g}
              </span>
            ))}
            {content.type === 'series' && (
              <span className="bg-tiketx-blue/20 text-tiketx-blue px-3 py-1 rounded-lg text-sm">
                Series
              </span>
            )}
          </div>

          <div className="flex items-center space-x-6 text-gray-300">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-400">⭐</span>
              <span>{content.rating}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-yellow-400">📺</span>
              <span>IMDb {content.imdbRating}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar size={16} />
              <span>{content.runtime}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Synopsis</h3>
          <p className="text-gray-300 leading-relaxed">{content.description}</p>
        </div>

        {/* Cast & Crew */}
        <CastList cast={cast} crew={crew} />

        {/* Episodes (if series) */}
        {content.type === 'series' && episodes.length > 0 && (
          <EpisodeList episodes={episodes} seriesId={content.id} />
        )}

        {/* Pricing & CTA */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">
                {content.type === 'series' ? 'Full Series Access' : 'Limited Time Access'}
              </p>
              <p className="text-2xl font-bold text-tiketx-blue">{content.price}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Available until</p>
              <p className="text-sm font-semibold">July 15, 2024</p>
            </div>
          </div>
          
          <button 
            className="gradient-button w-full text-lg py-4"
            onClick={() => navigate(`/watch/${content.id}`)}
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
