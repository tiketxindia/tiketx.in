
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Plus, Clock, Star } from 'lucide-react';
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
  rating?: number;
  imdbRating?: number;
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
    }, 8000);

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
    <div className="relative h-[500px] md:h-[650px] lg:h-[750px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={currentBanner.backgroundImage}
          alt={currentBanner.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-3xl">
            {/* Title */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight tracking-tight">
              {currentBanner.title}
            </h1>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-3 mb-6 text-gray-300">
              <span className="text-lg font-semibold">{currentBanner.year}</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span className="bg-white/20 px-3 py-1 rounded-lg text-sm font-medium">{currentBanner.certificate}</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span className="text-lg">{currentBanner.duration}</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span className="text-lg">{currentBanner.language}</span>
              {currentBanner.rating && (
                <>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <div className="flex items-center">
                    <Star size={16} className="text-yellow-400 mr-1" />
                    <span className="text-lg font-semibold">{currentBanner.rating}</span>
                  </div>
                </>
              )}
            </div>

            {/* Genre Tags */}
            <div className="flex flex-wrap gap-3 mb-6">
              {currentBanner.genres.map((genre, index) => (
                <span key={index} className="bg-white/10 text-white px-4 py-2 rounded-full text-sm font-medium border border-white/20">
                  {genre}
                </span>
              ))}
            </div>

            {/* Description */}
            <p className="text-gray-300 text-lg md:text-xl mb-8 line-clamp-3 leading-relaxed max-w-2xl">
              {currentBanner.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center gap-4 mb-6">
              {currentBanner.hasTicket ? (
                <div className="flex flex-col">
                  <button 
                    className="gradient-button flex items-center space-x-3 text-lg px-8 py-4 text-xl font-bold"
                    onClick={() => navigate(`/watch/${currentBanner.filmId}`)}
                  >
                    <Play size={28} />
                    <span>Watch Now</span>
                  </button>
                  {currentBanner.ticketExpiry && (
                    <div className="flex items-center text-sm text-gray-400 mt-2 ml-2">
                      <Clock size={16} className="mr-1" />
                      <span>Valid till: {currentBanner.ticketExpiry}</span>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  className="gradient-button flex items-center space-x-3 text-lg px-8 py-4 text-xl font-bold"
                  onClick={() => navigate(`/movie/${currentBanner.filmId}`)}
                >
                  <span className="text-2xl">🎟️</span>
                  <span>Subscribe to Watch</span>
                </button>
              )}

              <button className="glass-card p-4 rounded-full hover:bg-white/20 transition-colors opacity-70 hover:opacity-100 border-2 border-white/30">
                <Plus size={28} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 glass-card p-3 rounded-full hover:bg-white/30 transition-colors z-10"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 glass-card p-3 rounded-full hover:bg-white/30 transition-colors z-10"
      >
        <ChevronRight size={24} />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-tiketx-blue scale-125' : 'bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
