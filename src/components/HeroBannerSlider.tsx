
import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Plus, Clock, Star, Ticket, User, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { IoTicketOutline } from "react-icons/io5";
import React from 'react';
import { LoginSignupModal } from "./LoginSignupModal";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import Hls from 'hls.js';

interface HeroBanner {
  id: string;
  title: string;
  year: string;
  language: string;
  duration: string;
  certificate: string;
  description: string;
  genres: string[];
  banner_image: string;
  enabled: boolean;
  created_at?: string;
  modified_at?: string;
  title_image?: string;
  enable_title_image?: boolean;
  custom_tag?: string; // Added custom_tag to the interface
  enable_trailer?: boolean;
  trailer_link?: string;
  filmid?: string; // Added filmid to the interface
}

interface HeroBannerSliderProps {
  banners: HeroBanner[];
  userTickets: Record<string, any>;
  showMobileOverlay?: boolean;
}

export const HeroBannerSlider = ({ banners, userTickets, showMobileOverlay }: HeroBannerSliderProps) => {
  // All hooks at the very top
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const [logoExists, setLogoExists] = useState(false);
  const [logoPath, setLogoPath] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRedirect, setAuthRedirect] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const currentBanner = banners[currentSlide];
  // Get filmId from banner (may be string or number)
  const filmid = currentBanner?.filmid;
  const hasTicket = filmid && userTickets && userTickets[filmid];
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginRedirectPath, setLoginRedirectPath] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data?.user || null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    });
    return () => listener?.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Pause auto-advance if video is visible and playing
    if (isVideoVisible) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [banners.length, isVideoVisible, currentBanner]);

  // Slugify the title for the logo filename
  function slugifyTitle(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  useEffect(() => {
    if (!currentBanner) return;
    const slug = slugifyTitle(currentBanner.title || '');
    const path = `/film-title-logos/${slug}.png`;
    setLogoPath(path);
    const img = new window.Image();
    img.src = path;
    img.onload = () => setLogoExists(true);
    img.onerror = () => setLogoExists(false);
  }, [banners, currentSlide, currentBanner]);

  useEffect(() => {
    if (!currentBanner) return;
    setIsVideoVisible(false);
    setIsMuted(true);
    if (currentBanner.enable_trailer && currentBanner.trailer_link) {
      const timer = setTimeout(() => {
        setIsVideoVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentSlide, currentBanner]);

  // HLS.js integration for Mux playback
  useEffect(() => {
    if (!isVideoVisible || !currentBanner?.enable_trailer || !currentBanner?.trailer_link) return;
    const video = videoRef.current;
    if (!video) return;
    const muxUrl = `https://stream.mux.com/${currentBanner.trailer_link}.m3u8`;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = muxUrl;
    } else if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(muxUrl);
      hls.attachMedia(video);
      // Clean up
      return () => {
        hls.destroy();
      };
    } else {
      // Fallback: set src, may not play
      video.src = muxUrl;
    }
  }, [isVideoVisible, currentBanner]);

  // Early return after all hooks and effects
  if (!currentBanner) return null;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsVideoVisible(false); // Resume auto-advance after dot click
  };

  // Helper to format expiry date
  function formatExpiry(dateString: string) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  // Mobile overlay for logo/profile
  const MobileOverlay = () => (
    <div className="flex md:hidden">
      <div className="absolute top-0 left-0 w-full flex items-center justify-between px-4 pt-6 z-40 pointer-events-none">{/* Increased pt-2 to pt-6 for more top padding */}
        <img src="/mobile-logo.png" alt="TiketX Logo" className="h-12 w-auto pointer-events-auto" />{/* Increased h-8 to h-12 for bigger logo */}
        <div className="w-12 h-12 bg-tiketx-gradient rounded-full flex items-center justify-center pointer-events-auto">{/* Increased w-10 h-10 to w-12 h-12 for bigger profile icon */}
          <User size={28} className="text-white" />{/* Increased icon size from 22 to 28 */}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative h-[32rem] sm:h-56 md:h-[477px] lg:h-[670px] overflow-hidden">
      {showMobileOverlay && <MobileOverlay />}
      {/* Background Image or Video */}
      <div className="absolute inset-0">
        <img
          src={currentBanner.banner_image}
          alt={currentBanner.title}
          className={`w-full h-full object-cover object-top transition-opacity duration-500 ${isVideoVisible ? 'opacity-0' : 'opacity-100'}`}
        />
        {currentBanner.enable_trailer && currentBanner.trailer_link && isVideoVisible && (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover object-top"
            autoPlay
            loop
            muted={isMuted}
            playsInline
            onLoadedData={() => videoRef.current && videoRef.current.play()}
            style={{ zIndex: 1 }}
          />
        )}
        {/* Mute/Unmute Button for desktop/tablet only */}
        {currentBanner.enable_trailer && currentBanner.trailer_link && isVideoVisible && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsMuted(m => !m)}
                className="hidden sm:block absolute bottom-10 right-6 z-50 bg-transparent text-white rounded-full p-2 shadow hover:bg-white/10 transition"
                style={{ fontSize: 16 }}
                aria-label={isMuted ? 'Unmute trailer' : 'Mute trailer'}
              >
                {isMuted ? (
                  <VolumeX size={20} />
                ) : (
                  <Volume2 size={20} />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" align="center">
              {isMuted ? 'Unmute Trailer' : 'Mute Trailer'}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      {/* Stronger, taller bottom fade for mobile: from black to transparent, covers bottom 70% */}
      <div className="absolute bottom-0 left-0 w-full h-[70%] sm:hidden z-30 pointer-events-none bg-gradient-to-t from-black/95 via-black/90 to-transparent" />
      {/* Subtle black top-corner gradient for mobile: from black to transparent, covers top 20% */}
      <div className="absolute top-0 left-0 w-full h-[20%] sm:hidden z-20 pointer-events-none bg-gradient-to-b from-black/60 to-transparent" />
      {/* Keep original gradients for sm and up */}
      <div className="absolute inset-0 hidden sm:block bg-gradient-to-r from-black/95 via-black/70 to-black/30" />
      <div className="absolute inset-0 hidden sm:block bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      {/* Always show a strong bottom black gradient for desktop/tablet as well */}
      <div className="absolute bottom-0 left-0 w-full h-[40%] hidden sm:block z-20 pointer-events-none bg-gradient-to-t from-black via-black/50 to-black/0" />

      {/* Content */}
      {/* PC/Tab: bottom left text block, Mobile: centered bottom */}
      <div className="absolute inset-0 flex flex-col justify-end items-center z-50 sm:static sm:justify-center">
        {/* Mobile: centered bottom (already handled) */}
        {/* PC/Tab: bottom left */}
        <div className="hidden sm:flex flex-col items-start absolute left-0 bottom-0 px-12 pb-12 z-50 max-w-2xl">
          {/* Title or Title Image */}
          {currentBanner.enable_title_image && currentBanner.title_image ? (
            <img
              src={currentBanner.title_image}
              alt={currentBanner.title}
              className="mb-3 max-w-full h-auto drop-shadow-lg"
              style={{ maxHeight: '100px' }}
            />
          ) : (
            <h1 className="text-4xl font-bold text-white mb-3 leading-tight tracking-tight drop-shadow-lg">
              {currentBanner.title}
            </h1>
          )}
          {currentBanner.custom_tag && (
            <div className="text-tiketx-blue text-sm font-semibold mb-2">{currentBanner.custom_tag}</div>
          )}
          <div className="text-base text-white/80 mb-5 drop-shadow-lg">
            {currentBanner.language}
            {currentBanner.genres.length > 0 && (
              <>
                {' '}•{' '}
                {currentBanner.genres.join(' • ')}
              </>
            )}
          </div>
          <div className="mb-6 w-full">
            {filmid && hasTicket && (
              <div className="flex items-center gap-2 mb-3 px-4 py-2 rounded-full text-white text-base font-bold w-fit" style={{marginLeft: 0, fontSize: '1.1rem'}}>
                <IoTicketOutline className="w-5 h-5" />
                Bought
              </div>
            )}
            <div className="flex flex-row items-center gap-3">
            {filmid ? (
              hasTicket ? (
                <button
                  className="gradient-button flex items-center justify-center space-x-2 text-lg px-8 py-4 font-bold rounded-xl"
                  onClick={() => {
                    if (!currentUser) {
                      setLoginRedirectPath(`/watch/${filmid}`);
                      setLoginModalOpen(true);
                    } else {
                      navigate(`/watch/${filmid}`);
                    }
                  }}
                >
                  <Play size={28} />
                  <span>Watch Now</span>
                </button>
              ) : (
                <button
                  className="gradient-button flex items-center justify-center space-x-2 text-lg px-8 py-4 font-bold rounded-xl"
                  onClick={() => {
                    if (!currentUser) {
                      setLoginRedirectPath(`/movie/${filmid}`);
                      setLoginModalOpen(true);
                    } else {
                      navigate(`/movie/${filmid}`);
                    }
                  }}
                >
                  <IoTicketOutline size={28} />
                  <span>Buy Ticket</span>
                </button>
              )
            ) : (
              <button
                className="gradient-button flex items-center justify-center space-x-2 text-lg px-8 py-4 font-bold rounded-xl opacity-60 cursor-not-allowed"
                disabled
              >
                <span>Coming Soon</span>
              </button>
            )}
            <button className="glass-card p-4 rounded-xl hover:bg-white/20 transition-colors opacity-70 hover:opacity-100 border-2 border-white/30 flex items-center justify-center">
              <Plus size={28} className="text-white" />
            </button>
            </div>
            {filmid && hasTicket && userTickets[filmid]?.expiry_date && (
              <div className="mt-3 text-base text-white/80 drop-shadow-lg">
                Watch Before: {formatExpiry(userTickets[filmid].expiry_date)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: content block and nav dots anchored at very bottom, tightly grouped */}
      <div className="sm:hidden absolute left-0 right-0 bottom-0 w-full flex flex-col items-center z-50">
        <div className="w-full flex flex-col items-center px-3 justify-end">
          <div className="max-w-3xl mx-auto h-full flex flex-col justify-end">
            <div className="flex flex-col items-center text-center md:items-start md:text-left w-full pb-8 sm:pb-0">
              {/* Title or Title Image */}
              {currentBanner.enable_title_image && currentBanner.title_image ? (
                <img
                  src={currentBanner.title_image}
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
              {currentBanner.custom_tag && (
                <div className="text-tiketx-blue text-xs font-semibold mb-2">{currentBanner.custom_tag}</div>
              )}
              {/* Tags row: language and genres */}
              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-white/80 mb-5 drop-shadow-lg">
                <span>{currentBanner.language}</span>
                {currentBanner.genres && currentBanner.genres.length > 0 && (
                  <>
                    <span className="w-1 h-1 bg-white/40 rounded-full inline-block"></span>
                    {currentBanner.genres.map((genre, idx) => (
                      <React.Fragment key={genre}>
                        <span>{genre}</span>
                        {idx < currentBanner.genres.length - 1 && <span className="w-1 h-1 bg-white/40 rounded-full inline-block"></span>}
                      </React.Fragment>
                    ))}
                  </>
                )}
              </div>

              {/* CTA Buttons */}
              <div className="flex items-center justify-center gap-2 w-full">
                <button 
                  className="gradient-button flex-1 flex items-center justify-center space-x-2 text-base px-6 py-3 font-bold rounded-xl"
                  onClick={() => {
                    if (!user) { setShowAuthModal(true); setAuthRedirect(`/movie/${currentBanner.id}`); } else { navigate(`/movie/${currentBanner.id}`); }
                  }}
                >
                  <span>Buy Ticket</span>
                  <IoTicketOutline size={22} />
                </button>
                <button className="glass-card p-3 rounded-xl hover:bg-white/20 transition-colors opacity-70 hover:opacity-100 border-2 border-white/30 flex items-center justify-center">
                  <Plus size={22} className="text-white" />
                </button>
                {/* Mute/Unmute Button for mobile only */}
                {currentBanner.enable_trailer && currentBanner.trailer_link && isVideoVisible && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setIsMuted(m => !m)}
                        className="ml-2 sm:hidden bg-black/60 text-white rounded-full p-2 shadow hover:bg-black/80 transition z-50"
                        style={{ fontSize: 14 }}
                        aria-label={isMuted ? 'Unmute trailer' : 'Mute trailer'}
                      >
                        {isMuted ? (
                          <VolumeX size={22} />
                        ) : (
                          <Volume2 size={22} />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" align="center">
                      {isMuted ? 'Unmute Trailer' : 'Mute Trailer'}
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Pagination Dots - Mobile Only */}
        <div className="flex justify-center items-center space-x-1.5 z-50">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 focus:outline-none ${
                index === currentSlide ? 'bg-tiketx-blue scale-110' : 'bg-white/30'
              }`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
      {/* Pagination Dots - Desktop/Tablet Only */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden sm:flex space-x-3 z-50">
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
      {/* Place modal at root of component */}
      {/* <LoginSignupModal open={showAuthModal} onOpenChange={setShowAuthModal} redirectPath={authRedirect} /> */}
      {/* Login Modal for privileged actions */}
      <LoginSignupModal
        open={loginModalOpen}
        onOpenChange={open => {
          setLoginModalOpen(open);
          if (!open && loginRedirectPath) {
            navigate(loginRedirectPath);
            setLoginRedirectPath(null);
          }
        }}
        redirectPath={loginRedirectPath}
      />
    </div>
  );
};
