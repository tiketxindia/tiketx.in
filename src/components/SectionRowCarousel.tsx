
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EnhancedFilmCard } from './EnhancedFilmCard';
import { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

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
      console.log('Scrolling:', direction, 'Amount:', scrollAmount);
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    } else {
      console.log('Scroll ref not found');
    }
  };

  // Debug logging
  useEffect(() => {
    console.log('SectionRowCarousel - Title:', title, 'Is Now Showing:', title === 'Now Showing');
    if (title === 'Now Showing') {
      console.log('Rendering Now Showing buttons');
    }
  }, [title]);

  // Navigation buttons in portal
  const navButtons = title === 'Now Showing' ? createPortal(
    <>
      <button
        className="fixed left-4 top-1/2 -translate-y-1/2 z-[10000] bg-black/80 hover:bg-black/90 text-white rounded-full p-3 shadow-xl border border-white/20"
        style={{ pointerEvents: 'auto' }}
        onClick={() => scroll('left')}
        aria-label="Scroll left"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        className="fixed right-4 top-1/2 -translate-y-1/2 z-[10000] bg-black/80 hover:bg-black/90 text-white rounded-full p-3 shadow-xl border border-white/20"
        style={{ pointerEvents: 'auto' }}
        onClick={() => scroll('right')}
        aria-label="Scroll right"
      >
        <ChevronRight size={24} />
      </button>
    </>,
    document.body
  ) : null;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6 px-6 lg:px-12">
        {title === 'Now Showing' ? (
          <h2 className="text-lg md:text-2xl lg:text-3xl font-semibold flex items-center gap-3">
            Now Showing on
            <img src="/tiketx-logo-text.png" alt="TiketX Logo" className="h-10 md:h-10 w-auto align-middle" style={{ display: 'inline-block' }} />
          </h2>
        ) : (
          <h2 className="text-lg md:text-2xl lg:text-3xl font-bold">{title}</h2>
        )}
        {title === 'Now Showing' && (
          <div className="flex items-center space-x-2">
            <button
              className="flex items-center justify-center bg-black/80 hover:bg-black/90 text-white rounded-full p-1 shadow-md border border-white/20"
              style={{ width: 28, height: 28 }}
              onClick={() => scroll('left')}
              aria-label="Scroll left"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              className="flex items-center justify-center bg-black/80 hover:bg-black/90 text-white rounded-full p-1 shadow-md border border-white/20"
              style={{ width: 28, height: 28 }}
              onClick={() => scroll('right')}
              aria-label="Scroll right"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
      <div className="relative">
        <div 
          ref={scrollRef}
          className={`flex space-x-4 px-6 lg:px-12 pb-4 pt-[20px] scrollbar-hide ${title === 'Now Showing' ? 'overflow-x-auto overflow-y-hidden whitespace-nowrap' : 'overflow-visible'}`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => (
            <EnhancedFilmCard key={item.id} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
};
