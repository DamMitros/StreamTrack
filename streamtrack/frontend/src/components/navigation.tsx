"use client";

import { useTheme } from 'next-themes';
import { useKeycloak } from '@react-keycloak/web';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export const Navigation = () => {
  const { theme, setTheme } = useTheme();
  const { keycloak, initialized } = useKeycloak();
  const router = useRouter();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    keycloak.logout({ redirectUri: window.location.origin });
  };

  const isAdmin = initialized && keycloak.authenticated && keycloak.hasRealmRole('admin');

  return (
    <header className="bg-red-500 text-white shadow-lg p-4 sticky top-0 z-50"> 
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold tracking-tight hover:opacity-80 transition-opacity">Streamtrack</Link>
        <nav className="flex items-center space-x-3 md:space-x-4">
          <button onClick={() => router.push("/")} className="px-3 py-2 md:px-4 rounded-lg text-sm font-medium hover:bg-slate-700 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500">Strona Główna</button>
          <button onClick={() => router.push("/explore")} className="px-3 py-2 md:px-4 rounded-lg text-sm font-medium hover:bg-slate-700 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500">Eksploruj</button>

          {initialized && keycloak.authenticated && (
            <>
              <button onClick={() => router.push("/watchlist")} className="px-3 py-2 md:px-4 rounded-lg text-sm font-medium hover:bg-slate-700 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500">Moja Lista</button>
              <button onClick={() => router.push("/dashboard/user")} className="px-3 py-2 md:px-4 rounded-lg text-sm font-medium hover:bg-slate-700 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500">Panel Użytkownika</button>
            </>
          )}

          {isAdmin && (
            <button onClick={() => router.push("/dashboard/admin")} className="px-3 py-2 md:px-4 rounded-lg text-sm font-medium bg-sky-600 hover:bg-sky-500 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400">Panel Admina</button>
          )}

          <button onClick={toggleTheme} className="flex items-center justify-center p-2 rounded-full hover:bg-slate-700 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500" 
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
            {theme === "dark" ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-yellow-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
            )}
          </button>

          {initialized && !keycloak.authenticated ? (
            <button onClick={() => router.push("/login")} className="px-3 py-2 md:px-4 rounded-lg text-sm font-medium bg-green-600 hover:bg-green-500 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400">Zaloguj się</button>
          ) : initialized && keycloak.authenticated ? (
            <div className="flex items-center space-x-3">
              <p className="text-sm text-slate-300 hidden md:block">Witaj, {keycloak.tokenParsed?.preferred_username || keycloak.tokenParsed?.name || "Użytkowniku"}</p>
              <button onClick={handleLogout} className="px-3 py-2 md:px-4 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400">Wyloguj</button>
            </div>
          ) : null}

          {!initialized && (
            <span className="text-sm text-slate-400">Ładowanie...</span>
          )}
        </nav>
      </div>
    </header>
  );
};