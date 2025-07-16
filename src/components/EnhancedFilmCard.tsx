
import { useState, useRef, useEffect } from 'react';
import { Play, Plus, Star, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';

interface EnhancedFilmCardProps {
  id: number;
  title: string;
  poster: string;
  hoverPoster?: string; // Add hoverPoster prop
  genre: string;
  duration: string;
  year?: string;
  certificate?: string;
  language?: string;
  description?: string;
  hasTicket?: boolean;
  ticketExpiry?: string;
  type?: 'movie' | 'series' | 'short';
  isInWatchlist?: boolean;
  ticket_price?: number | string;
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
  hoverPoster, // Accept hoverPoster
  genre, 
  duration, 
  year = '2024',
  certificate = 'U/A 16+',
  language = 'English',
  description = 'An engaging story that will keep you entertained from start to finish.',
  hasTicket = false,
  ticketExpiry,
  type = 'movie',
  isInWatchlist = false,
  ticket_price,
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
      className={`ticket-card min-w-[200px] md:min-w-[200px] transition-all duration-300 ease-out cursor-pointer relative overflow-visible group ${
        isHovered ? 'z-50 scale-105' : 'z-10'
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => {
        window.scrollTo(0, 0);
        navigate(`/movie/${id}`);
      }}
      style={{
        boxShadow: isHovered ? '0 20px 40px rgba(0, 0, 0, 0.6)' : '0 4px 8px rgba(0, 0, 0, 0.3)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {/* Left Notch */}
      <div className="ticket-left-notch"></div>
      {/* Poster Container */}
      <div className="relative">
        <img
          src={poster}
          alt={title}
          className="w-full h-[250px] md:h-[269px] object-cover rounded-t-2xl"
        />
        {/* Overlay for dimming effect on hover */}
        {isHovered && (
          <div
            className="absolute inset-0 rounded-t-2xl"
            style={{
              background: 'rgba(0,0,0,0.45)',
              zIndex: 15,
              transition: 'background 0.3s',
            }}
          />
        )}
        {/* Zig-Zag Tear SVG (middle of image, absolutely positioned) */}
        <svg
          className="absolute left-0 w-full h-6 pointer-events-none"
          style={{ top: '50%', transform: 'translateY(-50%)', zIndex: 20 }}
          viewBox="0 0 100 24"
          preserveAspectRatio="none"
        >
          <polyline
            points="0,12 5,24 10,12 15,24 20,12 25,24 30,12 35,24 40,12 45,24 50,12 55,24 60,12 65,24 70,12 75,24 80,12 85,24 90,12 95,24 100,12"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeDasharray="200"
            strokeDashoffset={isHovered ? 0 : 200}
            style={{
              transition: 'stroke-dashoffset 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.3s',
              opacity: isHovered ? 1 : 0,
            }}
          />
        </svg>
        {/* Buy Ticket Button absolutely centered on the tear line, only on hover */}
        {isHovered && (
          <button
            className="gradient-button px-8 py-3 rounded-xl text-base font-bold shadow-lg absolute left-1/2"
            style={{
              top: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 30,
            }}
            onClick={e => {
              e.stopPropagation();
              window.scrollTo(0, 0);
              navigate(`/movie/${id}`);
            }}
          >
            Buy Ticket
          </button>
        )}
      </div>

      {/* Bottom Section (text area) */}
      <div
        className="space-y-2 px-4 pb-2 pt-5"
        style={{
          background: 'rgba(17,17,17,0.7)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '0 0 24px 24px',
          marginTop: 0,
          transition: 'margin-top 0.5s',
        }}
      >
        <h3 className="font-bold text-sm line-clamp-2 leading-tight text-white">
          {title}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center">
            <span className="text-xs text-gray-400 font-medium">{language}</span>
          </div>
          <span className="text-xs text-gray-400 font-medium">{duration}</span>
        </div>
      </div>
    </div>
  );
};












