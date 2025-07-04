
import { useState } from 'react';

interface CategorySliderProps {
  categories: string[];
}

export const CategorySlider = ({ categories }: CategorySliderProps) => {
  const [activeCategory, setActiveCategory] = useState('Action');

  return (
    <div className="px-6">
      <h2 className="text-xl font-semibold mb-4">Categories</h2>
      <div className="flex space-x-3 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-300 ${
              activeCategory === category
                ? 'bg-tiketx-gradient text-white'
                : 'glass-card text-gray-300 hover:text-white'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};
