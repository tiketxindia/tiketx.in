
import { MovieCard } from './MovieCard';
import { ChevronRight } from 'lucide-react';

interface Movie {
  id: number;
  title: string;
  poster: string;
  genre: string;
  duration: string;
}

interface MovieSectionProps {
  title: string;
  movies: Movie[];
}

export const MovieSection = ({ title, movies }: MovieSectionProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between px-6 mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <button className="flex items-center text-tiketx-blue hover:text-tiketx-violet transition-colors">
          See All
          <ChevronRight size={16} className="ml-1" />
        </button>
      </div>
      
      <div className="flex space-x-4 overflow-x-auto px-6 pb-4">
        {movies.map((movie) => (
          <MovieCard key={movie.id} {...movie} />
        ))}
      </div>
    </div>
  );
};
