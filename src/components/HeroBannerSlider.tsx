
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Plus, Clock, Star, Ticket, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { IoTicketOutline } from "react-icons/io5";

interface HeroBanner {
  id: number;
  title: string;
  year: string;
  language: string;
  duration: string;
  certificate: string;
  description: string;
  genres: string[];
  backgroundImage: string;
  posterImage: string;
  filmId: number;
  hasTicket?: boolean;
  ticketExpiry?: string;
  rating?: number;
  imdbRating?: number;
  branding?: string; // Added for new branding option
}

interface HeroBannerSliderProps {
  banners: HeroBanner[];
  showMobileOverlay?: boolean;
}

export const HeroBannerSlider = ({ banners, showMobileOverlay }: HeroBannerSliderProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const [logoExists, setLogoExists] = useState(false);
  const [logoPath, setLogoPath] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 8000);

    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const currentBanner = banners[currentSlide];

  // Slugify the title for the logo filename
  function slugifyTitle(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  useEffect(() => {
    const slug = slugifyTitle(currentBanner.title);
    const path = `/film-title-logos/${slug}.png`;
    setLogoPath(path);
    const img = new window.Image();
    img.src = path;
    img.onload = () => setLogoExists(true);
    img.onerror = () => setLogoExists(false);
  }, [currentBanner.title]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Mobile overlay for logo/profile
  const MobileOverlay = () => (
    <div className="flex md:hidden">
      <div className="absolute top-0 left-0 w-full flex items-center justify-between px-4 pt-2 z-40 pointer-events-none">
        <img src="/mobile-logo.png" alt="TiketX Logo" className="h-8 w-auto pointer-events-auto" />
        <div className="w-10 h-10 bg-tiketx-gradient rounded-full flex items-center justify-center pointer-events-auto">
          <User size={22} className="text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative h-[32rem] sm:h-56 md:h-[477px] lg:h-[551px] overflow-hidden">
      {showMobileOverlay && <MobileOverlay />}
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={currentBanner.backgroundImage}
          alt={currentBanner.title}
          className="w-full h-full object-cover"
        />
      </div>
      {/* Stronger, taller bottom fade for mobile: from black to transparent, covers bottom 70% */}
      <div className="absolute bottom-0 left-0 w-full h-[70%] sm:hidden z-30 pointer-events-none bg-gradient-to-t from-black/95 via-black/90 to-transparent" />
      {/* Subtle black top-corner gradient for mobile: from black to transparent, covers top 20% */}
      <div className="absolute top-0 left-0 w-full h-[20%] sm:hidden z-20 pointer-events-none bg-gradient-to-b from-black/60 to-transparent" />
      {/* Keep original gradients for sm and up */}
      <div className="absolute inset-0 hidden sm:block bg-gradient-to-r from-black/95 via-black/70 to-black/30" />
      <div className="absolute inset-0 hidden sm:block bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      {/* Content */}
      {/* PC/Tab: bottom left text block, Mobile: centered bottom */}
      <div className="absolute inset-0 flex flex-col justify-end items-center z-50 sm:static sm:justify-center">
        {/* Mobile: centered bottom (already handled) */}
        <div className="w-full flex flex-col items-center px-4 pb-8 flex-grow justify-end sm:hidden">
          <div className="max-w-3xl mx-auto h-full flex flex-col justify-end">
            <div className="flex flex-col items-center text-center md:items-start md:text-left w-full pb-8 sm:pb-0">
              {/* Title */}
              {logoExists ? (
                <img
                  src={logoPath}
                  alt={currentBanner.title}
                  className="mb-3 max-w-full h-auto mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]"
                  style={{ maxHeight: '100px' }}
                />
              ) : (
                <h1 className="text-2xl font-bold text-white mb-3 leading-tight tracking-tight mx-auto drop-shadow-lg">
                  {currentBanner.title}
                </h1>
              )}

              {/* Mobile: New Release label and tags row */}
              {/* Example: show 'New Release' for the first banner, you can adjust logic as needed */}
              {currentSlide === 0 && (
                <div className="text-tiketx-blue text-xs font-semibold mb-2">New Release</div>
              )}
              {/* Tags row: languages, genres, etc. */}
              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-white/80 mb-5 drop-shadow-lg">
                {/* Example: show languages and genres, separated by dots */}
                <span>7 Languages</span>
                <span className="w-1 h-1 bg-white/40 rounded-full inline-block"></span>
                {currentBanner.genres.map((genre, idx) => (
                  <>
                    <span key={genre}>{genre}</span>
                    {idx < currentBanner.genres.length - 1 && <span className="w-1 h-1 bg-white/40 rounded-full inline-block"></span>}
                  </>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex items-center justify-center gap-3 mb-6">
                {currentBanner.hasTicket ? (
                  <button 
                    className="gradient-button flex items-center justify-center space-x-2 text-base px-6 py-3 font-bold rounded-xl mx-4 max-w-xs w-full sm:flex-1"
                    onClick={() => navigate(`/watch/${currentBanner.filmId}`)}
                  >
                    <Play size={22} />
                    <span>Watch Now</span>
                  </button>
                ) : (
                  <button 
                    className="gradient-button flex-1 flex items-center justify-center space-x-2 text-base px-6 py-3 font-bold rounded-xl"
                    onClick={() => navigate(`/movie/${currentBanner.filmId}`)}
                  >
                    <span>Buy Ticket</span>
                    <IoTicketOutline size={22} />
                  </button>
                )}
                <button className="glass-card p-3 rounded-xl hover:bg-white/20 transition-colors opacity-70 hover:opacity-100 border-2 border-white/30 flex items-center justify-center">
                  <Plus size={22} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* PC/Tab: bottom left */}
        <div className="hidden sm:flex flex-col items-start absolute left-0 bottom-0 px-12 pb-12 z-50 max-w-2xl">
          {/* Branding/Platform logo (optional) */}
          {currentBanner.branding && (
            <img src={currentBanner.branding} alt="Branding" className="mb-2 h-6 object-contain drop-shadow-lg" />
          )}
          {logoExists ? (
            <img
              src={logoPath}
              alt={currentBanner.title}
              className="mb-3 max-w-full h-auto drop-shadow-lg"
              style={{ maxHeight: '100px' }}
            />
          ) : (
            <h1 className="text-4xl font-bold text-white mb-3 leading-tight tracking-tight drop-shadow-lg">
              {currentBanner.title}
            </h1>
          )}
          <div className="text-base text-white/80 mb-5 drop-shadow-lg">
            7 Languages
            {currentBanner.genres.length > 0 && (
              <>
                {' '}•{' '}
                {currentBanner.genres.join(' • ')}
              </>
            )}
          </div>
          <div className="flex items-center gap-3 mb-6">
            <button 
              className="gradient-button flex items-center justify-center space-x-2 text-lg px-8 py-4 font-bold rounded-xl"
              onClick={() => navigate(`/watch/${currentBanner.filmId}`)}
            >
              <Play size={28} />
              <span>Watch Now</span>
            </button>
            <button className="glass-card p-4 rounded-xl hover:bg-white/20 transition-colors opacity-70 hover:opacity-100 border-2 border-white/30 flex items-center justify-center">
              <Plus size={28} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-tiketx-blue scale-125' : 'bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
      {/* Mobile: slider nav dots at absolute bottom center, above gradient */}
      <div className="absolute left-1/2 bottom-12 -translate-x-1/2 flex justify-center items-center space-x-2 sm:hidden z-50">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 focus:outline-none ${
              index === currentSlide ? 'bg-tiketx-blue scale-110' : 'bg-white/30'
            }`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
