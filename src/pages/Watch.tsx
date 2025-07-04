
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

const Watch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
        <div className="flex items-center space-x-2 glass-card px-4 py-2 rounded-xl">
          <Clock size={16} className="text-tiketx-blue" />
          <span className="font-mono text-sm">{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Video Player */}
      <div className="mx-6 mb-6">
        <div className="relative aspect-video bg-black rounded-2xl overflow-hidden glass-card">
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-tiketx-navy to-tiketx-navy-light">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-tiketx-gradient rounded-full flex items-center justify-center mx-auto">
                <Play size={32} className="text-white ml-1" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Thor: Love and Thunder</h3>
                <p className="text-gray-400 text-sm">DRM Protected Content</p>
                <p className="text-tiketx-blue text-sm">Click to start streaming</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Movie Metadata */}
      <div className="px-6 space-y-4">
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4">Now Playing</h2>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400 mb-1">Title</p>
              <p className="font-semibold">Thor: Love and Thunder</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Language</p>
              <p className="font-semibold">English</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Runtime</p>
              <p className="font-semibold">118 minutes</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Quality</p>
              <p className="font-semibold">4K HDR</p>
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
