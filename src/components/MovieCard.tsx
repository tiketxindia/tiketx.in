
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MovieCardProps {
  id: number;
  title: string;
  poster: string;
  genre: string;
  duration: string;
}

export const MovieCard = ({ id, title, poster, genre, duration }: MovieCardProps) => {
  const navigate = useNavigate();

  return (
    <div 
      className="movie-card min-w-[200px] animate-fade-in group"
      onClick={() => navigate(`/movie/${id}`)}
    >
      <div className="relative mb-4">
        <img
          src={poster}
          alt={title}
          className="w-full h-[280px] object-cover rounded-xl"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center">
          <button className="gradient-button">
            <Play size={20} />
          </button>
        </div>
        <div className="absolute top-3 right-3 bg-black/70 px-2 py-1 rounded-lg text-sm">
          
        </div>
      </div>
      
      <h3 className="font-semibold text-lg mb-1 line-clamp-2">{title}</h3>
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span className="bg-tiketx-violet/20 text-tiketx-violet px-2 py-1 rounded-lg">
          {genre}
        </span>
        <span>{duration}</span>
      </div>
    </div>
  );
};
