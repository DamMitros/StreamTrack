"use client";

import SmashFlix from "@/components/smashFlix/SmashFlix";
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SmashFlixPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-slate-900 dark:to-purple-950 transition-all duration-500"></div>

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-300/30 to-pink-400/30 dark:from-purple-400/10 dark:to-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-300/30 to-purple-400/30 dark:from-pink-400/10 dark:to-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-indigo-300/20 to-purple-400/20 dark:from-indigo-400/5 dark:to-purple-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10">
        <div className="py-12">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-500">SmashFlix</span>
                <span className="ml-2 inline-block w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-pulse"></span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">Znajdź idealny film lub serial dopasowany do Twoich preferencji!</p>

              <div className="relative group max-w-2xl mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-500/20 to-indigo-500/20 dark:from-purple-400/10 dark:via-pink-500/10 dark:to-indigo-500/10 rounded-xl blur-xl transition-all duration-500 group-hover:blur-2xl opacity-50"></div>
                <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    Wybierz swoje ulubione platformy streamingowe, gatunki i typ contentu. 
                    Nasz inteligentny algorytm znajdzie dla Ciebie idealne rekomendacje!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 pb-20">
          <SmashFlix />
        </div>

        <div className="flex justify-center">
          <button onClick={() => router.push('/')} className="inline-flex items-center mb-8 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
            <BackIcon className="mr-2" />
            Powrót do strony głównej
          </button>
        </div>
      </div>
    </div>
  );
}

const BackIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 ${className}`}>
    <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
  </svg>
);
