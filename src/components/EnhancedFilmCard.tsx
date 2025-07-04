
import { useState } from 'react';
import { Play, Plus, Star } from 'lucide-react';
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
  type = 'movie'
}: EnhancedFilmCardProps) => {
  const navigate = useNavigate();
  const [showHover, setShowHover] = useState(false);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverPosition({
      x: rect.right + 10,
      y: rect.top + rect.height / 2
    });
    setShowHover(true);
  };

  const handleMouseLeave = () => {
    setShowHover(false);
  };

  return (
    <>
      <div 
        className="movie-card min-w-[200px] animate-fade-in group relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => navigate(`/movie/${id}`)}
      >
        <div className="relative mb-4">
          <img
            src={poster}
            alt={title}
            className="w-full h-[280px] object-cover rounded-xl"
          />
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center">
            <div className="flex space-x-3">
              <button 
                className="gradient-button p-3 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  if (hasTicket) {
                    navigate(`/watch/${id}`);
                  } else {
                    navigate(`/movie/${id}`);
                  }
                }}
              >
                {hasTicket ? <Play size={20} /> : <span className="text-sm">🎟️</span>}
              </button>
              <button 
                className="glass-card p-3 rounded-full hover:bg-white/20 transition-colors opacity-70 hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Rating Badge */}
          <div className="absolute top-3 right-3 bg-black/70 px-2 py-1 rounded-lg text-sm flex items-center">
            <Star size={14} className="text-yellow-400 mr-1" />
            {rating}
          </div>

          {/* Type Badge */}
          {type !== 'movie' && (
            <div className="absolute top-3 left-3 bg-tiketx-blue/80 px-2 py-1 rounded-lg text-xs font-medium uppercase">
              {type}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-tiketx-blue transition-colors">
            {title}
          </h3>
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span className="bg-tiketx-violet/20 text-tiketx-violet px-2 py-1 rounded-lg">
              {genre}
            </span>
            <span>{duration}</span>
          </div>
          {hasTicket && ticketExpiry && (
            <div className="text-xs text-green-400">
              Valid till: {ticketExpiry}
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
        />
      </div>
    </>
  );
};
