import { Star } from 'lucide-react';
import { useState } from 'react';

const StarRating = ({ value = 0, onChange, readonly = false, size = 'md' }) => {
  const [hovered, setHovered] = useState(0);

  const sizes = {
    sm: { star: 14, gap: 'gap-0.5' },
    md: { star: 20, gap: 'gap-1'   },
    lg: { star: 28, gap: 'gap-1.5' },
  };

  const { star, gap } = sizes[size];

  return (
    <div className={`flex items-center ${gap}`}>
      {[1, 2, 3, 4, 5].map((star_val) => {
        const filled = star_val <= (hovered || value);
        return (
          <button
            key={star_val}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange?.(star_val)}
            onMouseEnter={() => !readonly && setHovered(star_val)}
            onMouseLeave={() => !readonly && setHovered(0)}
            className={`transition-transform ${
              !readonly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'
            }`}
          >
            <Star
              size={star}
              className={`transition-colors ${
                filled
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-gray-200 fill-gray-200'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;