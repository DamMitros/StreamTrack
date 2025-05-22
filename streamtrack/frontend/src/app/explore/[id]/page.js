'use client';

import React, { useEffect, useState, Suspense } from 'react'; 
import { useParams, useSearchParams } from 'next/navigation'; 
import Link from 'next/link';
import { getTMDBDetails, getItemWatchProviders } from '@/services/tmdbService';
import { addToWatchlist, checkWatchlistItem, removeFromWatchlist } from '@/services/watchlistService'; 
import NotesSection from '@/components/notes/NotesSection'; 
import { useKeycloak } from '@react-keycloak/web'; 
import SimpleAlert from '@/components/common/SimpleAlert';

function ExploreDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { keycloak, initialized } = useKeycloak(); 
  const mediaId = params.id;
  const mediaTypeFromQuery = searchParams.get('mediaType');

  const [mediaDetails, setMediaDetails] = useState(null);
  const [watchProviders, setWatchProviders] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPlatforms, setShowPlatforms] = useState(false);
  const [mediaType, setMediaType] = useState(mediaTypeFromQuery);
  const [isOnWatchlist, setIsOnWatchlist] = useState(false); 
  const [isCheckingWatchlist, setIsCheckingWatchlist] = useState(false); 
  const [isSubmittingWatchlist, setIsSubmittingWatchlist] = useState(false); 
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('info');
  const [showSimpleAlert, setShowSimpleAlert] = useState(false);

  const displayAlert = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setShowSimpleAlert(true);
  };

  useEffect(() => {
    if (mediaId) {
      const fetchDetailsAndProviders = async () => {
        setIsLoading(true);
        setError('');
        let fetchedDetails = null;
        let determinedMediaType = mediaType;

        if (!determinedMediaType && mediaId) { 
          try {
            fetchedDetails = await getTMDBDetails('movie', mediaId);
            determinedMediaType = 'movie';
          } catch (movieError) {
            console.warn(`Failed to fetch movie details for ${mediaId}, trying TV...`, movieError);
            try {
              fetchedDetails = await getTMDBDetails('tv', mediaId);
              determinedMediaType = 'tv';
            } catch (tvError) {
              console.error(`Failed to fetch TV details for ${mediaId}:`, tvError);
              setError('Nie udało się załadować szczegółów ani jako film, ani jako serial.');
              setIsLoading(false);
              return;
            }
          }
        } else if (determinedMediaType && mediaId) {
            try {
                fetchedDetails = await getTMDBDetails(determinedMediaType, mediaId);
            } catch (e) {
                console.error(`Failed to fetch ${determinedMediaType} details for ${mediaId}:`, e);
                setError(`Nie udało się załadować szczegółów dla ${determinedMediaType === 'movie' ? 'filmu' : 'serialu'}.`);
                setIsLoading(false);
                return;
            }
        } else {
            setError("Brak ID mediów lub typu mediów do załadowania szczegółów.");
            setIsLoading(false);
            return;
        }

        if (fetchedDetails) {
          setMediaDetails({
            id: fetchedDetails.id,
            title: fetchedDetails.title || fetchedDetails.name,
            overview: fetchedDetails.overview,
            posterUrl: fetchedDetails.poster_path ? `https://image.tmdb.org/t/p/w500${fetchedDetails.poster_path}` : '/placeholder-image.jpg',
            genres: fetchedDetails.genres || [],
          });
          setMediaType(determinedMediaType); 

          if (initialized && keycloak.authenticated && fetchedDetails.id) {
            setIsCheckingWatchlist(true);
            try {
              const onWatchlist = await checkWatchlistItem(String(fetchedDetails.id));
              setIsOnWatchlist(onWatchlist);
            } catch (watchlistError) {
              console.error("Failed to check watchlist status:", watchlistError);
            } finally {
              setIsCheckingWatchlist(false);
            }
          }

          if (determinedMediaType) {
            try {
              const providers = await getItemWatchProviders(determinedMediaType, mediaId, 'PL');
              setWatchProviders(providers);
            } catch (providerError) {
              console.error('Nie udało się załadować platform streamingowych:', providerError);
            }
          }
        } else if (!error) { 
          setError('Nie udało się załadować szczegółów.');
        }
        setIsLoading(false);
      };
      fetchDetailsAndProviders();
    }
  }, [mediaId, mediaType, initialized, keycloak.authenticated]); 

  const handleWatchlistAction = async () => {
    if (!mediaDetails || !mediaType) {
      displayAlert('Szczegóły mediów lub typ mediów nie są dostępne.', 'error');
      return;
    }
    if (!initialized || !keycloak.authenticated) {
      displayAlert('Musisz być zalogowany, aby zarządzać listą.', 'error');
      return;
    }

    setIsSubmittingWatchlist(true);
    try {
      if (isOnWatchlist) {
        await removeFromWatchlist(String(mediaDetails.id));
        displayAlert(`${mediaDetails.title} usunięto z listy do obejrzenia.`, 'success');
        setIsOnWatchlist(false);
      } else {
        const itemToAdd = {
          movie_id: String(mediaDetails.id),
          title: mediaDetails.title,
          media_type: mediaType,
        };
        await addToWatchlist(itemToAdd);
        displayAlert(`${mediaDetails.title} dodano do listy do obejrzenia.`, 'success');
        setIsOnWatchlist(true);
      }
    } catch (err) {
      displayAlert(err.message || 'Wystąpił błąd podczas operacji na liście.', 'error');
      console.error(err);
    } finally {
      setIsSubmittingWatchlist(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen text-white bg-gray-900">Ładowanie szczegółów...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500 bg-gray-900">Błąd: {error}</div>;
  }

  if (!mediaDetails) {
    return <div className="flex justify-center items-center h-screen text-white bg-gray-900">Nie znaleziono mediów.</div>;
  }

  const allProviders = [];
  if (watchProviders && watchProviders.PL) {
    const plProviders = watchProviders.PL;
    if (plProviders.flatrate) allProviders.push(...plProviders.flatrate);
    if (plProviders.rent) allProviders.push(...plProviders.rent);
    if (plProviders.buy) allProviders.push(...plProviders.buy);
    if (plProviders.ads) allProviders.push(...plProviders.ads);
    if (plProviders.free) allProviders.push(...plProviders.free);
  }
  const uniqueProviders = Array.from(new Map(allProviders.map(p => [p.provider_id, p])).values());

  return (
    <div className="container mx-auto p-4 text-white min-h-screen bg-gray-900 relative">
      {showSimpleAlert && alertMessage && (
        <SimpleAlert 
          message={alertMessage} 
          type={alertType} 
          onClose={() => setShowSimpleAlert(false)} 
        />
      )}
      <div className="mb-6">
        <Link href="/explore" className="text-blue-400 hover:text-blue-300 transition-colors"> &larr; Powrót do wyszukiwania</Link>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
        <div className="md:flex md:space-x-8">
          <div className="md:w-1/3 mb-6 md:mb-0">
            <img src={mediaDetails.posterUrl} alt={`Plakat ${mediaDetails.title}`} className="rounded-lg w-full h-auto object-cover shadow-lg"/>
          </div>

          <div className="md:w-2/3">
            <h1 className="text-4xl font-bold mb-3">{mediaDetails.title}</h1>
            <div className="mb-4">
              {mediaDetails.genres?.map(genre => (
                <span key={genre.id} className="inline-block bg-gray-700 text-gray-300 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                  {genre.name}
                </span>
              ))}
            </div>
            <p className="text-gray-300 mb-6 text-lg leading-relaxed">{mediaDetails.overview}</p>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <button onClick={handleWatchlistAction}  className={`font-semibold py-2 px-4 rounded-lg shadow transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${ isCheckingWatchlist || isSubmittingWatchlist ? 'bg-gray-500 text-gray-300 cursor-wait' : isOnWatchlist ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500' : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'}`}
                disabled={isCheckingWatchlist || isSubmittingWatchlist || !initialized || !keycloak.authenticated}
              >
                {isCheckingWatchlist ? 'Sprawdzanie...' : isSubmittingWatchlist
                  ? (isOnWatchlist ? 'Usuwanie...' : 'Dodawanie...')
                  : isOnWatchlist 
                    ? 'Usuń z Listy Obejrzenia' 
                    : 'Dodaj do Listy Obejrzenia'}
              </button>
              {uniqueProviders.length > 0 && (
                <button onClick={() => setShowPlatforms(!showPlatforms)} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50">
                  {showPlatforms ? 'Ukryj' : 'Pokaż'} Platformy Streamingowe
                </button>
              )}
            </div>

            {showPlatforms && (
              <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Dostępne na:</h3>
                {uniqueProviders.length > 0 ? (
                  <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {uniqueProviders.map(platform => (
                      <li key={platform.provider_id} className="flex flex-col items-center text-center">
                        {platform.logo_path ? (
                          <img 
                              src={`https://image.tmdb.org/t/p/w92${platform.logo_path}`}
                              alt={`${platform.provider_name} logo`}
                              className="w-12 h-12 object-contain mb-1 rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 mb-1 bg-gray-600 rounded flex items-center justify-center text-xs">Brak logo</div>
                        )}
                        <span className="text-sm text-gray-300">{platform.provider_name}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">Brak informacji o platformach streamingowych dla regionu PL.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {mediaId && mediaType && mediaDetails && (
        <NotesSection mediaId={mediaId} mediaType={mediaType} title={mediaDetails.title} />
      )}

    </div>
  );
}

const ExploreDetailPage = () => {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen text-white bg-gray-900">Ładowanie strony...</div>}>
      <ExploreDetailContent />
    </Suspense>
  );
};

export default ExploreDetailPage;