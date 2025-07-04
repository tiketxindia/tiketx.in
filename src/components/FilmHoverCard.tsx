
import { Play, Plus, Clock } from 'lucide-react';
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
  position 
}: FilmHoverCardProps) => {
  const navigate = useNavigate();

  if (!isVisible) return null;

  return (
    <div 
      className="fixed z-50 w-80 glass-card rounded-xl p-4 shadow-2xl animate-fade-in"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translateY(-50%)'
      }}
    >
      {/* Poster */}
      <div className="relative mb-3">
        <img
          src={poster}
          alt={title}
          className="w-full h-48 object-cover rounded-lg"
        />
        <div className="absolute inset-0 bg-black/20 rounded-lg" />
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{title}</h3>

      {/* Info Line */}
      <div className="flex items-center text-sm text-gray-400 mb-2 flex-wrap gap-1">
        <span>{year}</span>
        <span>•</span>
        <span>{certificate}</span>
        <span>•</span>
        <span>{duration}</span>
        <span>•</span>
        <span>{language}</span>
        <span>•</span>
        <span className="bg-tiketx-violet/20 text-tiketx-violet px-2 py-0.5 rounded text-xs">
          {genre}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">
        {description}
      </p>

      {/* CTA Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {hasTicket ? (
            <div>
              <button 
                className="gradient-button flex items-center space-x-2 text-sm px-4 py-2 w-full justify-center"
                onClick={() => navigate(`/watch/${id}`)}
              >
                <Play size={16} />
                <span>Watch Now</span>
              </button>
              {ticketExpiry && (
                <div className="flex items-center text-xs text-gray-400 mt-1 justify-center">
                  <Clock size={12} className="mr-1" />
                  <span>Valid till: {ticketExpiry}</span>
                </div>
              )}
            </div>
          ) : (
            <button 
              className="gradient-button flex items-center space-x-2 text-sm px-4 py-2 w-full justify-center"
              onClick={() => navigate(`/movie/${id}`)}
            >
              <span>🎟️</span>
              <span>Buy Ticket</span>
            </button>
          )}
        </div>

        <button className="ml-3 p-2 glass-card rounded-full hover:bg-white/20 transition-colors opacity-70 hover:opacity-100">
          <Plus size={16} className="text-white" />
        </button>
      </div>
    </div>
  );
};
