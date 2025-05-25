import React from "react";

export const MediaTypeSwitcher = ({ selectedMediaType, onSelectMediaType }) => {
  const types = [
    { key: "movie", label: "Filmy", icon: "🎬", gradient: "from-pink-500 to-rose-600", color: "pink" },
    { key: "tv", label: "Seriale", icon: "📺", gradient: "from-purple-500 to-indigo-600", color: "purple" },
    { key: "all", label: "Wszystko", icon: "🌐", gradient: "from-emerald-500 to-teal-600", color: "emerald" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        {types.map(({ key, label, icon, gradient, color }) => {
          const isActive = selectedMediaType === key;
          return (
            <button key={key} onClick={() => onSelectMediaType(key)} className={`relative group flex-1 overflow-hidden px-6 py-4 rounded-xl text-base font-bold text-center transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-${color}-300/50 shadow-lg hover:shadow-xl transform hover:scale-[1.02] min-h-[60px] ${isActive ? `bg-gradient-to-r ${gradient} text-white shadow-2xl scale-[1.02]` : "bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-300 border-2 border-gray-200/50 dark:border-gray-600/50 hover:bg-white dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500"}`}>
              <div className="relative z-10 flex items-center justify-center gap-3">
                <span className="text-2xl">{icon}</span>
                <span className="text-lg font-extrabold">{label}</span>
              </div>
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-50"></div>
              )}
              {!isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-50/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
