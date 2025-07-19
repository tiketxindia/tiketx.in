import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedFilmCard } from '@/components/EnhancedFilmCard';
import { Mic, MicOff, Search as SearchIcon } from 'lucide-react';
import { useUserTickets } from '@/hooks/useUserTickets';

const Search = () => {
  const [films, setFilms] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [filmsLoading, setFilmsLoading] = useState(true);
  const recognitionRef = useRef<any>(null);
  const { userTickets, loading: ticketsLoading } = useUserTickets();

  useEffect(() => {
    setFilmsLoading(true);
    supabase.from('films').select('*').then(({ data, error }) => {
      if (!error && data) setFilms(data);
      setFilmsLoading(false);
    });
  }, []);

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
  const filteredFilms = films.filter(film => {
    const term = searchTerm.toLowerCase();
    return (
      film.title?.toLowerCase().includes(term) ||
      film.genre?.toLowerCase().includes(term) ||
      film.language?.toLowerCase().includes(term) ||
      film.synopsis?.toLowerCase().includes(term)
    );
  });

  const isLoading = filmsLoading || ticketsLoading;
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-lg font-semibold animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-0 md:px-8 py-8">
      <div className="max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-8 bg-black/80 border border-white/20 rounded-2xl px-4 py-3 shadow-lg">
          <SearchIcon className="text-gray-400 w-5 h-5" />
          <input
            type="text"
            className="flex-1 bg-transparent outline-none border-none text-lg text-white placeholder-gray-400"
            placeholder="Search movies, genres, languages..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            autoFocus
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {filteredFilms.length === 0 && (
            <div className="col-span-full text-center text-gray-400 text-lg py-16">No films found.</div>
          )}
          {filteredFilms.map(film => {
            const userTicket = userTickets[film.id];
            const ticketExpiry = userTicket && userTicket.expiry_date ? userTicket.expiry_date : null;
            return (
              <EnhancedFilmCard
                key={film.id}
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
                hasTicket={!!userTicket && ticketExpiry && new Date(ticketExpiry) > new Date()}
                ticketExpiry={ticketExpiry}
                type={film.type}
                ticket_price={film.ticket_price}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Search; 