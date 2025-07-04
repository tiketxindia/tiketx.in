
import { Play, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Episode {
  id: number;
  title: string;
  duration: string;
  thumbnail: string;
  episodeNumber: number;
  hasAccess: boolean;
  description?: string;
}

interface EpisodeListProps {
  episodes: Episode[];
  seriesId: number;
}

export const EpisodeList = ({ episodes, seriesId }: EpisodeListProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold px-6">Episodes</h3>
      
      <div className="px-6 space-y-3">
        {episodes.map((episode) => (
          <div key={episode.id} className="glass-card p-4 rounded-xl">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={episode.thumbnail}
                  alt={episode.title}
                  className="w-24 h-16 object-cover rounded-lg"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
                  {episode.hasAccess ? (
                    <Play size={20} className="text-white" />
                  ) : (
                    <Lock size={20} className="text-gray-400" />
                  )}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm text-tiketx-blue font-semibold">
                    Episode {episode.episodeNumber}
                  </span>
                  <span className="text-sm text-gray-400">• {episode.duration}</span>
                </div>
                <h4 className="font-semibold mb-1">{episode.title}</h4>
                {episode.description && (
                  <p className="text-sm text-gray-400 line-clamp-2">{episode.description}</p>
                )}
              </div>
              
              <div>
                {episode.hasAccess ? (
                  <button
                    onClick={() => navigate(`/watch/${seriesId}?episode=${episode.id}`)}
                    className="gradient-button text-sm px-4 py-2"
                  >
                    Watch
                  </button>
                ) : (
                  <button className="bg-gray-600 text-gray-300 text-sm px-4 py-2 rounded-xl cursor-not-allowed">
                    Buy Ticket
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
