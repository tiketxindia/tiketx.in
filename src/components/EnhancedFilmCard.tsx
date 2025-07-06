
import { useState, useRef, useEffect } from 'react';
import { Play, Plus, Star, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';

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

// Helper to normalize certificate display
function getCertificateShort(cert?: string) {
  if (!cert) return '';
  if (cert.startsWith('U/A')) return 'U/A';
  return cert;
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
  const cardRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [overlayReady, setOverlayReady] = useState(false);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(true);
    setTimeout(() => setOverlayReady(true), 10);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
      setOverlayReady(false);
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={cardRef}
      className={`min-w-[166px] md:min-w-[186px] transition-all duration-300 ease-out cursor-pointer relative overflow-visible ${
        isHovered ? 'transform scale-105 z-50' : 'z-10'
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
          className="w-full h-[221px] md:h-[248px] object-cover rounded-lg"
        />
        
        {/* Type Badge */}
        {type !== 'movie' && (
          <div className="absolute top-2 left-2 bg-tiketx-blue/90 px-2 py-1 rounded-md text-[12px] font-bold uppercase backdrop-blur-sm">
            {type}
          </div>
        )}

        {/* Ticket Status */}
        {hasTicket && (
          <div className="absolute bottom-2 left-2 bg-green-500/90 px-2 py-1 rounded-md text-[12px] font-bold backdrop-blur-sm">
            OWNED
          </div>
        )}
      </div>
      
      {/* Default Card Content - Always visible */}
      <div className="space-y-2">
        <h3 className="font-bold text-sm line-clamp-2 leading-tight text-white">
          {title}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center">
            <Star size={14} className="text-yellow-400 fill-yellow-400 mr-1" fill="currentColor" />
            <span className="text-xs font-semibold text-white">{rating}</span>
          </div>
          <span className="text-xs text-gray-400 font-medium">{votes} votes</span>
        </div>
      </div>

      {/* Hover Details - Absolutely positioned inside card, never blocks overflow */}
      {isHovered && (
        <div
          className={`absolute left-1/2 top-1/2 w-64 z-[100] flex items-center justify-center ${overlayReady ? 'transition-all duration-300 ease-out opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          style={{
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'auto',
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="bg-black/95 backdrop-blur-lg rounded-lg p-4 shadow-2xl w-full">
            {/* 4:3 Poster Image */}
            <div className="w-full aspect-[4/3] mb-3 rounded-lg overflow-hidden">
              <img src={poster} alt={title} className="w-full h-full object-cover" />
            </div>
            {/* Movie metadata */}
            <div className="flex items-center text-xs text-gray-300 gap-2 mb-3 whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
              <span className="font-semibold shrink-0">{year}</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full shrink-0"></span>
              <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0">{genre}</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full shrink-0"></span>
              <span className="shrink-0">{language}</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full shrink-0"></span>
              <span className="shrink-0">{getCertificateShort(certificate)}</span>
            </div>

            {/* Rating and duration in one line */}
            <div className="flex items-center text-xs text-gray-300 mb-3 w-full">
              <div className="flex items-center">
                <Star size={11} className="text-yellow-400 mr-1" />
                <span className="font-semibold mr-2">{rating}</span>
                <span className="text-gray-400">({votes} votes)</span>
                <span className="mx-2 w-1 h-1 bg-gray-400 rounded-full inline-block"></span>
                <span className="text-gray-400">{duration}</span>
              </div>
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
                {hasTicket ? <Play size={12} /> : <span className="text-sm">🎟️</span>}
                <span>{hasTicket ? 'Watch Now' : 'Buy Ticket'}</span>
              </button>
              <button 
                className={`glass-card p-2 rounded-full hover:bg-white/30 transition-all duration-300 border-2 border-white/30 ${
                  isInWatchlist ? 'bg-white/20 opacity-100' : 'opacity-70 hover:opacity-100'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <Plus size={12} className={isInWatchlist ? 'text-tiketx-blue' : 'text-white'} />
              </button>
            </div>
            
            {hasTicket && ticketExpiry && (
              <div className="flex items-center text-xs text-green-400 mt-2">
                <Clock size={8} className="mr-1" />
                <span>Valid till: {ticketExpiry}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
