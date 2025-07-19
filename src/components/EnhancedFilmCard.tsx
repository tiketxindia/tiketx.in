
import { useState, useRef, useEffect } from 'react';
import { Play, Plus, Star, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { formatDistanceStrict } from 'date-fns';
import { IoTicket, IoTicketOutline } from 'react-icons/io5';
import { BsThreeDotsVertical, BsBookmarkPlusFill, BsBookmarkCheckFill } from 'react-icons/bs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle } from 'lucide-react';

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
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(isInWatchlist);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch initial watchlist state for this film and user
  useEffect(() => {
    (async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;
      const { data, error } = await supabase
        .from('user_watchlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('film_id', id)
        .single();
      setInWatchlist(!!data && !error);
    })();
    // eslint-disable-next-line
  }, [id]);

  // Add/remove from watchlist
  const handleWatchlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setWatchlistLoading(true);
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      setWatchlistLoading(false);
      setMenuOpen(false);
      // Optionally, show login modal here
      return;
    }
    if (inWatchlist) {
      // Remove from watchlist
      await supabase
        .from('user_watchlist')
        .delete()
        .eq('user_id', user.id)
        .eq('film_id', id);
      setInWatchlist(false);
      toast({
        title: (
          <span className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Removed from Watchlist
          </span>
        ),
      });
    } else {
      // Add to watchlist
      await supabase
        .from('user_watchlist')
        .insert({ user_id: user.id, film_id: id });
      setInWatchlist(true);
      toast({
        title: (
          <span className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Added to Watchlist
          </span>
        ),
      });
    }
    setWatchlistLoading(false);
    setMenuOpen(false);
  };

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const isTicketActive = hasTicket && ticketExpiry && new Date(ticketExpiry) > new Date();

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

  useEffect(() => {
    if (isTicketActive && ticketExpiry) {
      const updateTimer = () => {
        const expiry = new Date(ticketExpiry).getTime();
        const now = Date.now();
        const diff = Math.max(0, Math.floor((expiry - now) / 1000));
        setTimeLeft(diff > 0 ? diff : 0);
      };
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    } else {
      setTimeLeft(null);
    }
  }, [isTicketActive, ticketExpiry]);

  function formatCountdown(seconds: number | null) {
    if (seconds === null) return '';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

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
      {/* 3-dot menu */}
      <div className="absolute top-3 right-3 z-40" ref={menuRef} onClick={e => e.stopPropagation()}>
        <button
          className="bg-black/60 hover:bg-black/80 rounded-full p-1.5 flex items-center justify-center focus:outline-none"
          onClick={e => { e.stopPropagation(); setMenuOpen(m => !m); }}
        >
          <BsThreeDotsVertical className="w-4 h-4 text-white" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-black/95 border border-white/10 rounded-xl shadow-lg py-2 z-50 animate-fade-in">
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors disabled:opacity-60"
              onClick={handleWatchlistToggle}
              disabled={watchlistLoading}
            >
              {inWatchlist ? (
                <BsBookmarkCheckFill className="w-5 h-5 text-green-400" />
              ) : (
                <BsBookmarkPlusFill className="w-5 h-5 text-white" />
              )}
              {watchlistLoading ? 'Please wait...' : inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
            </button>
          </div>
        )}
      </div>
      {/* Ribbon Badge */}
      {isTicketActive && (
        <div className="absolute top-3 left-3 z-30">
          <span className="bg-gradient-to-r from-tiketx-blue to-tiketx-pink text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
            <IoTicket className="w-4 h-4" /> Bought
          </span>
        </div>
      )}
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
        {/* Watch Now Play Button (bottom right, always visible if ticket active) */}
        {isTicketActive && (
          <button
            className="absolute bottom-3 right-3 bg-gradient-to-r from-tiketx-blue to-tiketx-pink text-white rounded-full p-4 shadow-lg flex items-center justify-center z-30 hover:scale-110 transition-transform"
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}
            onClick={e => {
              e.stopPropagation();
              navigate(`/watch/${id}`);
            }}
            aria-label="Watch Now"
          >
            <Play size={28} />
          </button>
        )}
        {/* Buy Ticket Button absolutely centered on the tear line, only on hover and if not ticket active */}
        {!isTicketActive && isHovered && (
          <button
            className="gradient-button px-8 py-3 rounded-xl text-base font-bold shadow-lg absolute left-1/2 whitespace-nowrap text-center flex items-center justify-center gap-2"
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
            <IoTicketOutline className="w-6 h-6" />
            Buy Tiket
          </button>
        )}
      </div>
      {/* Expiry Timer (between image and title) */}
      {isTicketActive && timeLeft !== null && (
        <div className="flex items-center justify-center mt-2 mb-1">
          <span className={`flex items-center gap-2 font-medium text-xs py-2 ${timeLeft <= 36000 ? 'text-red-500' : 'text-green-500'}`}>
            <Clock className="w-4 h-4" />
            Tiket Validity : {formatCountdown(timeLeft)} left
          </span>
        </div>
      )}
      {/* Bottom Section (text area) */}
      <div
        className="space-y-2 px-4 pb-2 pt-5 relative"
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
        {/* Timer and badge at the bottom if ticket active */}
        {/* (Removed from here, now above title) */}
      </div>
    </div>
  );
};












