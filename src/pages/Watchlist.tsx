import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedFilmCard } from '@/components/EnhancedFilmCard';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { LoginSignupModal } from '@/components/LoginSignupModal';
import { useState as useReactState } from 'react';

const Watchlist = () => {
  const [films, setFilms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userTickets, setUserTickets] = useState<Record<string, any>>({});
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loginModalOpen, setLoginModalOpen] = useReactState(false);

  useEffect(() => {
    async function fetchWatchlistAndTickets() {
      setLoading(true);
      const userObj = (await supabase.auth.getUser()).data.user;
      setUser(userObj);
      if (!userObj) {
        setFilms([]);
        setUserTickets({});
        setLoading(false);
        return;
      }
      // Fetch watchlist films
      const { data: watchlistData, error: watchlistError } = await supabase
        .from('user_watchlist')
        .select('film_id, films:film_id(*)')
        .eq('user_id', userObj.id)
        .order('created_at', { ascending: false });
      // Fetch tickets
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('film_tickets')
        .select('film_id, expiry_date')
        .eq('user_id', userObj.id)
        .eq('is_active', true);
      const ticketMap: Record<string, any> = {};
      if (!ticketsError && ticketsData) {
        ticketsData.forEach((t: any) => {
          ticketMap[t.film_id] = t;
        });
      }
      if (!watchlistError && watchlistData) {
        setFilms(watchlistData.map((row: any) => row.films));
      } else {
        setFilms([]);
      }
      setUserTickets(ticketMap);
      setLoading(false);
    }
    fetchWatchlistAndTickets();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4 flex flex-col">
      <div className="w-full">
        <div className="flex items-center mb-8 w-full">
          <button
            className="flex items-center justify-center rounded-xl border border-white/30 bg-black/60 hover:bg-white/10 transition p-3 ml-2 mr-4"
            onClick={() => navigate(-1)}
            aria-label="Back"
            style={{ minWidth: 44, minHeight: 44 }}
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <div className="flex-1 flex justify-start pl-8">
            <h2 className="text-2xl font-bold text-white">My Watchlist</h2>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px] text-lg font-semibold animate-pulse">Loading...</div>
      ) : !user ? (
        <div className="flex flex-1 flex-col items-center justify-center min-h-[300px]">
          <div className="text-lg text-gray-300 mb-6">Sign in to manage your watchlist</div>
          <button
            className="gradient-button px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:scale-105 transition-transform"
            onClick={() => setLoginModalOpen(true)}
          >
            Login
          </button>
          <LoginSignupModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
        </div>
      ) : films.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center min-h-[300px]">
          <div className="text-lg text-gray-400">No films in your watchlist yet.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {films.map(film => {
            const ticket = userTickets[film.id];
            const hasTicket = !!ticket && ticket.expiry_date && new Date(ticket.expiry_date) > new Date();
            const ticketExpiry = ticket && ticket.expiry_date ? ticket.expiry_date : undefined;
            return (
              <div key={film.id} className="flex justify-center h-full">
                <EnhancedFilmCard
                  id={film.id}
                  title={film.title}
                  poster={film.film_thumbnail_vertical || film.film_thumbnail_horizontal}
                  hoverPoster={film.film_thumbnail_horizontal}
                  genre={Array.isArray(film.genres) ? film.genres[0] : (film.genre || '')}
                  duration={film.runtime ? `${film.runtime} min` : ''}
                  year={film.release_year}
                  certificate={film.certificate}
                  language={film.language}
                  description={film.synopsis}
                  type={film.type}
                  ticket_price={film.ticket_price}
                  isInWatchlist={true}
                  hasTicket={hasTicket}
                  ticketExpiry={ticketExpiry}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Watchlist; 