
import { useState } from 'react';
import { Play, Plus, Star, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EnhancedFilmCardProps {
  id: number;
  title: string;
  poster: string;
  genre: string;
  rating: number;
  duration: string;
  year?: string;
  certificate?: string;
  language?: string;
  description?: string;
  hasTicket?: boolean;
  ticketExpiry?: string;
  type?: 'movie' | 'series' | 'short';
  isInWatchlist?: boolean;
  votes?: number;
}

export const EnhancedFilmCard = ({ 
  id, 
  title, 
  poster, 
  genre, 
  rating, 
  duration, 
  year = '2024',
  certificate = 'U/A 16+',
  language = 'English',
  description = 'An engaging story that will keep you entertained from start to finish.',
  hasTicket = false,
  ticketExpiry,
  type = 'movie',
  isInWatchlist = false,
  votes = 147
}: EnhancedFilmCardProps) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div 
      className={`min-w-[160px] md:min-w-[180px] transition-all duration-300 ease-out cursor-pointer relative ${
        isHovered ? 'transform scale-105 z-20' : 'z-10'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => navigate(`/movie/${id}`)}
      style={{
        boxShadow: isHovered ? '0 20px 40px rgba(0, 0, 0, 0.6)' : '0 4px 8px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Poster Container */}
      <div className="relative mb-3">
        <img
          src={poster}
          alt={title}
          className="w-full h-[240px] md:h-[270px] object-cover rounded-lg"
        />
        
        {/* Certificate Badge - Always visible */}
        <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded-md text-xs font-medium backdrop-blur-sm border border-white/20">
          {certificate}
        </div>

        {/* Type Badge */}
        {type !== 'movie' && (
          <div className="absolute top-2 left-2 bg-tiketx-blue/90 px-2 py-1 rounded-md text-xs font-bold uppercase backdrop-blur-sm">
            {type}
          </div>
        )}

        {/* Ticket Status */}
        {hasTicket && (
          <div className="absolute bottom-2 left-2 bg-green-500/90 px-2 py-1 rounded-md text-xs font-bold backdrop-blur-sm">
            OWNED
          </div>
        )}
      </div>
      
      {/* Default Card Content - Always visible */}
      <div className="space-y-2">
        <h3 className="font-bold text-sm line-clamp-2 leading-tight text-white">
          {title}
        </h3>
        
        {/* Default info - votes instead of genre/duration */}
        <div className="text-xs text-gray-400">
          <span className="font-medium">{votes} votes</span>
        </div>
      </div>

      {/* Hover Details - Show below thumbnail */}
      {isHovered && (
        <div className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-lg border border-white/30 rounded-lg p-4 mt-2 shadow-2xl z-30 animate-fade-in">
          {/* Movie metadata */}
          <div className="flex flex-wrap items-center text-xs text-gray-300 gap-2 mb-3">
            <span className="font-semibold">{year}</span>
            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
            <span className="bg-white/20 px-2 py-1 rounded text-xs font-medium">{genre}</span>
            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
            <span>{language}</span>
            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
            <span>{duration}</span>
          </div>

          {/* Rating */}
          <div className="flex items-center text-xs text-gray-300 mb-3">
            <Star size={12} className="text-yellow-400 mr-1" />
            <span className="font-semibold mr-2">{rating}</span>
            <span className="text-gray-400">({votes} votes)</span>
          </div>
          
          {/* Description */}
          <p className="text-gray-300 text-xs line-clamp-2 leading-relaxed mb-4">
            {description}
          </p>

          {/* Action buttons */}
          <div className="flex items-center justify-between">
            <button 
              className="gradient-button flex items-center space-x-2 text-xs px-3 py-2 rounded-lg font-bold flex-1 mr-2"
              onClick={(e) => {
                e.stopPropagation();
                if (hasTicket) {
                  navigate(`/watch/${id}`);
                } else {
                  navigate(`/movie/${id}`);
                }
              }}
            >
              {hasTicket ? <Play size={14} /> : <span className="text-sm">🎟️</span>}
              <span>{hasTicket ? 'Watch Now' : 'Buy Ticket'}</span>
            </button>
            <button 
              className={`glass-card p-2 rounded-full hover:bg-white/30 transition-all duration-300 border-2 border-white/30 ${
                isInWatchlist ? 'bg-white/20 opacity-100' : 'opacity-70 hover:opacity-100'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <Plus size={14} className={isInWatchlist ? 'text-tiketx-blue' : 'text-white'} />
            </button>
          </div>
          
          {hasTicket && ticketExpiry && (
            <div className="flex items-center text-xs text-green-400 mt-2">
              <Clock size={10} className="mr-1" />
              <span>Valid till: {ticketExpiry}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
