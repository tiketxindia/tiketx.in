
import { Play, Plus, Clock, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FilmHoverCardProps {
  id: number;
  title: string;
  year: string;
  certificate: string;
  duration: string;
  language: string;
  genre: string;
  description: string;
  poster: string;
  hasTicket?: boolean;
  ticketExpiry?: string;
  isVisible: boolean;
  position: { x: number; y: number };
  rating?: number;
  isInWatchlist?: boolean;
}

export const FilmHoverCard = ({ 
  id, 
  title, 
  year, 
  certificate, 
  duration, 
  language, 
  genre, 
  description, 
  poster, 
  hasTicket, 
  ticketExpiry, 
  isVisible, 
  position,
  rating = 4.5,
  isInWatchlist = false
}: FilmHoverCardProps) => {
  const navigate = useNavigate();

  if (!isVisible) return null;

  return (
    <div 
      className="hotstar-hover-card w-96 animate-fade-in"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* Poster */}
      <div className="relative mb-4">
        <img
          src={poster}
          alt={title}
          className="w-full h-56 object-cover rounded-lg"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-lg" />
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Title & Rating */}
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-bold text-white line-clamp-2 flex-1">{title}</h3>
          <div className="flex items-center ml-3 bg-black/50 px-2 py-1 rounded-lg">
            <Star size={16} className="text-yellow-400 mr-1" />
            <span className="font-semibold">{rating}</span>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center text-sm text-gray-300 gap-2">
          <span className="font-semibold">{year}</span>
          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
          <span className="bg-white/20 px-2 py-1 rounded text-xs font-medium">{certificate}</span>
          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
          <span>{duration}</span>
          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
          <span>{language}</span>
        </div>

        {/* Genre */}
        <div>
          <span className="bg-tiketx-violet/30 text-tiketx-violet px-3 py-1 rounded-full text-sm font-medium">
            {genre}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm line-clamp-3 leading-relaxed">
          {description}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex-1">
            {hasTicket ? (
              <div>
                <button 
                  className="gradient-button flex items-center space-x-2 text-sm px-6 py-3 w-full justify-center font-bold"
                  onClick={() => navigate(`/watch/${id}`)}
                >
                  <Play size={18} />
                  <span>Watch Now</span>
                </button>
                {ticketExpiry && (
                  <div className="flex items-center text-xs text-green-400 mt-2 justify-center">
                    <Clock size={12} className="mr-1" />
                    <span>Valid till: {ticketExpiry}</span>
                  </div>
                )}
              </div>
            ) : (
              <button 
                className="gradient-button flex items-center space-x-2 text-sm px-6 py-3 w-full justify-center font-bold"
                onClick={() => navigate(`/movie/${id}`)}
              >
                <span className="text-lg">🎟️</span>
                <span>Subscribe to Watch</span>
              </button>
            )}
          </div>

          <button 
            className={`ml-4 p-3 glass-card rounded-full hover:bg-white/30 transition-all duration-300 border-2 border-white/30 ${
              isInWatchlist ? 'bg-white/20 opacity-100' : 'opacity-70 hover:opacity-100'
            }`}
          >
            <Plus size={18} className={isInWatchlist ? 'text-tiketx-blue' : 'text-white'} />
          </button>
        </div>
      </div>
    </div>
  );
};
