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
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = (e: React.MouseEvent) => {
    setIsHovered(true);
    
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
    setIsHovered(false);
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setShowHover(false);
  };

  return (
    <>
      <div 
        className={`movie-card min-w-[220px] md:min-w-[250px] animate-fade-in group relative overflow-visible transition-all duration-300 ${
          isHovered ? 'transform -translate-y-4 scale-110 z-20' : 'z-10'
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => navigate(`/movie/${id}`)}
      >
        <div className="relative mb-4">
          <img
            src={poster}
            alt={title}
            className={`w-full h-[320px] md:h-[360px] object-cover rounded-xl transition-all duration-300 ${
              isHovered ? 'shadow-2xl shadow-black/50' : 'shadow-lg'
            }`}
          />
          
          {/* Enhanced Gradient Overlay for hover */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent rounded-xl transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`} />
          
          {/* Enhanced Hover Controls */}
          <div className={`absolute inset-0 flex flex-col justify-end p-4 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}>
            {/* Movie info overlay */}
            <div className="mb-4 text-white">
              <h3 className="font-bold text-lg mb-2 line-clamp-2">{title}</h3>
              <div className="flex flex-wrap items-center text-sm text-gray-300 gap-2 mb-2">
                <span className="font-semibold">{year}</span>
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                <span className="bg-white/20 px-2 py-1 rounded text-xs font-medium">{certificate}</span>
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                <span>{duration}</span>
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                <span>{language}</span>
              </div>
              <div className="mb-3">
                <span className="bg-tiketx-violet/30 text-tiketx-violet px-3 py-1 rounded-full text-sm font-medium">
                  {genre}
                </span>
              </div>
              <p className="text-gray-300 text-sm line-clamp-2 leading-relaxed mb-4">
                {description}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between">
              <button 
                className="gradient-button flex items-center space-x-2 text-sm px-4 py-2 rounded-lg font-bold flex-1 mr-3"
                onClick={(e) => {
                  e.stopPropagation();
                  if (hasTicket) {
                    navigate(`/watch/${id}`);
                  } else {
                    navigate(`/movie/${id}`);
                  }
                }}
              >
                {hasTicket ? <Play size={16} /> : <span className="text-base">🎟️</span>}
                <span>{hasTicket ? 'Watch Now' : 'Buy Ticket'}</span>
              </button>
              <button 
                className={`glass-card p-3 rounded-full hover:bg-white/30 transition-all duration-300 border-2 border-white/30 ${
                  isInWatchlist ? 'bg-white/20 opacity-100' : 'opacity-70 hover:opacity-100'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <Plus size={18} className={isInWatchlist ? 'text-tiketx-blue' : 'text-white'} />
              </button>
            </div>
            
            {hasTicket && ticketExpiry && (
              <div className="flex items-center text-xs text-green-400 mt-2">
                <Clock size={12} className="mr-1" />
                <span>Valid till: {ticketExpiry}</span>
              </div>
            )}
          </div>

          {/* Static Rating Badge */}
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
        
        {/* Simplified card footer for non-hover state */}
        <div className={`space-y-3 transition-opacity duration-300 ${
          isHovered ? 'opacity-0' : 'opacity-100'
        }`}>
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

      {/* Desktop Hover Card - Keep for additional functionality if needed */}
      <div className="hidden">
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
