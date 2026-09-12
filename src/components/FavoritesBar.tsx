import React from 'react';
import { FavoriteLocation } from '../types';

interface FavoritesBarProps {
  favorites: FavoriteLocation[];
  currentCityName: string;
  onSelectFavorite: (fav: FavoriteLocation) => void;
  onRemoveFavorite: (id: string, e: React.MouseEvent) => void;
}

export const FavoritesBar: React.FC<FavoritesBarProps> = ({
  favorites,
  currentCityName,
  onSelectFavorite,
  onRemoveFavorite
}) => {
  if (favorites.length === 0) return null;

  return (
    <div className="w-full flex items-center space-x-2 overflow-x-auto py-2 no-scrollbar border-b border-slate-200/40 dark:border-white/10 mb-6">
      <div className="flex items-center space-x-1 text-xs font-bold text-sky-600 dark:text-sky-400 shrink-0 pr-1">
        <i className="fa-solid fa-star text-amber-400"></i>
        <span>Favorites:</span>
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        {favorites.map((fav) => {
          const isActive = fav.cityName.toLowerCase() === currentCityName.toLowerCase();

          return (
            <button
              key={fav.id}
              onClick={() => onSelectFavorite(fav)}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-sm ${
                isActive
                  ? 'bg-sky-500 text-white shadow-sky-500/30'
                  : 'bg-white/40 dark:bg-slate-800/60 hover:bg-white/70 dark:hover:bg-slate-800 text-slate-800 dark:text-white/90 border border-slate-200/60 dark:border-white/10'
              }`}
            >
              <span>{fav.cityName}</span>
              <span className="text-[10px] opacity-75">({fav.country})</span>
              <span
                role="button"
                aria-label={`Remove ${fav.cityName} from favorites`}
                onClick={(e) => onRemoveFavorite(fav.id, e)}
                className="ml-1 p-0.5 rounded-full hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
              >
                <i className="fa-solid fa-xmark text-[10px]"></i>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
