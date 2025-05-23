"use client";

import SmashFlix from "@/components/smashFlix/SmashFlix";

export default function HomePage() {
return (
  <div className="max-w-4xl mx-auto pb-12 px-4 flex-grow space-y-12">
    <h1 className="text-5xl font-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">Streamtrack</h1>
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-all duration-300 hover:shadow-2xl">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Witaj!</h2>
      <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">Możesz przeszukiwać filmy i seriale, zapisywać notatki, a także tworzyć własną watchlistę.</p>
    </div>
    <SmashFlix />
  </div>
);

}
