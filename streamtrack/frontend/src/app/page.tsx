"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 transition-all duration-500"></div>
 
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-start px-4 pt-4 pb-8">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="relative group">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-purple-500 to-pink-500 group-hover:from-pink-500 group-hover:via-purple-500 group-hover:to-sky-400 transition-all duration-700">Streamtrack</span>
              <span className="ml-2 inline-block w-4 h-4 bg-gradient-to-r from-sky-400 to-purple-500 rounded-full animate-pulse"></span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mt-6 leading-relaxed">
              Odkrywaj <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-indigo-500">filmy</span> i{" "}
              <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">seriale</span>{" "}
              na różnych platformach streamingowych!
            </p>
          </div>

          <div className="relative group max-w-2xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-sky-400/20 via-purple-500/20 to-pink-500/20 dark:from-sky-400/10 dark:via-purple-500/10 dark:to-pink-500/10 rounded-2xl blur-xl transition-all duration-500 group-hover:blur-2xl opacity-50"></div>
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 transition-all duration-300 hover:shadow-3xl border border-gray-200/50 dark:border-gray-700/50">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 flex items-center justify-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-500">Witaj w Streamtrack!</span>
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                Gotowy na odkrywanie nowych filmów i seriali? Przeszukuj tysiące tytułów, 
                twórz swoją watchlistę i zapisuj notatki o ulubionych produkcjach!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => router.push('/explore')} className="group relative overflow-hidden px-8 py-4 rounded-xl text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-105">
                  <span className="flex items-center justify-center font-semibold">
                    <ExploreIcon className="mr-2" />
                    Eksploruj Filmy i Seriale
                  </span>
                  <span className="absolute inset-0 -z-10 bg-gradient-to-r from-sky-400 to-blue-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></span>
                </button>
                
                <button onClick={() => router.push('/smashflix')} className="group relative overflow-hidden px-8 py-4 rounded-xl text-white bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105">
                  <span className="flex items-center justify-center font-semibold">
                    <SparklesIcon className="mr-2" />
                    SmashFlix - Znajdź Idealne
                  </span>
                  <span className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8 max-w-3xl mx-auto">
            <FeatureCard
              icon={<SearchIcon />}
              title="Eksploruj"
              description="Tysiące filmów i seriali"
              gradient="from-sky-400 to-blue-500"
            />
            <FeatureCard
              icon={<HeartIcon />}
              title="Zapisuj"
              description="Twoja watchlista"
              gradient="from-purple-400 to-pink-500"
            />
            <FeatureCard
              icon={<NotesIcon />}
              title="Notuj"
              description="Dodawaj notatki"
              gradient="from-emerald-400 to-cyan-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const FeatureCard = ({ icon, title, description, gradient }: {
  icon: React.ReactNode; title: string; description: string; gradient: string }) => (
  <div className="group relative">
    <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 group-hover:scale-105">
      <div className={`inline-flex p-2 rounded-lg bg-gradient-to-r ${gradient} text-white mb-3 shadow-lg`}>
        {icon}
      </div>
      <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-1">{title}</h3>
      <p className="text-xs text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  </div>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
  </svg>
);

const ExploreIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 ${className}`}>
    <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
  </svg>
);

const SparklesIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 ${className}`}>
    <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z" clipRule="evenodd" />
  </svg>
);

const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
  </svg>
);

const NotesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z" />
    <path d="M5.25 5.25a3 3 0 00-3 3v10.5a3 3 0 003 3h10.5a3 3 0 003-3V13.5a.75.75 0 00-1.5 0v5.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V8.25a1.5 1.5 0 011.5-1.5h5.25a.75.75 0 000-1.5H5.25z" />
  </svg>
);