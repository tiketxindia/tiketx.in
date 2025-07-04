
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EnhancedFilmCard } from './EnhancedFilmCard';
import { useRef } from 'react';

interface Media {
  id: number;
  title: string;
  poster: string;
  genre: string;
  rating: number;
  duration: string;
  year?: string;
  certificate?: string;
  language?: string;
  description?: string;
  hasTicket?: boolean;
  ticketExpiry?: string;
  type?: 'movie' | 'series' | 'short';
}

interface SectionRowCarouselProps {
  title: string;
  items: Media[];
  sectionId?: string;
}

export const SectionRowCarousel = ({ title, items, sectionId }: SectionRowCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6 px-6 lg:px-12">
        <h2 className="text-2xl lg:text-3xl font-bold">{title}</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => scroll('left')}
            className="glass-card p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="glass-card p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex space-x-4 overflow-x-auto scrollbar-hide px-6 lg:px-12 pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item) => (
          <EnhancedFilmCard key={item.id} {...item} />
        ))}
      </div>
    </div>
  );
};
