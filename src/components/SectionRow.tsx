
import { MovieCard } from './MovieCard';
import { ChevronRight } from 'lucide-react';

interface Media {
  id: number;
  title: string;
  poster: string;
  genre: string;
  duration: string;
  type?: 'movie' | 'series' | 'short';
}

interface SectionRowProps {
  title: string;
  items: Media[];
  sectionId?: string;
}

export const SectionRow = ({ title, items, sectionId }: SectionRowProps) => {
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
        {items.map((item) => (
          <MovieCard key={item.id} {...item} />
        ))}
      </div>
    </div>
  );
};
