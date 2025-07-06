
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  filmId: number;
}

interface BannerSliderProps {
  banners: Banner[];
}

export const BannerSlider = ({ banners }: BannerSliderProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

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

  return (
    <div className="relative h-[400px] md:h-[500px] mx-6 mb-8 rounded-2xl overflow-hidden">
      <div className="relative h-full">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            
            <div className="absolute bottom-0 left-0 p-8 text-white">
              <h2 className="text-3xl md:text-5xl font-bold mb-2">{banner.title}</h2>
              <p className="text-lg md:text-xl text-gray-300 mb-6 max-w-2xl">{banner.subtitle}</p>
              <button 
                className="gradient-button flex items-center space-x-2 text-lg"
                onClick={() => navigate(`/movie/${banner.filmId}`)}
              >
                <Play size={24} />
                <span>Watch Now</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 right-8 flex space-x-2">
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
