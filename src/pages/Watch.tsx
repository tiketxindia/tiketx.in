
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, Clock } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Hls from 'hls.js';

// Use Vite env variables for Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const Watch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [film, setFilm] = useState<any>(null);
  const [ticket, setTicket] = useState<any>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [timeLeft, setTimeLeft] = useState(3600); // fallback
  const [showPrompt, setShowPrompt] = useState(true);
  const [resumeTime, setResumeTime] = useState(0);

  // Fetch film and ticket info
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      if (!id) return;
      // 1. Fetch film details
      const currentTime = new Date().toISOString();
      const { data: filmData, error: filmError } = await supabase
        .from('films')
        .select('*')
        .eq('id', id)
        .eq('is_published', true)
        .or(`scheduled_release_datetime.is.null,scheduled_release_datetime.lte.${currentTime}`)
        .single();
      if (filmError || !filmData) {
        setError('Film not found or not available yet');
        setLoading(false);
        return;
      }
      setFilm(filmData);
      // 2. Get user
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        setError('You must be logged in to watch this film.');
        setLoading(false);
        return;
      }
      // 3. Check ticket
      const { data: tickets, error: ticketError } = await supabase
        .from('film_tickets')
        .select('id, expiry_date, purchase_date')
        .eq('user_id', user.id)
        .eq('film_id', id)
        .order('purchase_date', { ascending: false })
        .limit(1);
      if (ticketError || !tickets || tickets.length === 0) {
        setError('No valid ticket found.');
        setLoading(false);
        return;
      }
      const t = tickets[0];
      if (!t.expiry_date || new Date(t.expiry_date) < new Date()) {
        setError('Your ticket has expired.');
        setLoading(false);
        return;
      }
      setTicket(t);
      // 4. Get signed Mux URL from Edge Function
      const jwt = (await supabase.auth.getSession()).data.session?.access_token;
      const res = await fetch('https://pfpivefncmkkzmyfkbrz.supabase.co/functions/v1/get-mux-signed-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({ film_id: id, playback_id: filmData.film_playback_id }),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error('Function error:', text);
        setError('Failed to get secure video URL: ' + text);
        setLoading(false);
        return;
      }
      const { signedUrl } = await res.json();
      setSignedUrl(signedUrl);
      // Set time left
      const expiry = new Date(t.expiry_date);
      setTimeLeft(Math.max(0, Math.floor((expiry.getTime() - Date.now()) / 1000)));
      setLoading(false);
    }
    fetchData();
  }, [id]);

  // HLS.js integration
  useEffect(() => {
    if (!signedUrl || !videoRef.current) return;
    const video = videoRef.current;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = signedUrl;
    } else if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(signedUrl);
      hls.attachMedia(video);
      return () => hls.destroy();
    } else {
      video.src = signedUrl;
    }
  }, [signedUrl]);

  // Timer for access remaining
  useEffect(() => {
    if (!ticket) return;
    const interval = setInterval(() => {
      const expiry = new Date(ticket.expiry_date);
      setTimeLeft(Math.max(0, Math.floor((expiry.getTime() - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(interval);
  }, [ticket]);

  // Resume playback from last saved time
  useEffect(() => {
    if (!film || !ticket) return;
    async function fetchProgress() {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;
      const { data } = await supabase
        .from('user_film_progress')
        .select('last_time')
        .eq('user_id', user.id)
        .eq('film_id', film.id)
        .eq('ticket_id', ticket.id)
        .single();
      if (data && typeof data.last_time === 'number') {
        setResumeTime(data.last_time);
        setShowPrompt(true);
      } else {
        setResumeTime(0);
        setShowPrompt(true);
      }
    }
    fetchProgress();
  }, [film, ticket]);

  // Save progress function
  const saveProgress = async () => {
    if (!film || !ticket || !videoRef.current) {
      console.log('[saveProgress] Missing film, ticket, or videoRef');
      return;
    }
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      console.log('[saveProgress] No user');
      return;
    }
    const time = videoRef.current.currentTime;
    const payload = {
      user_id: user.id,
      film_id: film.id,
      ticket_id: ticket.id,
      last_time: time,
    };
    console.log('[saveProgress] Called', { payload });
    await supabase
      .from('user_film_progress')
      .upsert([payload], { onConflict: 'user_id,film_id,ticket_id' });
  };

  // Sync every 5 minutes
  useEffect(() => {
    if (!film || !ticket) return;
    const interval = setInterval(saveProgress, 300000);
    return () => clearInterval(interval);
  }, [film, ticket]);

  // Sync on key video events and on unmount
  useEffect(() => {
    if (!film || !ticket || !videoRef.current || showPrompt) return;
    const video = videoRef.current;
    const onPause = () => {
      console.log('[onPause] Video paused, calling saveProgress');
      saveProgress();
    };
    video.addEventListener('pause', onPause);
    return () => {
      video.removeEventListener('pause', onPause);
    };
  }, [film, ticket, signedUrl, showPrompt]);

  // Still handle beforeunload and visibilitychange globally
  useEffect(() => {
    if (!film || !ticket) return;
    const onUnload = () => { saveProgress(); };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') saveProgress();
    };
    window.addEventListener('beforeunload', onUnload);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('beforeunload', onUnload);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      saveProgress(); // Use upsert on unmount for reliability
    };
  }, [film, ticket]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Robust handlers for resume/start
  const handleResume = () => {
    if (videoRef.current) {
      setShowPrompt(false);
      const video = videoRef.current;
      video.muted = true;
      const onLoadedMetadata = () => {
        video.currentTime = resumeTime;
        video.removeEventListener('loadedmetadata', onLoadedMetadata);
      };
      video.addEventListener('loadedmetadata', onLoadedMetadata);
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setTimeout(() => { video.muted = false; }, 500);
        }).catch(() => {});
      }
    }
  };
  const handleStart = () => {
    if (videoRef.current) {
      setShowPrompt(false);
      const video = videoRef.current;
      video.muted = true;
      const onLoadedMetadata = () => {
        video.currentTime = 0;
        video.removeEventListener('loadedmetadata', onLoadedMetadata);
      };
      video.addEventListener('loadedmetadata', onLoadedMetadata);
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setTimeout(() => { video.muted = false; }, 500);
        }).catch(() => {});
      }
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-400">{error}</div>;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <button 
          onClick={async () => { await saveProgress(); navigate(-1); }}
          className="glass-card p-3 rounded-xl hover:bg-white/20 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center space-x-2 glass-card px-4 py-2 rounded-xl">
          <Clock size={16} className="text-tiketx-blue" />
          <span className="font-mono text-sm">{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Video Player or Resume Prompt */}
      <div className="mx-6 mb-6">
        <div className="relative aspect-video bg-black rounded-2xl overflow-hidden glass-card flex items-center justify-center">
          {signedUrl && (
            <>
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover object-top"
                controls
                autoPlay={false}
                playsInline
                style={{ zIndex: 1 }}
              />
              {showPrompt && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80">
                  {resumeTime > 0 ? (
                    <div className="flex gap-4">
                      <button
                        className="gradient-button text-base font-bold rounded-xl px-6 py-3 flex items-center gap-2"
                        onClick={() => {
                          setShowPrompt(false);
                          if (videoRef.current) {
                            videoRef.current.currentTime = resumeTime;
                            videoRef.current.muted = false;
                            videoRef.current.play();
                          }
                        }}
                      >
                        <Play className="w-5 h-5" /> Resume Watching
                      </button>
                      <button
                        className="glass-card text-base font-bold rounded-xl px-6 py-3 flex items-center gap-2"
                        onClick={async () => {
                          setShowPrompt(false);
                          if (videoRef.current) {
                            videoRef.current.currentTime = 0;
                            videoRef.current.muted = false;
                            videoRef.current.play();
                          }
                          // Save progress as 0 immediately
                          if (film && ticket) {
                            const user = (await supabase.auth.getUser()).data.user;
                            if (user) {
                              const payload = {
                                user_id: user.id,
                                film_id: film.id,
                                ticket_id: ticket.id,
                                last_time: 0,
                              };
                              await supabase
                                .from('user_film_progress')
                                .upsert([payload], { onConflict: 'user_id,film_id,ticket_id' });
                              console.log('[WatchFromBeginning] Set last_time to 0');
                            }
                          }
                        }}
                      >
                        <Play className="w-5 h-5" /> Watch From Beginning
                      </button>
                    </div>
                  ) : (
                    <button
                      className="gradient-button text-base font-bold rounded-xl px-6 py-3 flex items-center gap-2"
                      onClick={() => {
                        setShowPrompt(false);
                        if (videoRef.current) {
                          videoRef.current.currentTime = 0;
                          videoRef.current.muted = false;
                          videoRef.current.play();
                        }
                      }}
                    >
                      <Play className="w-5 h-5" /> Start Watching
                    </button>
                  )}
                </div>
              )}
            </>
          )}
          {!signedUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-tiketx-navy to-tiketx-navy-light">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-tiketx-gradient rounded-full flex items-center justify-center mx-auto">
                  <Play size={32} className="text-white ml-1" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{film?.title || 'Loading...'}</h3>
                  <p className="text-gray-400 text-sm">DRM Protected Content</p>
                  <p className="text-tiketx-blue text-sm">Click to start streaming</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Movie Metadata */}
      <div className="px-6 space-y-4">
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Now Playing</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400 mb-1">Title</p>
              <p className="font-semibold">{film?.title}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Language</p>
              <p className="font-semibold">{film?.language}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Runtime</p>
              <p className="font-semibold">{film?.runtime} minutes</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Quality</p>
              <p className="font-semibold">{film?.quality || 'HD'}</p>
            </div>
          </div>
        </div>
        {/* Access Timer */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">Access Remaining</h3>
              <p className="text-sm text-gray-400">Your viewing window expires in</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-mono font-bold text-tiketx-blue">{formatTime(timeLeft)}</p>
              <p className="text-xs text-gray-400">Auto-expires</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Watch;
