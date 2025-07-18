import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, ArrowLeft, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import "../styles/ticket-animations.css";

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();
  return { day, month, year };
}

function formatTime(dateStr) {
  const date = new Date(dateStr);
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return { hours: hours.toString().padStart(2, '0'), minutes, ampm };
}

const TicketCard = ({ ticket }) => {
  const film = ticket.films;
  const purchase = formatDate(ticket.purchase_date);
  const expiry = formatDate(ticket.expiry_date);
  const purchaseTime = formatTime(ticket.purchase_date);
  const expiryTime = formatTime(ticket.expiry_date);
  const price = ticket.price || 50;
  return (
    <div className="flex flex-col lg:flex-row w-full mt-4 items-center lg:justify-center gap-4 lg:gap-0">
      {/* Card */}
      <div className="w-full max-w-[98vw] lg:max-w-[800px]">
        <div className="relative flex flex-row bg-[#18181b] rounded-[16px] overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-200 min-h-[180px] md:min-h-[240px] group animate-fade-in">
          {/* Notch SVGs as black cut-outs with shadow */}
          <div className="absolute -left-3 md:-left-4 top-1/2 -translate-y-1/2 z-10 w-5 h-5 md:w-8 md:h-8 drop-shadow-lg">
            <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="24" fill="#000" />
            </svg>
          </div>
          <div className="absolute -right-3 md:-right-4 top-1/2 -translate-y-1/2 z-10 w-5 h-5 md:w-8 md:h-8 drop-shadow-lg">
            <svg width="100%" height="100%" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="24" fill="#000" />
            </svg>
          </div>
          {/* Poster + Details with gap */}
          <div className="flex flex-row items-stretch w-full max-w-full gap-2 md:gap-4">
            {/* Poster */}
            <div className="w-[110px] md:w-[180px] h-full bg-black z-20 flex-shrink-0 rounded-l-[16px] overflow-hidden">
              <img src={film?.film_thumbnail_vertical || '/placeholder.svg'} alt={film?.title} className="w-full h-full object-cover" />
            </div>
            {/* Details */}
            <div className="flex-1 flex flex-col gap-2 px-2 py-2 md:px-6 md:py-4 text-white relative z-20 h-full min-w-0">
              <div>
                <div className="text-[11px] md:text-[17px] lg:text-[18px] font-extrabold mb-1 md:mb-2 lg:mb-2 leading-tight truncate">{film?.title} {film?.release_year && `(${film.release_year}, ${film.language})`}</div>
                {/* Labels row */}
                <div className="flex justify-between items-center gap-2 md:gap-8 w-full">
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-400 text-[8px] md:text-[13px] mb-2 md:mb-3 font-bold">Ticket Purchase Date & Time</div>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col items-center mr-4 mb-2 md:mr-10">
                    <div className="text-gray-400 text-[8px] md:text-[13px] font-bold">Ticket Expiry Date & Time</div>
                  </div>
                </div>
                {/* Date/time blocks row */}
                <div className="flex justify-between items-center gap-2 md:gap-8 mb-1 md:mb-2 w-full">
                  {/* Purchase Date/Time (left) */}
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-center gap-0.5 md:gap-1">
                      <div className="bg-[#23232a] rounded-2xl px-1 py-1 md:px-2 md:py-2 flex flex-col items-center min-w-[22px] md:min-w-[40px]">
                        <span className="text-[9px] md:text-lg font-bold tracking-wider">{purchase.day}</span>
                        <span className="uppercase text-[7px] md:text-[13px] font-semibold tracking-widest">{purchase.month}</span>
                        <span className="text-[5px] md:text-[9px] text-gray-400 font-semibold">{purchase.year}</span>
                      </div>
                      <div className="flex gap-0.5 md:gap-1 items-center ml-0.5 md:ml-1">
                        <span className="bg-[#23232a] rounded-xl px-1 py-0.5 md:px-2 md:py-1 text-[7px] md:text-base font-semibold">{purchaseTime.hours}</span>
                        <span className="text-[9px] md:text-lg font-bold">:</span>
                        <span className="bg-[#23232a] rounded-xl px-1 py-0.5 md:px-2 md:py-1 text-[7px] md:text-base font-semibold">{purchaseTime.minutes}</span>
                        <span className="bg-[#23232a] rounded-xl px-1 py-0.5 md:px-2 md:py-1 text-[7px] md:text-base font-semibold ml-0.5 md:ml-1">{purchaseTime.ampm}</span>
                      </div>
                    </div>
                  </div>
                  {/* Separator */}
                  <div className="flex items-center">
                    <div className="w-px md:w-[1px] h-8 md:h-12 bg-gray-700/80 md:bg-white/60 mx-1 md:mx-3 rounded-full" />
                  </div>
                  {/* Expiry Date/Time (right) */}
                  <div className="flex-1 min-w-0 flex flex-col items-center mr-4 md:mr-10">
                    <div className="flex items-center gap-0.5 md:gap-1">
                      <div className="bg-[#23232a] rounded-2xl px-1 py-1 md:px-2 md:py-2 flex flex-col items-center min-w-[22px] md:min-w-[40px]">
                        <span className="text-[9px] md:text-lg font-bold tracking-wider">{expiry.day}</span>
                        <span className="uppercase text-[7px] md:text-[13px] font-semibold tracking-widest">{expiry.month}</span>
                        <span className="text-[5px] md:text-[9px] text-gray-400 font-semibold">{expiry.year}</span>
                      </div>
                      <div className="flex gap-0.5 md:gap-1 items-center ml-0.5 md:ml-1">
                        <span className="bg-[#23232a] rounded-xl px-1 py-0.5 md:px-2 md:py-1 text-[7px] md:text-base font-semibold">{expiryTime.hours}</span>
                        <span className="text-[9px] md:text-lg font-bold">:</span>
                        <span className="bg-[#23232a] rounded-xl px-1 py-0.5 md:px-2 md:py-1 text-[7px] md:text-base font-semibold">{expiryTime.minutes}</span>
                        <span className="bg-[#23232a] rounded-xl px-1 py-0.5 md:px-2 md:py-1 text-[7px] md:text-base font-semibold ml-0.5 md:ml-1">{expiryTime.ampm}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-5 mb-5">
                  <span className="text-gray-400 text-[9px] md:text-[13px] font-semibold">Ticket Price</span>
                  <span className="text-white text-[9px] md:text-[13px] font-bold">₹ {price.toFixed(2)}</span>
                </div>
                {/* Gradient accent line */}
                <div className="h-0.5 md:h-0.7 w-full rounded-full bg-gradient-to-r from-tiketx-blue via-tiketx-violet to-tiketx-pink my-1 md:my-2" />
              </div>
              {/* Amount Paid */}
              <div className="flex justify-between items-center mt-1 md:mt-2 pb-1 md:pb-2">
                <span className="text-[9px] md:text-[15px] text-gray-200 flex items-center gap-1 md:gap-2 font-semibold">
                  Amount Paid
                  <span className="animate-pop">
                    <CheckCircle2 className="text-green-400 w-3 h-3 md:w-5 md:h-5" />
                  </span>
                </span>
                <span className="text-sm md:text-2xl font-extrabold tracking-wider">₹ {price.toFixed(2)}</span>
              </div>
              {/* Rate this film button for mobile/tab (inside card, bottom right, not absolute) */}
              <div className="flex justify-end mt-4 lg:hidden">
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-tiketx-blue via-tiketx-violet to-tiketx-pink text-white font-semibold text-xs shadow-md hover:scale-105 active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-tiketx-blue/50 whitespace-nowrap"
                  onClick={() => alert(`Rate this film: ${film?.title}`)}
                >
                  <Star className="w-4 h-4 text-white" />
                  Rate this film
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Button for desktop (outside card) */}
      <div className="w-full lg:w-[220px] flex justify-center items-center mt-4 lg:mt-0 hidden lg:flex">
        <button
          className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-full bg-gradient-to-r from-tiketx-blue via-tiketx-violet to-tiketx-pink text-white font-semibold text-xs md:text-base shadow-md hover:scale-105 active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-tiketx-blue/50 whitespace-nowrap"
          onClick={() => alert(`Rate this film: ${film?.title}`)}
        >
          <Star className="w-4 h-4 md:w-5 md:h-5 text-white" />
          Rate this film
        </button>
      </div>
    </div>
  );
};

