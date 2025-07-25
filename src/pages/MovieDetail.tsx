
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, Calendar, Lock, Globe, ShieldCheck, Clock } from 'lucide-react';
import { EpisodeList } from '@/components/EpisodeList';
import { CastList } from '@/components/CastList';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import YouTube from 'react-youtube';
import { Pause } from 'lucide-react';
import { openRazorpayModal } from '@/lib/razorpay';
import { format } from 'date-fns';
import Confetti from 'react-confetti';
import { useUserTickets } from '@/hooks/useUserTickets';
import { LoginSignupModal } from '@/components/LoginSignupModal';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [film, setFilm] = useState<any>(null);
  const [playingTrailer, setPlayingTrailer] = useState(false);
  const [trailerIsPlaying, setTrailerIsPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const playerRef = useRef<any>(null);
  const [cast, setCast] = useState<any[]>([]);
  const [crew, setCrew] = useState<any[]>([]);
  const [hasTicket, setHasTicket] = useState(false);
  const [ticketExpiry, setTicketExpiry] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { refreshTickets } = useUserTickets();
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Check for valid ticket on mount and after purchase
  useEffect(() => {
    async function checkTicket() {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user || !film?.id) {
        setHasTicket(false);
        setTicketExpiry(null);
        return;
      }
      const { data, error } = await supabase
        .from('film_tickets')
        .select('id, expiry_date')
        .eq('user_id', user.id)
        .eq('film_id', film.id)
        .order('purchase_date', { ascending: false })
        .limit(1);
      if (error || !data || data.length === 0) {
        setHasTicket(false);
        setTicketExpiry(null);
        return;
      }
      const ticket = data[0];
      if (ticket.expiry_date && new Date(ticket.expiry_date) > new Date()) {
        setHasTicket(true);
        setTicketExpiry(ticket.expiry_date);
      } else {
        setHasTicket(false);
        setTicketExpiry(null);
      }
    }
    checkTicket();
  }, [film]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    supabase
      .from('films')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setFilm(data);
        setLoading(false);
      });
    // Fetch cast and crew
    supabase
      .from('creator_movie_map')
      .select('*, creators:creator_id(id, name, profile_image)')
      .eq('movie_id', id)
      .order('order', { ascending: true })
      .then(({ data }) => {
        if (data) {
          setCast(data.filter((entry: any) => entry.role === 'Actor'));
          setCrew(data.filter((entry: any) => entry.role !== 'Actor'));
        }
      });
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }
  if (!film) {
    return <div className="min-h-screen flex items-center justify-center text-white">Film not found</div>;
  }

  // Helper to extract YouTube video ID from URL
  function getYouTubeId(url: string) {
    if (!url) return null;
    const match = url.match(/(?:youtu.be\/|youtube.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  }
  const trailerId = getYouTubeId(film.trailer_link);

  // YouTube player options
  const ytOpts = {
    width: '100%',
    height: '100%',
    playerVars: {
      autoplay: 1,
      controls: 1, // Show native controls (progress bar, play/pause, etc.)
      modestbranding: 1, // Hide YouTube logo
      rel: 0, // Don't show related videos at the end
      showinfo: 0,
      fs: 1, // Allow fullscreen
      iv_load_policy: 3, // Hide video annotations
      disablekb: 0, // Allow keyboard controls
    },
  };

  function onPlayerReady(event: any) {
    playerRef.current = event.target;
    setTrailerIsPlaying(true);
  }
  function handlePausePlay() {
    if (!playerRef.current) return;
    if (trailerIsPlaying) {
      playerRef.current.pauseVideo();
      setTrailerIsPlaying(false);
    } else {
      playerRef.current.playVideo();
      setTrailerIsPlaying(true);
    }
  }
  function onPlayerStateChange(event: any) {
    if (event.data === 1) setTrailerIsPlaying(true); // playing
    if (event.data === 2) setTrailerIsPlaying(false); // paused
  }

  // Add the keyframes for flip-in animation at the top of the file (or inject via a <style> tag if needed)
  if (typeof window !== 'undefined' && !document.getElementById('tiket-flip-in-keyframes')) {
    const style = document.createElement('style');
    style.id = 'tiket-flip-in-keyframes';
    style.innerHTML = `
      @keyframes tiket-flip-in {
        0% {
          transform: perspective(800px) rotateY(90deg) scale(0.8);
          opacity: 0;
        }
        60% {
          transform: perspective(800px) rotateY(-10deg) scale(1.05);
          opacity: 1;
        }
        80% {
          transform: perspective(800px) rotateY(5deg) scale(0.98);
        }
        100% {
          transform: perspective(800px) rotateY(0deg) scale(1);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Helper to generate a unique tiket_id
  async function generateUniqueTiketId() {
    let unique = false;
    let tiketId = '';
    while (!unique) {
      const randomNum = Math.floor(100000 + Math.random() * 900000); // 6 digits
      tiketId = `MYTIKET${randomNum}`;
      const { data } = await supabase.from('film_tickets').select('id').eq('tiket_id', tiketId).single();
      if (!data) unique = true;
    }
    return tiketId;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <button 
          onClick={() => navigate(-1)}
          className="glass-card p-3 rounded-xl hover:bg-white/20 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold">
          Film Details
        </h1>
        <div className="w-10 h-10" />
      </div>

      {/* Hero Banner / Trailer */}
      <div className="relative mb-6">
        <div className="h-[300px] md:h-[400px] relative overflow-hidden rounded-2xl mx-6 group">
          {/* Background Image */}
          <img
            src={film.film_thumbnail_horizontal}
            alt={film.title}
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for dimming */}
          <div className="absolute inset-0 bg-black" style={{ opacity: 0.7 }} />
          {/* Watch Trailer Button */}
          {!playingTrailer || !trailerId ? (
            <button
              className="absolute inset-0 flex items-center justify-center"
              style={{ zIndex: 2 }}
              onClick={() => { setPlayingTrailer(true); setTrailerIsPlaying(true); }}
            >
              <span className="gradient-button flex items-center space-x-2 text-lg px-8 py-4 font-bold rounded-xl">
                <Play size={24} />
                Watch Trailer
              </span>
            </button>
          ) : (
            <div className="w-full h-full relative">
              <YouTube
                videoId={trailerId}
                opts={ytOpts}
                onReady={onPlayerReady}
                onStateChange={onPlayerStateChange}
                className="w-full h-full"
                iframeClassName="w-full h-full rounded-2xl"
              />
              {/* Pause/Play overlay, only show on hover */}
              <button
                className="absolute top-4 right-4 z-10 bg-black/60 rounded-full p-3 hover:bg-black/80 transition opacity-0 group-hover:opacity-100"
                onClick={handlePausePlay}
                style={{ outline: 'none' }}
              >
                {trailerIsPlaying ? <Pause size={28} /> : <Play size={28} />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content Info */}
      <div className="px-6 space-y-6 pb-28 md:pb-28 pb-32">
        <div>
          <h1 className="text-3xl font-bold mb-3">{film.title}</h1>
          <div className="flex flex-wrap gap-2 mb-4">
            {Array.isArray(film.genres) ? film.genres.map((g: string) => (
              <span key={g} className="bg-transparent text-white px-3 py-1 rounded-lg text-sm font-medium border border-white/20">
                {g}
              </span>
            )) : null}
          </div>
          <div className="flex items-center gap-4 text-base font-semibold text-white mb-4 flex-wrap">
            {/* Language */}
            {film.language && (
              <span className="flex items-center gap-1">
                <Globe size={16} className="text-gray-300" />
                {film.language}
              </span>
            )}
            {/* Censor Certificate */}
            {film.censor_certificate && (
              <span className="flex items-center gap-1">
                <ShieldCheck size={16} className="text-gray-300" />
                {film.censor_certificate}
              </span>
            )}
            {/* Release Year */}
            {film.release_year && (
              <span className="flex items-center gap-1">
                <Calendar size={16} className="text-gray-300" />
                {film.release_year}
              </span>
            )}
            {/* Runtime */}
            {film.runtime && (
              <span className="flex items-center gap-1">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-300"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                {film.runtime} min
              </span>
            )}
          </div>
        </div>
        {/* Description */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Synopsis</h3>
          <p className="text-gray-300 leading-relaxed">{film.synopsis}</p>
        </div>
        {/* Watch Film (card with Watch Now button, locked overlay) */}
        {film.film_playback_id && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-3">Watch Film</h3>
            <div className="flex items-center bg-gray-800 rounded-xl p-4 text-white gap-4 relative">
              <div className="relative">
                <img
                  src={film.film_thumbnail_vertical}
                  alt={film.title}
                  className="w-20 h-32 object-cover rounded-lg border border-gray-700"
                />
                {!hasTicket && (
                  <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
                    <Lock size={32} className="text-white/80" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="font-bold text-xl mb-1">{film.title}</div>
                <div className="flex flex-wrap gap-3 text-sm text-gray-300 mb-4">
                  {film.runtime && <span>{film.runtime} min</span>}
                  {film.language && <span>{film.language}</span>}
                  {film.censor_certificate && <span>{film.censor_certificate}</span>}
                </div>
              </div>
              {/* Placeholder for ticket access logic */}
              {(() => { return (
                <div className="flex flex-col items-center justify-end h-full relative group min-w-[260px]">
                  <button
                    className="gradient-button text-base font-bold rounded-xl mt-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed w-full min-w-[220px] max-w-full px-6 py-2"
                    onClick={async () => {
                      const user = (await supabase.auth.getUser()).data.user;
                      if (!user) { setLoginModalOpen(true); return; }
                      navigate(`/watch/${film.id}`);
                    }}
                    disabled={!hasTicket}
                  >
                    <Play size={20} />
                    Watch Now
                  </button>
                  {hasTicket && ticketExpiry && (
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-500 font-medium text-sm shadow-sm border border-green-400/20 w-full min-w-[220px] max-w-full mt-3 justify-center">
                      <Clock className="w-4 h-4" />
                      Valid till: <span className="font-semibold">{format(new Date(ticketExpiry), "dd MMM yyyy, HH:mm")}</span>
                    </span>
                  )}
                  {!hasTicket && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-xs rounded px-3 py-1 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10 shadow-lg">
                      Buy a Tiket to watch this film
                    </div>
                  )}
                </div>
              ); })()}
            </div>
          </div>
        )}
        {/* Cast */}
        {cast.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-3">Cast</h3>
            <div className="flex flex-wrap gap-6">
              {cast.map((entry: any) => (
                <div key={entry.id} className="flex flex-col items-center w-32">
                  <img src={entry.creators?.profile_image || '/default-profile.png'} alt={entry.creators?.name} className="w-16 h-16 rounded-full object-cover mb-2" />
                  <div className="font-semibold text-white text-center">{entry.creators?.name}</div>
                  {entry.character_name && <div className="text-xs text-gray-400 text-center">{entry.character_name}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Crew */}
        {crew.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-3">Crew</h3>
            <div className="flex flex-wrap gap-6">
              {crew.map((entry: any) => (
                <div key={entry.id} className="flex flex-col items-center w-32">
                  <img src={entry.creators?.profile_image || '/default-profile.png'} alt={entry.creators?.name} className="w-16 h-16 rounded-full object-cover mb-2" />
                  <div className="font-semibold text-white text-center">{entry.creators?.name}</div>
                  <div className="text-xs text-gray-400 text-center">{entry.role}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Sticky Pricing & CTA Bar (only show if user does NOT have a valid ticket) */}
      {!hasTicket && (
        <div
          className="fixed bottom-0 left-0 w-full z-50 pointer-events-none movie-buy-bar"
          style={{ pointerEvents: 'none' }}
        >
          <div
            className="w-full flex justify-center mb-20 md:mb-0"
            style={{
              marginLeft: 'var(--sidebar-width, 0px)',
              width: 'calc(100% - var(--sidebar-width, 0px))',
              transition: 'margin-left 0.2s, width 0.2s',
            }}
          >
            <div className="bg-black/90 w-full max-w-none rounded-t-2xl rounded-b-none flex items-center justify-between shadow-2xl px-4 py-2 pb-6 pt-5 pointer-events-auto md:w-full md:mx-0 md:static md:translate-x-0 md:left-0 md:w-full fixed left-1/2 -translate-x-1/2 w-11/12 bottom-20 z-[60] mx-0 md:mb-0 mb-0" >
              <div className="flex flex-col">
                <span className="text-sm text-gray-300">
                  Ticket Price
                </span>
                <span className="font-bold text-tiketx-blue leading-tight text-2xl md:text-3xl">
                  {film.ticket_price ? `Rs.${film.ticket_price}` : ''}
                </span>
              </div>
              <button
                className="gradient-button text-base px-6 py-3 font-bold rounded-2xl mx-4"
                onClick={async () => {
                  // Open Razorpay modal for ticket purchase
                  const user = (await supabase.auth.getUser()).data.user;
                  if (!user) {
                    setLoginModalOpen(true);
                    return;
                  }
                  openRazorpayModal({
                    amount: film.ticket_price * 100, // Razorpay expects paise
                    name: film.title,
                    description: 'Movie Ticket',
                    order_id: undefined, // Optionally pass order_id from backend
                    onSuccess: async (response) => {
                      // On payment success, deactivate previous tickets and insert new one
                      const purchaseDate = new Date();
                      const expiryDate = new Date(purchaseDate.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
                      const tiketId = await generateUniqueTiketId();
                      // 1. Set is_active=false for all previous tickets for this user and film
                      await supabase.from('film_tickets')
                        .update({ is_active: false })
                        .eq('user_id', user.id)
                        .eq('film_id', film.id)
                        .eq('is_active', true);
                      // 2. Insert new ticket with is_active=true
                      const { error } = await supabase.from('film_tickets').insert({
                        user_id: user.id,
                        film_id: film.id,
                        purchase_date: purchaseDate.toISOString(),
                        expiry_date: expiryDate.toISOString(),
                        price: film.ticket_price,
                        is_active: true,
                        tiket_id: tiketId,
                      });
                      if (error) {
                        alert('Failed to save ticket: ' + error.message);
                      } else {
                        setHasTicket(true);
                        setTicketExpiry(expiryDate.toISOString());
                        setShowCelebration(true);
                        setShowConfetti(true);
                        setTimeout(() => setShowConfetti(false), 60000);
                        refreshTickets();
                      }
                    },
                    onFailure: (reason) => {
                      alert('Payment failed or cancelled: ' + reason);
                    },
                  });
                }}
                disabled={!film.ticket_price || hasTicket}
              >
                Buy Tiket
              </button>
              <div className="block md:hidden pb-4" />
              <div className="flex flex-col text-right">
                <span className="text-sm text-gray-300">Available until</span>
                <span className="text-base font-bold text-white">{film.film_expiry_date ? new Date(film.film_expiry_date).toLocaleDateString() : ''}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {showCelebration && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80">
          {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={true} numberOfPieces={300} />}
          <div
            className="relative flex flex-row items-stretch bg-[#f5f5f7] mx-2 overflow-visible"
            style={{
              borderRadius: '18px',
              minWidth: 500,
              maxWidth: 600,
              height: 260,
              position: 'relative',
              alignItems: 'stretch',
              boxShadow: 'none',
              gap: 12,
              animation: 'tiket-flip-in 0.7s cubic-bezier(.68,-0.55,.27,1.55) both',
            }}
          >
            {/* Notch left - center vertically, black */}
            <div style={{
              position: 'absolute', left: -24, top: '50%', transform: 'translateY(-50%)', width: 48, height: 48, zIndex: 10, overflow: 'hidden', pointerEvents: 'none',
            }}>
              <svg width="48" height="48" style={{ position: 'absolute', left: 0, top: 0 }}><circle cx="24" cy="24" r="24" fill="#000" /></svg>
            </div>
            {/* Notch right - center vertically, black */}
            <div style={{
              position: 'absolute', right: -24, top: '50%', transform: 'translateY(-50%)', width: 48, height: 48, zIndex: 10, overflow: 'hidden', pointerEvents: 'none',
            }}>
              <svg width="48" height="48" style={{ position: 'absolute', left: 0, top: 0 }}><circle cx="24" cy="24" r="24" fill="#000" /></svg>
            </div>
            {/* Left: Poster */}
            <div
              style={{
                borderTopLeftRadius: 18,
                borderBottomLeftRadius: 18,
                background: '#fff',
                width: '40%',
                height: '100%',
                display: 'flex',
                alignItems: 'stretch',
                justifyContent: 'center',
                padding: 0,
                position: 'relative',
                overflow: 'hidden',
                margin: 0,
              }}
            >
              <img
                src={film.film_thumbnail_vertical}
                alt={film.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderTopLeftRadius: 18, borderBottomLeftRadius: 18, borderTopRightRadius: 0, borderBottomRightRadius: 0, display: 'block', margin: 0, padding: 0 }}
              />
            </div>
            {/* Right: Details */}
            <div
              style={{
                flex: 1,
                width: '60%',
                height: '100%',
                background: '#f5f5f7',
                borderTopRightRadius: 18,
                borderBottomRightRadius: 18,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                position: 'relative',
                minWidth: 120,
                boxShadow: 'none',
              }}
            >
              {/* Top: Text content */}
              <div className="w-full flex flex-col items-center" style={{padding: 0, margin: 0}}>
                <div className="text-base md:text-lg font-bold text-black text-center mb-2" style={{marginTop: 0, marginBottom: 8}}>
                  {film.title} {film.release_year && `(${film.release_year}${film.language ? ', ' + film.language : ''})`}
                </div>
                <div className="mb-2" style={{fontSize: '2.2rem', lineHeight: 1}}>
                  <span role="img" aria-label="party" style={{fontSize: '2.2rem', verticalAlign: 'middle'}}>🎉</span>
                </div>
                <div className="font-bold mb-2" style={{color: '#b83280', fontSize: '1rem', textAlign: 'center', marginBottom: 8}}>Tiket Bought Successfully !</div>
                <div className="text-sm text-black mb-2 flex items-center gap-1 justify-center" style={{fontWeight: 500}}>
                  Enjoy your movie <span role="img" aria-label="point" style={{fontSize: '1rem', verticalAlign: 'middle'}}>👉</span>
                </div>
                {ticketExpiry && (
                  <div className="text-xs mt-3" style={{color: '#e75480', fontWeight: 500, textAlign: 'center', marginTop: 10}}>
                    Tiket expires on : <span className="font-semibold" style={{color: '#222'}}>{new Date(ticketExpiry).toLocaleString(undefined, { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
              </div>
              {/* Bottom: Buttons */}
              <div className="w-full flex flex-row items-center justify-center gap-3" style={{marginTop: 'auto', paddingTop: 16}}>
                <button
                  className="px-4 py-2 rounded-lg font-bold text-white bg-tiketx-blue hover:bg-tiketx-pink transition-colors"
                  style={{fontSize: '0.95rem'}}
                  onClick={() => {
                    setShowCelebration(false);
                    setShowConfetti(false);
                    navigate(`/watch/${film.id}`);
                  }}
                >
                  Watch Now
                </button>
                <button
                  className="px-4 py-2 rounded-lg font-bold text-black bg-gray-200 hover:bg-gray-300 transition-colors"
                  style={{fontSize: '0.95rem'}}
                  onClick={() => {
                    setShowCelebration(false);
                    setShowConfetti(false);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <LoginSignupModal open={loginModalOpen} onOpenChange={setLoginModalOpen} />
    </div>
  );
};

export default MovieDetail;
