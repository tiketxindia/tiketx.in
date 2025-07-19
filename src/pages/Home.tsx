
import { Search, User, LogOut, LogIn, Mic, MicOff } from 'lucide-react';
import { CategorySlider } from '@/components/CategorySlider';
import { HeroBannerSlider } from '@/components/HeroBannerSlider';
import { SectionRowCarousel } from '@/components/SectionRowCarousel';
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { createPortal } from 'react-dom';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { LoginSignupModal } from '@/components/LoginSignupModal';
import { useUserTickets } from '@/hooks/useUserTickets';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { EnhancedFilmCard } from '@/components/EnhancedFilmCard';

const Home = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [heroBanners, setHeroBanners] = useState<any[]>([]);
  const [allFilms, setAllFilms] = useState<any[]>([]);
  const [latestReleases, setLatestReleases] = useState<any[]>([]);
  const [actionPicks, setActionPicks] = useState<any[]>([]);
  const [shortFilms, setShortFilms] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileBtnRef = useRef<HTMLDivElement>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const { userTickets, loading: ticketsLoading } = useUserTickets();
  const [bannersLoading, setBannersLoading] = useState(true);
  const [filmsLoading, setFilmsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  useEffect(() => {
    // Fetch banners
    setBannersLoading(true);
    supabase.from("banners").select("*").order('order', { ascending: true }).then(({ data, error }) => {
      if (!error && data) setHeroBanners(data);
      setBannersLoading(false);
    });
    // Fetch movies by section (example: Now Showing, Action Picks, Short Films)
    setFilmsLoading(true);
    supabase.from("films").select("*").then(({ data, error }) => {
      if (!error && data) {
        setAllFilms(data);
        setLatestReleases(data.filter(m => m.type === "movie"));
        setActionPicks(data.filter(m => m.genre === "Action"));
        setShortFilms(data.filter(m => m.type === "short"));
        // Optionally, set categories from genres
        const genres = Array.from(new Set(data.map(m => m.genre)));
        setCategories(genres);
      }
      setFilmsLoading(false);
    });
    // Fetch user for welcome message
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
        // If no user_metadata.name, try users table
        if (!data.user.user_metadata?.name) {
          const { data: userRow } = await supabase
            .from('users')
            .select('display_name')
            .eq('id', data.user.id)
            .single();
          if (userRow?.display_name) setDisplayName(userRow.display_name);
        }
      }
    })();
    // Listen for auth state changes to auto-refresh after login
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        // Re-fetch user info and tickets
        (async () => {
          const { data } = await supabase.auth.getUser();
          if (data?.user) {
            setUser(data.user);
            if (!data.user.user_metadata?.name) {
              const { data: userRow } = await supabase
                .from('users')
                .select('display_name')
                .eq('id', data.user.id)
                .single();
              if (userRow?.display_name) setDisplayName(userRow.display_name);
            }
            // Fetch tickets
            // This part is now handled by useUserTickets hook
          }
        })();
      }
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setDisplayName(null);
        // setUserTickets({}); // This line is no longer needed
      }
    });
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (confirmLogout) {
      (async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
      })();
      setConfirmLogout(false);
    }
  }, [confirmLogout]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileBtnRef.current && !profileBtnRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    if (profileMenuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [profileMenuOpen]);

  // Audio search setup
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchTerm(transcript);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
  }, []);

  // Open modal when search bar is focused or has value
  useEffect(() => {
    if (searchTerm) setSearchModalOpen(true);
    else setSearchModalOpen(false);
  }, [searchTerm]);

  const handleMicClick = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Filter films by search term
  const filterBySearch = (films: any[]) => {
    const term = searchTerm.toLowerCase();
    if (!term) return films;
    return films.filter(film =>
      film.title?.toLowerCase().includes(term) ||
      film.genre?.toLowerCase().includes(term) ||
      film.language?.toLowerCase().includes(term) ||
      film.synopsis?.toLowerCase().includes(term)
    );
  };

  // Now Showing logic
  const nowShowingFilms = filterBySearch(allFilms.filter(film =>
    film.has_ticket &&
    (!film.film_expiry_date || new Date(film.film_expiry_date) >= new Date())
  )).map(film => {
    const genres = Array.isArray(film.genres) ? film.genres : (typeof film.genres === 'string' ? film.genres.split(',').map(g => g.trim()) : []);
    const languages = Array.isArray(film.language) ? film.language : (typeof film.language === 'string' ? film.language.split(',').map(l => l.trim()) : []);
    const userTicket = userTickets[film.id];
    const ticketExpiry = userTicket && userTicket.expiry_date ? userTicket.expiry_date : null;
    return {
      id: film.id,
      title: film.title,
      poster: film.film_thumbnail_vertical,
      hoverPoster: film.film_thumbnail_horizontal,
      genre: genres[0] || '',
      duration: film.runtime ? `${film.runtime} min` : '',
      year: film.release_year || '',
      certificate: film.certificate || '',
      language: languages[0] || '',
      description: film.synopsis || '',
      hasTicket: !!userTicket && ticketExpiry && new Date(ticketExpiry) > new Date(),
      ticketExpiry,
      type: film.type || 'movie',
      ticket_price: film.ticket_price,
    };
  });
  const filteredActionPicks = filterBySearch(actionPicks);
  const filteredShortFilms = filterBySearch(shortFilms);

  console.log("Now Showing Films", nowShowingFilms);

  const isLoading = bannersLoading || filmsLoading || ticketsLoading;
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-lg font-semibold animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Main Content - Responsive to sidebar */}
      <div className="transition-all duration-300">
        {/* Desktop & Tablet Search & User - Top Bar */}
        <div className="hidden md:flex items-center justify-between p-6 bg-black/30 backdrop-blur-lg border-b border-white/20">
          <div className="flex-1 max-w-2xl">
            <div className="relative flex items-center gap-3">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search movies, series, shows..."
                className="w-full bg-black/40 border border-white/30 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-tiketx-blue focus:border-transparent backdrop-blur-lg"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onFocus={() => setSearchModalOpen(true)}
              />
              {('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && (
                <button
                  onClick={handleMicClick}
                  className={`ml-2 p-2 rounded-full transition-colors ${isListening ? 'bg-tiketx-pink/30' : 'hover:bg-white/10'}`}
                  aria-label={isListening ? 'Stop listening' : 'Start voice search'}
                  type="button"
                >
                  {isListening ? <MicOff className="w-5 h-5 text-tiketx-pink animate-pulse" /> : <Mic className="w-5 h-5 text-gray-300" />}
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-lg font-semibold bg-gradient-to-r from-tiketx-blue via-tiketx-violet to-tiketx-pink bg-clip-text text-transparent">
              {(() => {
                let name = user?.user_metadata?.name;
                let nickname = user?.user_metadata?.nickname;
                let useNickname = user?.user_metadata?.use_nickname;
                if (useNickname && nickname) {
                  return `Welcome, ${nickname} 👋`;
                }
                if (!name && displayName) name = displayName;
                if (!name && user?.email) name = user.email;
                return `Welcome, ${name || 'Guest'} 👋`;
              })()}
            </span>
            {user ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    className="w-10 h-10 bg-tiketx-gradient rounded-full flex items-center justify-center focus:outline-none"
                    aria-label="Log out"
                  >
                    <LogOut size={22} className="text-white" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Log out of this account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to log out of this account?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => setConfirmLogout(true)}>
                      Log Out
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <>
                <button
                  className="w-10 h-10 bg-tiketx-gradient rounded-full flex items-center justify-center focus:outline-none"
                  aria-label="Login"
                  onClick={() => setLoginModalOpen(true)}
                >
                  <LogIn size={22} className="text-white" />
                </button>
                <LoginSignupModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
              </>
            )}
          </div>
        </div>

        {/* Hero Banner Slider */}
        <HeroBannerSlider banners={heroBanners.filter(b => b.enabled)} showMobileOverlay />

        {/* Content Sections */}
        <SectionRowCarousel title="Now Showing" items={nowShowingFilms} sectionId="now-showing" />
        {filteredActionPicks.length > 0 && (
          <SectionRowCarousel title="Action Picks" items={filteredActionPicks} sectionId="action" />
        )}
        {filteredShortFilms.length > 0 && (
          <SectionRowCarousel title="Short Films" items={filteredShortFilms} sectionId="shorts" />
        )}
      </div>
      {/* Search Modal */}
      <Dialog open={searchModalOpen} onOpenChange={setSearchModalOpen}>
        <DialogContent className="max-w-3xl w-full bg-black/95 border-none p-8 rounded-2xl">
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search movies, series, shows..."
              className="w-full bg-black/40 border border-white/30 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-tiketx-blue focus:border-transparent backdrop-blur-lg text-lg"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {nowShowingFilms.length === 0 && filteredActionPicks.length === 0 && filteredShortFilms.length === 0 && (
              <div className="col-span-full text-center text-gray-400 text-lg py-16">No films found.</div>
            )}
            {nowShowingFilms.map(film => (
              <EnhancedFilmCard key={film.id} {...film} />
            ))}
            {filteredActionPicks.map(film => (
              <EnhancedFilmCard key={film.id} {...film} />
            ))}
            {filteredShortFilms.map(film => (
              <EnhancedFilmCard key={film.id} {...film} />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    {/* No longer need a root-level AlertDialog, handled in dropdown */}
    </div>
  );
};

export default Home;