const MyTikets = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchTickets() {
      setLoading(true);
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        setTickets([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('film_tickets')
        .select('id, film_id, purchase_date, expiry_date, is_active, price, films:film_id(id, title, film_thumbnail_vertical, runtime, language, release_year, genres)')
        .eq('user_id', user.id)
        .order('purchase_date', { ascending: false });
      if (!error && data) {
        setTickets(data);
      } else {
        setTickets([]);
      }
      setLoading(false);
    }
    fetchTickets();
  }, []);

  return (
    <div className="min-h-screen bg-black py-10 px-4 md:px-8">
      <div className="w-full">
        <div className="flex items-center mb-8 w-full">
          <button
            className="flex items-center justify-center rounded-xl border border-white/30 bg-black/60 hover:bg-white/10 transition p-3 ml-2 mr-4"
            onClick={() => navigate(-1)}
            aria-label="Back"
            style={{ minWidth: 44, minHeight: 44 }}
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div className="flex-1 flex justify-center">
            <h2 className="text-2xl font-bold text-white text-center">My Tikets</h2>
          </div>
        </div>
        {loading ? (
          <div className="text-center text-gray-400 py-16">Loading...</div>
        ) : tickets.length === 0 ? (
          <div className="text-center text-gray-500 py-16">No tickets found.</div>
        ) : (
          <div className="flex flex-col items-center w-full">
            {tickets.map((ticket) => (
              ticket.films ? <div className="w-[1020px] max-w-full"><TicketCard key={ticket.id} ticket={ticket} /></div> : null
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTikets; 