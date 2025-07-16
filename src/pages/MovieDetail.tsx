
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
          Film Details
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
      <div className="px-6 space-y-6 pb-28 md:pb-28 pb-32">
        <div>
          <h1 className="text-3xl font-bold mb-3">{content.title}</h1>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {Array.isArray(content.genre) ? content.genre.map((g) => (
              <span key={g} className="bg-transparent text-white px-3 py-1 rounded-lg text-sm font-medium border border-white/20">
                {g}
              </span>
            )) : null}
          </div>

          <div className="flex items-center gap-3 text-base font-semibold text-white mb-4">
            <span className="flex items-center gap-1">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-300"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              {content.runtime}
            </span>
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
      </div>
      {/* Sticky Pricing & CTA Bar */}
      <div
        className="fixed bottom-0 left-0 w-full z-50 pointer-events-none movie-buy-bar"
        style={{ pointerEvents: 'none' }}
      >
        {/* Mobile sticky bar: centered, 75% width, zoomed out */}
        <div
          className="w-full flex justify-center mb-20 md:mb-0"
          style={{
            marginLeft: 'var(--sidebar-width, 0px)',
            width: 'calc(100% - var(--sidebar-width, 0px))',
            transition: 'margin-left 0.2s, width 0.2s',
          }}
        >
          <div className="bg-black/90 w-full max-w-none rounded-t-2xl rounded-b-none flex items-center justify-between shadow-2xl px-4 py-2 pb-6 pt-5 pointer-events-auto md:w-full md:mx-0 md:static md:translate-x-0 md:left-0 md:w-full fixed left-1/2 -translate-x-1/2 w-11/12 bottom-20 z-[60] mx-0 md:mb-0 mb-0" >
            <div className="flex flex-col">
              <span className="text-sm text-gray-300">
                {content.type === 'series' ? 'Full Series Access' : 'Limited Time Access'}
              </span>
              <span className="font-bold text-tiketx-blue leading-tight text-2xl md:text-3xl">
                {typeof content.price === 'string' ? content.price.replace('$', 'Rs.') : content.price}
              </span>
            </div>
            <button
              className="gradient-button text-base px-6 py-3 font-bold rounded-2xl mx-4"
              onClick={() => navigate(`/watch/${content.id}`)}
            >
              Buy Tiket
            </button>
            <div className="block md:hidden pb-4" />
            <div className="flex flex-col text-right">
              <span className="text-sm text-gray-300">Available until</span>
              <span className="text-base font-bold text-white">July 15, 2024</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
