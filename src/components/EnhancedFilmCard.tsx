
import { useState } from 'react';
import { Play, Plus, Star, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FilmHoverCard } from './FilmHoverCard';

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
  isInWatchlist = false
}: EnhancedFilmCardProps) => {
  const navigate = useNavigate();
  const [showHover, setShowHover] = useState(false);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const isRightSide = rect.left > window.innerWidth / 2;
    
    setHoverPosition({
      x: isRightSide ? rect.left - 350 : rect.right + 10,
      y: Math.max(50, rect.top - 50)
    });

    const timeout = setTimeout(() => {
      setShowHover(true);
    }, 500);
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setShowHover(false);
  };

  return (
    <>
      <div 
        className="movie-card min-w-[220px] md:min-w-[250px] animate-fade-in group relative overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => navigate(`/movie/${id}`)}
      >
        <div className="relative mb-4">
          <img
            src={poster}
            alt={title}
            className="w-full h-[320px] md:h-[360px] object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Hover Controls */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex space-x-3">
              <button 
                className="gradient-button p-4 rounded-full shadow-2xl"
                onClick={(e) => {
                  e.stopPropagation();
                  if (hasTicket) {
                    navigate(`/watch/${id}`);
                  } else {
                    navigate(`/movie/${id}`);
                  }
                }}
              >
                {hasTicket ? <Play size={24} /> : <span className="text-lg">🎟️</span>}
              </button>
              <button 
                className={`glass-card p-4 rounded-full hover:bg-white/30 transition-all duration-300 border-2 border-white/30 ${
                  isInWatchlist ? 'bg-white/20 opacity-100' : 'opacity-70 hover:opacity-100'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <Plus size={24} className={isInWatchlist ? 'text-tiketx-blue' : 'text-white'} />
              </button>
            </div>
          </div>

          {/* Rating Badge */}
          <div className="absolute top-3 right-3 bg-black/80 px-3 py-2 rounded-lg text-sm flex items-center backdrop-blur-sm border border-white/20">
            <Star size={16} className="text-yellow-400 mr-1" />
            <span className="font-semibold">{rating}</span>
          </div>

          {/* Type Badge */}
          {type !== 'movie' && (
            <div className="absolute top-3 left-3 bg-tiketx-blue/90 px-3 py-2 rounded-lg text-xs font-bold uppercase backdrop-blur-sm">
              {type}
            </div>
          )}

          {/* Ticket Status */}
          {hasTicket && (
            <div className="absolute bottom-3 left-3 bg-green-500/90 px-3 py-2 rounded-lg text-xs font-bold backdrop-blur-sm">
              OWNED
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <h3 className="font-bold text-lg line-clamp-2 group-hover:text-tiketx-blue transition-colors leading-tight">
            {title}
          </h3>
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span className="bg-white/10 text-white px-3 py-1 rounded-lg font-medium border border-white/20">
              {genre}
            </span>
            <span className="font-medium">{duration}</span>
          </div>
          {hasTicket && ticketExpiry && (
            <div className="flex items-center text-xs text-green-400">
              <Clock size={12} className="mr-1" />
              <span>Valid till: {ticketExpiry}</span>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Hover Card */}
      <div className="hidden lg:block">
        <FilmHoverCard
          id={id}
          title={title}
          year={year}
          certificate={certificate}
          duration={duration}
          language={language}
          genre={genre}
          description={description}
          poster={poster}
          hasTicket={hasTicket}
          ticketExpiry={ticketExpiry}
          isVisible={showHover}
          position={hoverPosition}
          rating={rating}
          isInWatchlist={isInWatchlist}
        />
      </div>
    </>
  );
};
