import React from 'react';

interface FooterProps {
  onSelectCity: (cityName: string, country?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCity }) => {
  const quickCities = [
    { name: 'Tokyo', country: 'Japan' },
    { name: 'London', country: 'UK' },
    { name: 'New York', country: 'USA' },
    { name: 'Delhi', country: 'India' },
    { name: 'Paris', country: 'France' },
    { name: 'Sydney', country: 'Australia' },
    { name: 'Dubai', country: 'UAE' }
  ];

  return (
    <footer className="mt-12 pt-8 pb-6 border-t border-slate-300/40 dark:border-white/10 text-slate-600 dark:text-white/60 text-xs">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Brand, Copyright & Open-Meteo Attribution */}
        <div className="text-center md:text-left space-y-1">
          <p className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center justify-center md:justify-start gap-1.5">
            <i className="fa-solid fa-sun text-amber-500"></i>
            Hamara Weather Website Suite
          </p>
          <p className="opacity-80 text-[11px]">
            Powered by Open-Meteo non-commercial Weather API & Geocoding Service. No proprietary keys required.
          </p>
          <p className="opacity-60 text-[10px]">
            © {new Date().getFullYear()} Hamara Weather. Crafted with Precision Glassmorphism & Atmospheric Live Graphics.
          </p>
        </div>

        {/* Quick City Shortcuts */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
            Global Hubs:
          </span>
          {quickCities.map((c) => (
            <button
              key={c.name}
              onClick={() => onSelectCity(c.name, c.country)}
              className="px-2.5 py-1 rounded-lg bg-white/30 dark:bg-slate-800/60 hover:bg-sky-500/20 text-slate-700 dark:text-sky-300 border border-slate-200/60 dark:border-white/10 text-[11px] font-medium transition-all hover:scale-105"
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
};
