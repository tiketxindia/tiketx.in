
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Plus, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeroBanner {
  id: number;
  title: string;
  year: string;
  language: string;
  duration: string;
  certificate: string;
  description: string;
  genres: string[];
  backgroundImage: string;
  posterImage: string;
  filmId: number;
  hasTicket?: boolean;
  ticketExpiry?: string;
}

interface HeroBannerSliderProps {
  banners: HeroBanner[];
}

export const HeroBannerSlider = ({ banners }: HeroBannerSliderProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 7000);

    return () => clearInterval(timer);
  }, [banners.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (banners.length === 0) return null;

  const currentBanner = banners[currentSlide];

  return (
    <div className="relative h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={currentBanner.backgroundImage}
          alt={currentBanner.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-2xl">
            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              {currentBanner.title}
            </h1>

            {/* Info Line */}
            <div className="flex flex-wrap items-center gap-2 mb-4 text-gray-300">
              <span className="bg-white/20 px-2 py-1 rounded text-sm">{currentBanner.year}</span>
              <span>•</span>
              <span className="bg-white/20 px-2 py-1 rounded text-sm">{currentBanner.certificate}</span>
              <span>•</span>
              <span>{currentBanner.duration}</span>
              <span>•</span>
              <span>{currentBanner.language}</span>
            </div>

            {/* Genre Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {currentBanner.genres.map((genre, index) => (
                <span key={index} className="bg-tiketx-violet/30 text-tiketx-violet px-3 py-1 rounded-full text-sm">
                  {genre}
                </span>
              ))}
            </div>

            {/* Description */}
            <p className="text-gray-300 text-lg mb-6 line-clamp-2 leading-relaxed">
              {currentBanner.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center gap-4">
              {currentBanner.hasTicket ? (
                <div className="flex flex-col">
                  <button 
                    className="gradient-button flex items-center space-x-3 text-lg px-8 py-4"
                    onClick={() => navigate(`/watch/${currentBanner.filmId}`)}
                  >
                    <Play size={24} />
                    <span>Watch Now</span>
                  </button>
                  {currentBanner.ticketExpiry && (
                    <div className="flex items-center text-sm text-gray-400 mt-2">
                      <Clock size={16} className="mr-1" />
                      <span>Valid till: {currentBanner.ticketExpiry}</span>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  className="gradient-button flex items-center space-x-3 text-lg px-8 py-4"
                  onClick={() => navigate(`/movie/${currentBanner.filmId}`)}
                >
                  <span>🎟️</span>
                  <span>Buy Ticket</span>
                </button>
              )}

              <button className="glass-card p-4 rounded-full hover:bg-white/20 transition-colors opacity-70 hover:opacity-100">
                <Plus size={24} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 glass-card p-3 rounded-full hover:bg-white/20 transition-colors z-10"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 glass-card p-3 rounded-full hover:bg-white/20 transition-colors z-10"
      >
        <ChevronRight size={24} />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? 'bg-tiketx-blue' : 'bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
