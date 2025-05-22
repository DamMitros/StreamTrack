import React from "react";

export const MediaTypeSwitcher = ({ selectedMediaType, onSelectMediaType }) => {
  const types = [
    { key: "movie", label: "🎬 Filmy", color: "bg-pink-600" },
    { key: "tv", label: "📺 Seriale", color: "bg-purple-600" },
    { key: "all", label: "🌐 Wszystko", color: "bg-teal-600" },
  ];

  return (
    <div className="mb-6 flex w-full gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
      {types.map(({ key, label, color }) => {
        const isActive = selectedMediaType === key;
        return (
          <button key={key} onClick={() => onSelectMediaType(key)} className={`flex-1 min-h-[60px] px-6 py-4 rounded-2xl text-lg font-bold text-center transition-all duration-200 ease-in-out border border-transparent shadow-sm ${isActive ? `${color} text-white shadow-lg scale-[1.02]` : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900`}>
            {label}
          </button>
        );
      })}
    </div>
  );
};
