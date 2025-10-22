import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle2, ArrowLeft, Star, Clock, Play, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import "../styles/ticket-animations.css";
import { LoginSignupModal } from '@/components/LoginSignupModal';
import { useState as useReactState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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

function getTimeLeft(expiry) {
  const now = new Date();
  const end = new Date(expiry);
  const diff = end.getTime() - now.getTime();
  if (diff <= 0) return null;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { hours, minutes, seconds };
}

const TicketCard = ({ ticket }) => {
  const film = ticket.films;
  const purchase = formatDate(ticket.purchase_date);
  const expiry = formatDate(ticket.expiry_date);
  const purchaseTime = formatTime(ticket.purchase_date);
  const expiryTime = formatTime(ticket.expiry_date);
  const price = ticket.price || 50;
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(ticket.expiry_date));
  const [isFeesExpanded, setIsFeesExpanded] = useState(false);
  const isExpired = !timeLeft;

  useEffect(() => {
    if (!isExpired) {
      const interval = setInterval(() => {
        setTimeLeft(getTimeLeft(ticket.expiry_date));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [ticket.expiry_date, isExpired]);

  return (
    <div className="flex flex-col lg:flex-row w-full mt-4 items-center lg:justify-center gap-4 lg:gap-0">
      {/* Card */}
      <div className="w-full max-w-[98vw] lg:max-w-[800px]">
        <div className="relative flex flex-row bg-[#18181b] rounded-[16px] overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-200 min-h-[200px] md:min-h-[260px] group animate-fade-in">
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
          <div className="flex flex-row items-stretch w-full max-w-full gap-1.5 md:gap-3">
            {/* Poster */}
            <div className="w-[110px] md:w-[180px] h-full bg-black z-20 flex-shrink-0 rounded-l-[16px] overflow-hidden">
              <img src={film?.film_thumbnail_vertical || '/placeholder.svg'} alt={film?.title} className="w-full h-full object-cover" />
            </div>
            {/* Vertical dotted line */}
            <div className="hidden md:flex h-full">
              <div className="h-full border-l-2 border-dotted border-gray-400/40" />
            </div>
            {/* Details */}
            <div className="flex-1 flex flex-col gap-2 px-2 py-2 md:px-4 md:py-4 text-white relative z-20 h-full min-w-0">
              <div>
                <div className="flex items-center gap-x-2 text-[11px] md:text-[12px] lg:text-[16px] font-extrabold mb-1 mt-1 md:mb-2 lg:mb-2 leading-tight truncate">
                  <span>{film?.title} {film?.release_year && `(${film.release_year}, ${film.language})`}</span>
                  {isExpired ? (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs text-red-400 border border-red-400/60 bg-red-400/10 backdrop-blur-sm">
                      Expired
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs text-green-400 border border-green-400/60 bg-green-400/10 backdrop-blur-sm">
                      Active
                    </span>
                  )}
                  {!isExpired && timeLeft && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/60 text-[11px] font-semibold text-white shadow">
                      <Clock className="w-3 h-3 text-tiketx-blue" />
                      Expires in: {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                    </span>
                  )}
                </div>
                {/* Date/time blocks row */}
                <div className="mb-1 mt-5 md:mb-2 w-full flex flex-col gap-1">
                  <div className="text-gray-400 text-[11px] md:text-[13px] mb-1 font-bold">
                    Ticket Purchase : <span className="text-white font-normal">{purchase.day} {purchase.month} {purchase.year}, {purchaseTime.hours}:{purchaseTime.minutes} {purchaseTime.ampm}</span>
                  </div>
                  <div className="text-gray-400 text-[11px] md:text-[13px] font-bold">
                    Ticket Expiry : <span className="text-white font-normal">{expiry.day} {expiry.month} {expiry.year}, {expiryTime.hours}:{expiryTime.minutes} {expiryTime.ampm}</span>
                  </div>
                </div>
                {/* Fee Breakdown Section */}
                {ticket.price && (parseFloat(ticket.platform_fee) > 0 || parseFloat(ticket.gst_on_platform_fee) > 0) ? (
                  <div className="space-y-2 mt-5 mb-5">
                    {/* Ticket Price */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-[9px] md:text-[13px] font-semibold">Ticket Price</span>
                      <span className="text-white text-[9px] md:text-[13px] font-bold pr-6">₹ {parseFloat(ticket.price).toFixed(2)}</span>
                    </div>
                    
                    {/* Convenience Fee - Collapsible */}
                    <div className="space-y-1">
                      {/* Convenience Fee Header */}
                      <div 
                        className="flex justify-between items-center cursor-pointer hover:bg-gray-800/30 rounded px-1 py-1 transition-colors"
                        onClick={() => setIsFeesExpanded(!isFeesExpanded)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-[9px] md:text-[13px] font-semibold">Convenience Fee</span>
                          {isFeesExpanded ? (
                            <ChevronUp className="w-3 h-3 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                        <span className="text-white text-[9px] md:text-[13px] font-bold pr-6">
                          ₹ {(parseFloat(ticket.platform_fee) + parseFloat(ticket.gst_on_platform_fee)).toFixed(2)}
                        </span>
                      </div>
                      
                      {/* Expanded Fee Details */}
                      <div className={`ml-4 space-y-1 border-l border-gray-600 pl-3 overflow-hidden transition-all duration-300 ${
                        isFeesExpanded ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                        {/* Platform Fee */}
                        {parseFloat(ticket.platform_fee) > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500 text-[8px] md:text-[11px] font-medium">Platform Fee</span>
                            <span className="text-gray-300 text-[8px] md:text-[11px] pr-6">₹ {parseFloat(ticket.platform_fee).toFixed(2)}</span>
                          </div>
                        )}
                        {/* GST */}
                        {parseFloat(ticket.gst_on_platform_fee) > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500 text-[8px] md:text-[11px] font-medium">GST 18% on Platform Fee</span>
                            <span className="text-gray-300 text-[8px] md:text-[11px] pr-6">₹ {parseFloat(ticket.gst_on_platform_fee).toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center mt-5 mb-5">
                    <span className="text-gray-400 text-[9px] md:text-[13px] font-semibold">Ticket Price</span>
                    <span className="text-white text-[9px] md:text-[13px] font-bold pr-6">₹ {price.toFixed(2)}</span>
                  </div>
                )}
                {/* Gradient accent line */}
                <div className="border-t-2 border-dotted border-gray-400/40 w-full my-1 md:my-2" />
              </div>
              {/* Amount Paid */}
              <div className="flex justify-between items-center mt-1 md:mt-2 pb-1 md:pb-2">
                <span className="text-[9px] md:text-[15px] text-gray-200 flex items-center gap-1 md:gap-2 font-semibold">
                  Amount Paid
                  <span className="animate-pop">
                    <CheckCircle2 className="text-green-400 w-3 h-3 md:w-5 md:h-5" />
                  </span>
                </span>
                <span className="text-sm md:text-2xl font-extrabold tracking-wider pr-6">
                  ₹ {(ticket.total_amount_paid ? parseFloat(ticket.total_amount_paid).toFixed(2) : price.toFixed(2))}
                </span>
              </div>
              {/* Tiket ID and Watch Now row */}
              <div className="flex flex-row items-center justify-between mt-2">
                <span className="text-xs font-mono font-bold text-gray-400 select-all">Tiket ID : {ticket.tiket_id}</span>
                <div className="flex gap-2">
                  {!isExpired && (
                    <button
                      className="flex justify-center items-center gap-2 px-4 py-2 min-w-[140px] h-10 rounded-full bg-gradient-to-br from-[#23243a] via-[#2d193c] to-[#3a2323] text-white font-semibold text-sm md:text-base shadow-md hover:opacity-90 active:opacity-80 transition-all focus:outline-none focus:ring-2 focus:ring-tiketx-blue/50 whitespace-nowrap"
                      onClick={() => alert(`Watch now: ${film?.title}`)}
                    >
                      <Play className="w-4 h-4 text-white" />
                      Watch Now
                    </button>
                  )}
                  <button
                    className="flex justify-center items-center gap-2 px-4 py-2 min-w-[140px] h-10 rounded-full bg-[#23232a] text-white font-semibold text-sm md:text-base shadow-md hover:bg-[#18181b] active:bg-black transition-colors focus:outline-none focus:ring-2 focus:ring-tiketx-blue/50 whitespace-nowrap"
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
      </div>
    </div>
  );
};

const MyTikets = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [loginModalOpen, setLoginModalOpen] = useReactState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchTickets() {
      setLoading(true);
      const userObj = (await supabase.auth.getUser()).data.user;
      setUser(userObj);
      if (!userObj) {
        setTickets([]);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('film_tickets')
        .select('id, film_id, purchase_date, expiry_date, is_active, price, platform_fee, gst_on_platform_fee, total_amount_paid, films:film_id(id, title, film_thumbnail_vertical, runtime, language, release_year, genres), tiket_id')
        .eq('user_id', userObj.id)
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
    <TooltipProvider>
      <div className="min-h-screen bg-black py-10 px-4 md:px-8 flex flex-col">
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
          <div className="flex-1 flex justify-start pl-8">
            <h2 className="text-2xl font-bold text-white">My Tikets</h2>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center min-h-[200px] text-lg font-semibold animate-pulse">Loading...</div>
      ) : !user ? (
        <div className="flex flex-1 flex-col items-center justify-center min-h-[300px]">
          <div className="text-lg text-gray-300 mb-6">Sign in to view your tickets</div>
          <button
            className="gradient-button px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:scale-105 transition-transform"
            onClick={() => setLoginModalOpen(true)}
          >
            Login
          </button>
          <LoginSignupModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center min-h-[300px]">
          <div className="text-lg text-gray-400">No tickets found.</div>
        </div>
      ) : (
        <div className="flex flex-col gap-8 items-center">
          {tickets.map(ticket => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
    </TooltipProvider>
  );
};

export default MyTikets; 