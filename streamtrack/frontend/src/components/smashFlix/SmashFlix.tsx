"use client";

import { useState, useEffect, useCallback } from "react";
import { getMovieProviders, getTvProviders, getMovieGenres, getTvGenres, 
  discoverMovies, discoverTv, Provider, Genre } from "@/services/tmdbService";
import { addToWatchlist, WatchlistItemIn } from "@/services/watchlistService"; 
import { useKeycloak } from "@react-keycloak/web"; 

interface Recommendation {
  id: number;
  title: string;
  poster_path: string;
  overview: string;
}

interface Preferences {
  platforms: number[]; 
  category: "movie" | "tv" | null;
  genres: number[]; 
}

export default function SmashFlix() {
  const { keycloak, initialized } = useKeycloak();
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState<Preferences>({
    platforms: [],
    category: null,
    genres: [],
  });

  const [allAvailablePlatforms, setAllAvailablePlatforms] = useState<Provider[]>([]);
  const [currentAvailableGenres, setCurrentAvailableGenres] = useState<Genre[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingPlatforms, setLoadingPlatforms] = useState(false);
  const [loadingGenres, setLoadingGenres] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [swipeAnimation, setSwipeAnimation] = useState<{ direction: 'left' | 'right' | null; active: boolean }>({ direction: null, active: false });
  const ANIMATION_DURATION = 300; 
  const [showDetailsWarning, setShowDetailsWarning] = useState(false);
  const [itemForDetails, setItemForDetails] = useState<Recommendation | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchPlatforms = async () => {
      setLoadingPlatforms(true);
      setError(null);
      try {
        const [movieProvidersData, tvProvidersData] = await Promise.all([
          getMovieProviders("PL"),
          getTvProviders("PL"),
        ]);

        const combinedPlatforms = [...movieProvidersData.results, ...tvProvidersData.results];
        const uniquePlatforms = Array.from(new Map(combinedPlatforms.map(p => [p.provider_id, p])).values());
        uniquePlatforms.sort((a, b) => a.provider_name.localeCompare(b.provider_name));
        setAllAvailablePlatforms(uniquePlatforms);
      } catch (err) {
        setError("Nie udało się załadować platform. Spróbuj ponownie później.");
        console.error(err);
      }
      setLoadingPlatforms(false);
    };
    fetchPlatforms();
  }, []);

  useEffect(() => {
    if (preferences.category) {
      const fetchGenres = async () => {
        setLoadingGenres(true);
        setError(null);
        setCurrentAvailableGenres([]);
        try {
          let genresData;
          if (preferences.category === "movie") {
            genresData = await getMovieGenres();
          } else {
            genresData = await getTvGenres();
          }
          setCurrentAvailableGenres(genresData.genres);
        } catch (err) {
          setError("Nie udało się załadować gatunków. Spróbuj ponownie później.");
          console.error(err);
        }
        setLoadingGenres(false);
      };
      fetchGenres();
    }
  }, [preferences.category]);

  const handlePlatformToggle = (platformId: number) => {
    setPreferences((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter((id) => id !== platformId)
        : [...prev.platforms, platformId],
    }));
  };

  const handleCategorySelect = (category: "movie" | "tv") => {
    setPreferences((prev) => ({
      ...prev,
      category,
      genres: [], 
    }));
    setStep(3); 
  };

  const handleGenreToggle = (genreId: number) => {
    setPreferences((prev) => ({
      ...prev,
      genres: prev.genres.includes(genreId)
        ? prev.genres.filter((id) => id !== genreId)
        : [...prev.genres, genreId],
    }));
  };

  const fetchRecommendations = useCallback(async () => {
    if (!preferences.category || preferences.platforms.length === 0 || preferences.genres.length === 0) {
      setError("Proszę wybrać platformy, kategorię i przynajmniej jeden gatunek.");
      setRecommendations([]);
      return;
    }
    setLoading(true);
    setError(null);
    setRecommendations([]);
    setCurrentIndex(0);
    setStep(4); 

    try {
      const params = {
        providerIds: preferences.platforms.map(String),
        genreIds: preferences.genres.map(String),
        watchRegion: "PL",
      };
      let data;
      if (preferences.category === "movie") {
        data = await discoverMovies(params);
      } else {
        data = await discoverTv(params);
      }
      setRecommendations(
        data.results.map((item: any) => ({
          id: item.id,
          title: item.title || item.name,
          poster_path: item.poster_path,
          overview: item.overview,
        }))
      );
      if (data.results.length === 0) {
        setError("Nie znaleziono nic pasującego do Twoich kryteriów. Spróbuj zmienić wybór.");
      }
    } catch (err) {
      setError("Wystąpił błąd podczas wyszukiwania. Spróbuj ponownie.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [preferences]);

  const handleSwipe = (direction: "left" | "right") => {
    if (currentIndex >= recommendations.length || swipeAnimation.active) return;

    setSwipeAnimation({ direction, active: true });

    if (direction === "right") {
      const likedItem = recommendations[currentIndex];
      if (keycloak.authenticated && preferences.category) {
        const itemToAdd: WatchlistItemIn = {
          movie_id: likedItem.id.toString(),
          title: likedItem.title,
          media_type: preferences.category,
        };
        addToWatchlist(itemToAdd)
          .then(() => {
            console.log(`${likedItem.title} added to watchlist`);
          })
          .catch((err) => {
            console.error("Failed to add to watchlist:", err);
          });
      }
    }

    setTimeout(() => {
      if (currentIndex < recommendations.length - 1) {
        setCurrentIndex(prevIndex => prevIndex + 1);
      } else {
        setError("To już wszystkie propozycje dla Ciebie! Zmień kryteria, aby zobaczyć więcej.");
      }
      setSwipeAnimation({ direction: null, active: false }); 
    }, ANIMATION_DURATION);
  };

  const resetPreferencesAndStartOver = () => {
    setPreferences({ platforms: [], category: null, genres: [] });
    setRecommendations([]);
    setCurrentIndex(0);
    setError(null);
    setStep(1);
    setShowDetailsWarning(false);
    setItemForDetails(null);
  };

  const handleShowDetails = (item: Recommendation) => {
    setItemForDetails(item);
    setShowDetailsWarning(true);
  };

  const confirmShowDetails = () => {
    setShowDetailsWarning(false);
    if (itemForDetails && preferences.category) {
      window.open(`/explore/${itemForDetails.id}?mediaType=${preferences.category}`, '_blank');
    }
  };

  if (!mounted) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 md:p-8 my-8 transition-all duration-300 hover:shadow-2xl min-h-[500px] border border-gray-100 dark:border-gray-700">
      <h2 className="text-3xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-purple-500 to-pink-500">SmashFlix</h2>

      {error && !loading && (
        <p className="text-red-500 text-center mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 rounded">
          {error}
        </p>
      )}

      {step === 1 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-1 text-center">Krok 1: Wybierz platformy</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">Możesz wybrać wiele.</p>
          
          {loadingPlatforms && (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full animate-spin"></div>
            </div>
          )}
          
          {!loadingPlatforms && allAvailablePlatforms.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6 max-h-60 overflow-y-auto p-2 border rounded-md dark:border-gray-700">
              {allAvailablePlatforms.map((platform) => (
                <button 
                  key={platform.provider_id} 
                  onClick={() => handlePlatformToggle(platform.provider_id)} className={`p-3 rounded-lg shadow text-sm transition-all transform hover:scale-105 flex items-center justify-center space-x-2 ${preferences.platforms.includes(platform.provider_id) ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white ring-2 ring-sky-400"  : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"}`}>
                  {platform.logo_path && (
                    <img 
                      src={`https://image.tmdb.org/t/p/w92${platform.logo_path}`} 
                      alt={platform.provider_name} 
                      className="h-5 w-5 object-contain"
                    />
                  )} 
                  <span>{platform.provider_name}</span>
                </button>
              ))}
            </div>
          )}
          
          {!loadingPlatforms && allAvailablePlatforms.length === 0 && !error && (
            <p className="text-center py-4 text-gray-500 dark:text-gray-400">Nie znaleziono dostępnych platform.</p>
          )}
          
          <button onClick={() => setStep(2)} disabled={preferences.platforms.length === 0 || loadingPlatforms}  className="w-full mt-4 px-6 py-3 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500 dark:disabled:from-gray-700 dark:disabled:to-gray-800">
            Dalej
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 text-center">Krok 2: Wybierz kategorię</h3>
          
          <div className="flex justify-center gap-4 mb-6">
            <button onClick={() => handleCategorySelect("movie")}  className={`px-8 py-4 rounded-lg shadow transition-transform transform hover:scale-105 text-lg ${ preferences.category === "movie"  ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white ring-2 ring-sky-400" : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"}`}>Film</button>    
            <button onClick={() => handleCategorySelect("tv")} className={`px-8 py-4 rounded-lg shadow transition-transform transform hover:scale-105 text-lg ${ preferences.category === "tv"  ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white ring-2 ring-sky-400" : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"}`}>Serial</button>
          </div>
          
          <button onClick={() => setStep(1)} className="mt-6 block mx-auto text-sm text-gray-600 dark:text-gray-400 hover:underline">Wróć do platform</button>
        </div>
      )}

      {step === 3 && preferences.category && (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-1 text-center">
            Krok 3: Wybierz gatunki ({preferences.category === "movie" ? "Film" : "Serial"})
          </h3>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">Możesz wybrać wiele.</p>
          
          {loadingGenres && (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full animate-spin"></div>
            </div>
          )}
          
          {!loadingGenres && currentAvailableGenres.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6 max-h-60 overflow-y-auto p-2 border rounded-md dark:border-gray-700">
              {currentAvailableGenres.map((genre) => (
                <button key={genre.id} onClick={() => handleGenreToggle(genre.id)} className={`p-3 rounded-lg shadow text-sm transition-all transform hover:scale-105 ${preferences.genres.includes(genre.id) ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white ring-2 ring-sky-400" : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"}`}>
                  {genre.name}
                </button>
              ))}
            </div>
          )}
          
          {!loadingGenres && currentAvailableGenres.length === 0 && !error && (
            <p className="text-center py-4 text-gray-500 dark:text-gray-400">
              Nie znaleziono gatunków dla wybranej kategorii.
            </p>
          )}
          
          <button onClick={fetchRecommendations} disabled={preferences.genres.length === 0 || loadingGenres || loading}  className="w-full mt-4 px-6 py-3 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500 dark:disabled:from-gray-700 dark:disabled:to-gray-800">
            {loading ? "Szukam..." : "Pokaż pasujące"}
          </button>
          
          <button onClick={() => setStep(2)} className="mt-6 block mx-auto text-sm text-gray-600 dark:text-gray-400 hover:underline">Wróć do kategorii</button>
        </div>
      )}

      {step === 4 && loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="h-12 w-12 bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full animate-spin mb-4"></div>
          <p className="text-center text-gray-600 dark:text-gray-300">Ładowanie rekomendacji...</p>
        </div>
      )}

      {step === 4 && !loading && recommendations.length > 0 && (
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-xs h-[450px] sm:max-w-sm sm:h-[500px] bg-gray-100 dark:bg-gray-700 rounded-xl shadow-2xl overflow-hidden">
            {recommendations.map((rec, index) => {
              const isActiveCard = index === currentIndex;
              let cardClasses = `absolute inset-0 transition-all ease-in-out transform flex flex-col justify-end duration-${ANIMATION_DURATION}`;

              if (isActiveCard) {
                if (swipeAnimation.active) {
                  if (swipeAnimation.direction === 'left') {
                    cardClasses += ' -translate-x-full -rotate-[15deg] opacity-0';
                  } else if (swipeAnimation.direction === 'right') {
                    cardClasses += ' translate-x-full rotate-[15deg] opacity-0';
                  }
                  cardClasses += ' pointer-events-none'; 
                } else {
                  cardClasses += ' translate-x-0 rotate-0 opacity-100';
                }
              } else {
                cardClasses += ' opacity-0 pointer-events-none';
                if (index < currentIndex) {
                  cardClasses += ' -translate-x-full';
                } else {
                  cardClasses += ' translate-x-full';
                }
              }

              return (
                <div
                  key={rec.id}
                  className={cardClasses}
                  style={{
                    backgroundImage: rec.poster_path ? `url(https://image.tmdb.org/t/p/w500${rec.poster_path})` : undefined,
                    backgroundColor: !rec.poster_path ? '#334155' : undefined, 
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                  <div className="relative p-4 text-white z-10">
                    <h3 className="text-xl sm:text-2xl font-bold mb-1 drop-shadow-lg">{rec.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-200 line-clamp-3 drop-shadow-md">{rec.overview}</p>
                    <button onClick={() => handleShowDetails(rec)} className="mt-2 text-xs bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white py-1 px-2 rounded shadow transition-all duration-300 transform hover:scale-105">
                      Szczegóły
                    </button>
                  </div>
                </div>
              );
            })}

            {(currentIndex >= recommendations.length || !recommendations[currentIndex]?.poster_path) && recommendations[currentIndex] && (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-gray-700">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  {recommendations[currentIndex].title}
                </h3>
                <p className="text-sm text-gray-300 mb-4 line-clamp-6">
                  {recommendations[currentIndex].overview}
                </p>
                <p className="text-xs text-gray-400">(Brak plakatu)</p>
              </div>
            )}
          </div>

          {currentIndex < recommendations.length && (
            <div className="flex justify-center gap-4 sm:gap-6 mt-6">
              <button onClick={() => handleSwipe("left")} disabled={swipeAnimation.active || currentIndex >= recommendations.length} className="px-6 py-3 sm:px-8 sm:py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-full shadow-lg text-lg sm:text-xl font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500 dark:disabled:from-gray-700 dark:disabled:to-gray-800">
                Odrzuć
              </button>
              
              <button onClick={() => handleSwipe("right")} disabled={swipeAnimation.active || currentIndex >= recommendations.length} className="px-6 py-3 sm:px-8 sm:py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-white rounded-full shadow-lg text-lg sm:text-xl font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500 dark:disabled:from-gray-700 dark:disabled:to-gray-800">
                Lubię!
              </button>
            </div>
          )}
          
          <button onClick={resetPreferencesAndStartOver} className="mt-8 text-sm text-sky-500 dark:text-sky-400 hover:underline">
            Zacznij od nowa z innymi kryteriami
          </button>
        </div>
      )}
      
      {showDetailsWarning && itemForDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md border border-gray-200 dark:border-gray-700">
            <h4 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Uwaga!</h4>
            <p className="text-gray-700 dark:text-gray-300 mb-6">Czy chcesz kontynuować i zobaczyć szczegóły dla "{itemForDetails.title}"?</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => setShowDetailsWarning(false)} className="px-6 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md transition-colors">
                Anuluj
              </button>
              <button onClick={confirmShowDetails} className="px-6 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white rounded-md transition-all duration-300 shadow-md">
                Pokaż szczegóły
              </button>
            </div>
          </div>
        </div>
      )}
 
      {step === 4 && !loading && recommendations.length === 0 && !error && (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-300 mb-4">Nie znaleziono rekomendacji dla wybranych kryteriów.</p>
          <button onClick={resetPreferencesAndStartOver} className="text-sky-500 dark:text-sky-400 hover:underline">
            Spróbuj wybrać inne preferencje
          </button>
        </div>
      )}
    </div>
  );
}
