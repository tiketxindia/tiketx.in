
import { Search, User, LogOut, LogIn } from 'lucide-react';
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

const Home = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [heroBanners, setHeroBanners] = useState<any[]>([]);
  const [allFilms, setAllFilms] = useState<any[]>([]);
  const [latestReleases, setLatestReleases] = useState<any[]>([]);
  const [actionPicks, setActionPicks] = useState<any[]>([]);
  const [shortFilms, setShortFilms] = useState<any[]>([]);
  const [userTickets, setUserTickets] = useState<Record<string, any>>({});
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileBtnRef = useRef<HTMLDivElement>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    // Fetch banners
    supabase.from("banners").select("*").order('order', { ascending: true }).then(({ data, error }) => {
      if (!error && data) setHeroBanners(data);
    });
    // Fetch movies by section (example: Now Showing, Action Picks, Short Films)
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
    });
    // Fetch user tickets
    (async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;
      const { data: tickets, error } = await supabase
        .from('film_tickets')
        .select('film_id, expiry_date')
        .eq('user_id', user.id)
        .eq('is_active', true);
      if (!error && tickets) {
        // Map film_id to ticket
        const ticketMap: Record<string, any> = {};
        tickets.forEach(t => {
          ticketMap[t.film_id] = t;
        });
        setUserTickets(ticketMap);
      }
    })();
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
            const { data: tickets, error } = await supabase
              .from('film_tickets')
              .select('film_id, expiry_date')
              .eq('user_id', data.user.id)
              .eq('is_active', true);
            if (!error && tickets) {
              const ticketMap: Record<string, any> = {};
              tickets.forEach(t => {
                ticketMap[t.film_id] = t;
              });
              setUserTickets(ticketMap);
            }
          }
        })();
      }
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setDisplayName(null);
        setUserTickets({});
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

  // Now Showing logic
  const nowShowingFilms = allFilms.filter(film =>
    film.has_ticket &&
    (!film.film_expiry_date || new Date(film.film_expiry_date) >= new Date())
  ).map(film => {
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

  console.log("Now Showing Films", nowShowingFilms);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Main Content - Responsive to sidebar */}
      <div className="transition-all duration-300">
        {/* Desktop & Tablet Search & User - Top Bar */}
        <div className="hidden md:flex items-center justify-between p-6 bg-black/30 backdrop-blur-lg border-b border-white/20">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search movies, series, shows..."
                className="w-full bg-black/40 border border-white/30 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-tiketx-blue focus:border-transparent backdrop-blur-lg"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-lg font-semibold bg-gradient-to-r from-tiketx-blue via-tiketx-violet to-tiketx-pink bg-clip-text text-transparent">
              {(() => {
                let name = user?.user_metadata?.name;
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
        <HeroBannerSlider banners={heroBanners.filter(b => b.enabled)} userTickets={userTickets} showMobileOverlay />

        {/* Content Sections */}
        <SectionRowCarousel title="Now Showing" items={nowShowingFilms} sectionId="now-showing" />
        <SectionRowCarousel title="Action Picks" items={actionPicks} sectionId="action" />
        <SectionRowCarousel title="Short Films" items={shortFilms} sectionId="shorts" />
      </div>
    {/* No longer need a root-level AlertDialog, handled in dropdown */}
    </div>
  );
};

export default Home;
