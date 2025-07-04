
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, Calendar } from 'lucide-react';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock movie data
  const movie = {
    id: 1,
    title: 'Thor: Love and Thunder',
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
        <h1 className="text-lg font-semibold">Movie Details</h1>
        <div className="w-10 h-10" /> {/* Spacer */}
      </div>

      {/* Hero Banner */}
      <div className="relative mb-6">
        <div className="h-[300px] md:h-[400px] relative overflow-hidden rounded-2xl mx-6">
          <img
            src={movie.banner}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button className="gradient-button flex items-center space-x-2 text-lg">
              <Play size={24} />
              <span>Watch Trailer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Movie Info */}
      <div className="px-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-3">{movie.title}</h1>
          
          {/* Genres */}
          <div className="flex flex-wrap gap-2 mb-4">
            {movie.genre.map((g) => (
              <span key={g} className="bg-tiketx-violet/20 text-tiketx-violet px-3 py-1 rounded-lg text-sm">
                {g}
              </span>
            ))}
          </div>

          {/* Ratings & Info */}
          <div className="flex items-center space-x-6 text-gray-300">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-400">⭐</span>
              <span>{movie.rating}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-yellow-400">📺</span>
              <span>IMDb {movie.imdbRating}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar size={16} />
              <span>{movie.runtime}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Synopsis</h3>
          <p className="text-gray-300 leading-relaxed">{movie.description}</p>
        </div>

        {/* Pricing & CTA */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Limited Time Access</p>
              <p className="text-2xl font-bold text-tiketx-blue">{movie.price}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Available until</p>
              <p className="text-sm font-semibold">July 15, 2024</p>
            </div>
          </div>
          
          <button 
            className="gradient-button w-full text-lg py-4"
            onClick={() => navigate(`/watch/${movie.id}`)}
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
