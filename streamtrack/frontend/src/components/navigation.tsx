"use client";

import { useTheme } from 'next-themes';
import { useKeycloak } from '@react-keycloak/web';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export const Navigation = () => {
  const { theme, setTheme } = useTheme();
  const { keycloak, initialized } = useKeycloak();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    keycloak.logout({ redirectUri: window.location.origin });
  };

  const isAdmin = initialized && keycloak.authenticated && keycloak.hasRealmRole('admin');  
  const isActive = (path: string) => pathname === path;

  return (
    <header className={`${scrolled ? 'py-2 backdrop-blur-md bg-slate-900/90' : 'py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900'}  text-slate-100 shadow-xl transition-all duration-300 sticky top-0 z-50 border-b border-slate-700/50`}>
      <div className="container mx-auto flex justify-between items-center px-4">
        <button onClick={() => router.push("/")}  className="text-2xl font-extrabold tracking-tighter flex items-center group">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-purple-500 to-pink-500 group-hover:from-pink-500 group-hover:via-purple-500 group-hover:to-sky-400 transition-all duration-500">
            Streamtrack
          </span>
          <span className="ml-1 bg-gradient-to-r from-sky-400 to-purple-500 h-2 w-2 rounded-full animate-pulse"></span>
        </button>
        
        <nav className="flex items-center space-x-1 md:space-x-2">
          <NavButton 
            path="/" 
            label="Strona Główna" 
            icon={<HomeIcon />} 
            active={isActive("/")} 
            router={router} 
          />
          
          <NavButton 
            path="/explore" 
            label="Eksploruj" 
            icon={<ExploreIcon />} 
            active={isActive("/explore")} 
            router={router} 
          />

          <NavButton 
            path="/smashflix" 
            label="SmashFlix" 
            icon={<SmashFlixIcon />} 
            active={isActive("/smashflix")} 
            router={router} 
          />

          {initialized && keycloak.authenticated && (
            <>
              <NavButton 
                path="/watchlist" 
                label="Moja Lista" 
                icon={<WatchlistIcon />} 
                active={isActive("/watchlist")} 
                router={router} 
              />
              
              <NavButton 
                path="/dashboard/user" 
                label="Panel" 
                icon={<UserIcon />} 
                active={isActive("/dashboard/user")} 
                router={router} 
              />
            </>
          )}

          {isAdmin && (
            <button onClick={() => router.push("/dashboard/admin")} className="relative overflow-hidden px-3 py-2 md:px-4 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40" >
              <span className="flex items-center">
                <AdminIcon className="mr-1" />
                <span className="hidden md:inline">Panel Admina</span>
                <span className="md:hidden">Admin</span>
              </span>
              <span className="absolute inset-0 -z-10 bg-gradient-to-r from-sky-400 to-indigo-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></span>
            </button>
          )}

          <button onClick={toggleTheme} className="relative p-2 rounded-full text-slate-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 hover:bg-slate-700/50 backdrop-blur-sm">
            <span className="absolute inset-0 rounded-full bg-slate-700/30 scale-0 transition-transform duration-300 ease-out peer-hover:scale-100"></span>
            {theme === "dark" ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-yellow-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
            )}
          </button>

          {initialized && !keycloak.authenticated ? (
            <button onClick={() => router.push("/login")} className="px-3 py-2 md:px-4 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-lg shadow-green-500/20 hover:shadow-green-500/40">
              <span>Zaloguj się</span>
            </button>
          ) : initialized && keycloak.authenticated ? (
            <div className="flex items-center space-x-3">
              <div className="hidden md:block text-sm font-medium text-slate-300">
                <span className="text-white bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-500">
                  Hej, {keycloak.tokenParsed?.preferred_username || keycloak.tokenParsed?.name || "Użytkowniku"}
                </span>
              </div>
              <button onClick={handleLogout} className="px-3 py-2 md:px-4 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-400 shadow-lg shadow-red-600/20 hover:shadow-red-600/40">
                <span className="flex items-center">
                  <span className="hidden md:inline">Wyloguj</span>
                </span>
              </button>
            </div>
          ) : null}

          {!initialized && (
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-slate-600 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-slate-400">Ładowanie...</span>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

const NavButton = ({ path, label, icon, active, router }: {
  path: string; label: string; icon: React.ReactNode; active: boolean; router: any }) => (
  <button onClick={() => router.push(path)} className={`group px-3 py-2 md:px-4 rounded-lg text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500 relative overflow-hidden ${active ? 'text-white bg-gradient-to-r from-slate-700/80 to-slate-800/80 shadow-lg shadow-slate-900/30' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'}`}>
    <span className="flex items-center">
      <span className="mr-1.5">{icon}</span>
      <span className="hidden md:inline">{label}</span>
    </span>
    {active && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-1/2 bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full"></span>}
    <span className="absolute inset-0 -z-10 bg-gradient-to-r from-sky-400/10 to-indigo-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
  </button>
);

const HomeIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${className}`}>
    <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
    <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75v4.5a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198c.03-.028.061-.056.091-.086L12 5.43z" />
  </svg>
);

const ExploreIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${className}`}>
    <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
  </svg>
);

const SmashFlixIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${className}`}>
    <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z" clipRule="evenodd" />
  </svg>
);

const WatchlistIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${className}`}>
    <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
  </svg>
);

const UserIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${className}`}>
    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
  </svg>
);

const AdminIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${className}`}>
    <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
  </svg>
);