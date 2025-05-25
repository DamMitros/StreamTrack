'use client';

import React, { useEffect, useState, Suspense } from 'react'; 
import { useParams, useSearchParams } from 'next/navigation'; 
import Link from 'next/link';
import { getTMDBDetails, getItemWatchProviders, getMediaReviews, getMediaCredits, 
  getSimilarMedia, getMediaVideos, getMediaExternalIds } from '@/services/tmdbService';
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
  const [reviews, setReviews] = useState({ results: [], total_results: 0 });
  const [credits, setCredits] = useState({ cast: [], crew: [] });
  const [similarMedia, setSimilarMedia] = useState({ results: [] });
  const [videos, setVideos] = useState({ results: [] });
  const [externalIds, setExternalIds] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReviews, setShowReviews] = useState(false);
  const [showCast, setShowCast] = useState(false);
  const [showSimilar, setShowSimilar] = useState(false);
  const [mediaType, setMediaType] = useState(mediaTypeFromQuery);
  const [isOnWatchlist, setIsOnWatchlist] = useState(false); 
  const [isCheckingWatchlist, setIsCheckingWatchlist] = useState(false); 
  const [isSubmittingWatchlist, setIsSubmittingWatchlist] = useState(false); 
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState('info');
  const [showSimpleAlert, setShowSimpleAlert] = useState(false);
  const [showTrailers, setShowTrailers] = useState(false);

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
          const mediaData = {
            id: fetchedDetails.id,
            title: fetchedDetails.title || fetchedDetails.name,
            overview: fetchedDetails.overview,
            posterUrl: fetchedDetails.poster_path ? `https://image.tmdb.org/t/p/w500${fetchedDetails.poster_path}` : '/placeholder-image.jpg',
            backdropUrl: fetchedDetails.backdrop_path ? `https://image.tmdb.org/t/p/w1280${fetchedDetails.backdrop_path}` : null,
            genres: fetchedDetails.genres || [],
            voteAverage: fetchedDetails.vote_average || 0,
            voteCount: fetchedDetails.vote_count || 0,
            releaseDate: fetchedDetails.release_date || fetchedDetails.first_air_date,
            runtime: fetchedDetails.runtime,
            numberOfSeasons: fetchedDetails.number_of_seasons,
            numberOfEpisodes: fetchedDetails.number_of_episodes,
            status: fetchedDetails.status,
            originalLanguage: fetchedDetails.original_language,
            productionCompanies: fetchedDetails.production_companies || [],
            productionCountries: fetchedDetails.production_countries || [],
          };
          setMediaDetails(mediaData);
          setMediaType(determinedMediaType);

          try {
            const [reviewsData, creditsData, similarData, videosData, externalIdsData] = await Promise.all([
              getMediaReviews(determinedMediaType, mediaId),
              getMediaCredits(determinedMediaType, mediaId),
              getSimilarMedia(determinedMediaType, mediaId),
              getMediaVideos(determinedMediaType, mediaId),
              getMediaExternalIds(determinedMediaType, mediaId),
            ]);

            setReviews(reviewsData);
            setCredits(creditsData);
            setSimilarMedia(similarData);
            setVideos(videosData);
            setExternalIds(externalIdsData);
          } catch (additionalDataError) {
            console.error("Failed to fetch additional data:", additionalDataError);
          } 

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
              console.log('Raw watch providers data:', providers);
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
    return (
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 transition-all duration-500"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-sky-300/30 to-purple-400/30 dark:from-sky-400/10 dark:to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-300/30 to-indigo-400/30 dark:from-pink-400/10 dark:to-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="relative z-10 flex justify-center items-center h-screen">
          <div className="text-center space-y-4">
            <div className="inline-block w-12 h-12 border-4 border-gray-300 dark:border-gray-600 border-t-sky-500 rounded-full animate-spin"></div>
            <p className="text-xl font-medium text-gray-700 dark:text-gray-300">Ładowanie szczegółów...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-red-50 dark:from-gray-900 dark:via-slate-900 dark:to-red-950 transition-all duration-500"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-300/30 to-pink-400/30 dark:from-red-400/10 dark:to-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>
        <div className="relative z-10 flex justify-center items-center h-screen">
          <div className="max-w-md mx-auto text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto">
              <span className="text-white text-2xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Wystąpił błąd</h2>
            <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
            <Link href="/explore" className="inline-block bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105">
              Powrót do wyszukiwania
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!mediaDetails) {
    return (
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-gray-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-950 transition-all duration-500"></div>
        <div className="relative z-10 flex justify-center items-center h-screen">
          <div className="max-w-md mx-auto text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto">
              <span className="text-white text-2xl">🔍</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Nie znaleziono mediów</h2>
            <p className="text-gray-600 dark:text-gray-400">Nie udało się znaleźć szczegółów dla tego tytułu.</p>
            <Link href="/explore" className="inline-block bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105">
              Powrót do wyszukiwania
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const allProviders = [];
  if (watchProviders) {
    const providers = watchProviders.PL ? watchProviders.PL : watchProviders;
    console.log('Processing providers:', providers);
    if (providers.flatrate) allProviders.push(...providers.flatrate);
    if (providers.rent) allProviders.push(...providers.rent);
    if (providers.buy) allProviders.push(...providers.buy);
    if (providers.ads) allProviders.push(...providers.ads);
    if (providers.free) allProviders.push(...providers.free);
  }
  const uniqueProviders = Array.from(new Map(allProviders.map(p => [p.provider_id, p])).values());
  console.log('Final unique providers:', uniqueProviders);

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 transition-all duration-500"></div>

      <div className="relative z-10 container mx-auto p-4 text-gray-900 dark:text-white min-h-screen">
        {showSimpleAlert && alertMessage && (
          <SimpleAlert 
            message={alertMessage} 
            type={alertType} 
            onClose={() => setShowSimpleAlert(false)} 
          />
        )}

        <div className="relative group max-w-6xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-400/20 via-purple-500/20 to-pink-500/20 dark:from-sky-400/10 dark:via-purple-500/10 dark:to-pink-500/10 rounded-2xl blur-xl transition-all duration-500 group-hover:blur-2xl opacity-50"></div>
          <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 transition-all duration-300 hover:shadow-3xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="lg:flex lg:space-x-8">
              <div className="lg:w-1/3 mb-8 lg:mb-0">
                <div className="relative group mb-4">
                  <img src={mediaDetails.posterUrl} alt={`Plakat ${mediaDetails.title}`} className="rounded-xl w-full h-auto object-cover shadow-2xl transition-transform duration-300 group-hover:scale-105"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>

              <div className="lg:w-2/3">
                <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-purple-600 to-indigo-600 dark:from-white dark:via-purple-400 dark:to-sky-400">{mediaDetails.title}</h1>

                <div className="flex flex-wrap items-center gap-4 mb-4">
                  {mediaDetails.voteAverage > 0 && (
                    <div className="flex items-center bg-gradient-to-r from-amber-400/20 to-orange-500/20 dark:from-amber-400/20 dark:to-orange-500/20 px-3 py-1.5 rounded-full border border-amber-200/50 dark:border-amber-700/50">
                      <span className="text-amber-600 dark:text-amber-400 text-lg mr-1">⭐</span>
                      <span className="font-semibold text-amber-700 dark:text-amber-300">{mediaDetails.voteAverage.toFixed(1)}/10</span>
                      {mediaDetails.voteCount && (
                        <span className="text-sm text-amber-600 dark:text-amber-400 ml-1">({mediaDetails.voteCount.toLocaleString()} głosów)</span>
                      )}
                    </div>
                  )}
                  
                  {mediaDetails.releaseDate && (
                    <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 dark:from-blue-400/20 dark:to-cyan-400/20 px-3 py-1.5 rounded-full border border-blue-200/50 dark:border-blue-700/50">
                      <span className="text-blue-700 dark:text-blue-300 font-medium">
                        {new Date(mediaDetails.releaseDate).getFullYear()}
                      </span>
                    </div>
                  )}
                  
                  {mediaDetails.runtime && (
                    <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 dark:from-green-400/20 dark:to-emerald-400/20 px-3 py-1.5 rounded-full border border-green-200/50 dark:border-green-700/50">
                      <span className="text-green-700 dark:text-green-300 font-medium">
                        {Math.floor(mediaDetails.runtime / 60)}h {mediaDetails.runtime % 60}min
                      </span>
                    </div>
                  )}
                  
                  {mediaDetails.numberOfSeasons && (
                    <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 dark:from-purple-400/20 dark:to-pink-400/20 px-3 py-1.5 rounded-full border border-purple-200/50 dark:border-purple-700/50">
                      <span className="text-purple-700 dark:text-purple-300 font-medium">
                        {mediaDetails.numberOfSeasons} {mediaDetails.numberOfSeasons === 1 ? 'sezon' : 'sezony'}
                      </span>
                    </div>
                  )}
                  
                  {externalIds.imdb_id && (
                    <a href={`https://www.imdb.com/title/${externalIds.imdb_id}`}
                      target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 dark:from-yellow-400/20 dark:to-orange-500/20 px-3 py-1.5 rounded-full border border-yellow-200/50 dark:border-yellow-700/50 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors">
                      <span className="text-yellow-700 dark:text-yellow-300 font-medium">IMDb</span>
                    </a>
                  )}
                </div>

                {uniqueProviders.length > 0 && (
                  <div className="relative group mb-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 via-pink-500/10 to-indigo-500/10 rounded-xl blur-xl transition-all duration-500 opacity-50"></div>
                    <div className="relative bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50 dark:border-gray-600/50">
                      <h3 className="text-lg font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">🎬 Dostępne na platformach:</h3>
                      <div className="flex flex-wrap gap-3">
                        {uniqueProviders.slice(0, 8).map(platform => (
                          <div key={platform.provider_id} className="group flex items-center gap-2 p-2 rounded-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                            {platform.logo_path ? (
                              <img 
                                src={`https://image.tmdb.org/t/p/w92${platform.logo_path}`}
                                alt={`${platform.provider_name} logo`}
                                className="w-6 h-6 object-contain rounded transition-transform duration-300 group-hover:scale-110"
                              />
                            ) : (
                              <div className="w-6 h-6 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">?</div>
                            )}
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{platform.provider_name}</span>
                          </div>
                        ))}
                        {uniqueProviders.length > 8 && (
                          <div className="flex items-center px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200/50 dark:border-gray-600/50">
                            <span className="text-sm text-gray-600 dark:text-gray-400">+{uniqueProviders.length - 8} więcej</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  {mediaDetails.genres?.map(genre => (
                    <span key={genre.id} className="inline-block bg-gradient-to-r from-purple-500/20 to-indigo-500/20 dark:from-purple-400/20 dark:to-indigo-400/20 text-purple-700 dark:text-purple-300 text-sm font-semibold mr-2 mb-2 px-3 py-1.5 rounded-full border border-purple-200/50 dark:border-purple-700/50 backdrop-blur-sm">
                      {genre.name}
                    </span>
                  ))}
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 mb-8 text-lg leading-relaxed">{mediaDetails.overview}</p>
                {showCast && credits.cast?.length > 0 && (
                  <div className="relative group mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 via-cyan-500/10 to-blue-500/10 rounded-xl blur-xl transition-all duration-500 opacity-50"></div>
                    <div className="relative bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-600/50">
                      <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-cyan-600 dark:from-emerald-400 dark:to-cyan-400">Obsada</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {credits.cast.slice(0, 12).map(actor => (
                          <div key={actor.id} className="group text-center">
                            <div className="relative mb-2 overflow-hidden rounded-lg">
                              {actor.profile_path ? (
                                <img 
                                  src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                                  alt={actor.name}
                                  className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                              ) : (
                                <div className="w-full h-32 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center">
                                  <span className="text-gray-500 dark:text-gray-300 text-2xl">👤</span>
                                </div>
                              )}
                            </div>
                            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{actor.name}</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{actor.character}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {showReviews && reviews.results?.length > 0 && (
                  <div className="relative group mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 via-orange-500/10 to-red-500/10 rounded-xl blur-xl transition-all duration-500 opacity-50"></div>
                    <div className="relative bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-600/50">
                      <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400">Recenzje ({reviews.total_results})</h3>
                      <div className="space-y-4">
                        {reviews.results.slice(0, 3).map(review => (
                          <div key={review.id} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50 dark:border-gray-600/50">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900 dark:text-white">{review.author}</h4>
                              {review.author_details?.rating && (
                                <div className="flex items-center bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded">
                                  <span className="text-amber-600 dark:text-amber-400 mr-1">⭐</span>
                                  <span className="text-sm font-medium text-amber-700 dark:text-amber-300">{review.author_details.rating}/10</span>
                                </div>
                              )}
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                              {review.content.length > 300 
                                ? `${review.content.substring(0, 300)}...` 
                                : review.content}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              {new Date(review.created_at).toLocaleDateString('pl-PL')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {showSimilar && similarMedia.results?.length > 0 && (
                  <div className="relative group mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/10 via-purple-500/10 to-pink-500/10 rounded-xl blur-xl transition-all duration-500 opacity-50"></div>
                    <div className="relative bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-600/50">
                      <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Podobne {mediaType === 'movie' ? 'filmy' : 'seriale'}</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {similarMedia.results.slice(0, 12).map(item => (
                          <Link key={item.id} href={`/explore/${item.id}?mediaType=${mediaType}`} className="group block">
                            <div className="relative mb-2 overflow-hidden rounded-lg">
                              {item.poster_path ? (
                                <img 
                                  src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                                  alt={item.title || item.name}
                                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                                />
                              ) : (
                                <div className="w-full h-48 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center">
                                  <span className="text-gray-500 dark:text-gray-300 text-2xl">🎬</span>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <h4 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{item.title || item.name}</h4>
                            {item.vote_average > 0 && (
                              <div className="flex items-center mt-1">
                                <span className="text-amber-500 text-xs mr-1">⭐</span>
                                <span className="text-xs text-gray-600 dark:text-gray-400">{item.vote_average.toFixed(1)}</span>
                              </div>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {showTrailers && videos.results?.length > 0 && (
                  <div className="relative group mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-400/10 via-pink-500/10 to-purple-500/10 rounded-xl blur-xl transition-all duration-500 opacity-50"></div>
                    <div className="relative bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-600/50">
                      <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-pink-600 dark:from-red-400 dark:to-pink-400">🎬 Zwiastuny i wideo</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {videos.results.slice(0, 6).map(video => (
                          <div key={video.id} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50 dark:border-gray-600/50 hover:shadow-lg transition-shadow">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{video.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{video.type}</p>
                            {video.site === 'YouTube' && (
                              <iframe
                                src={`https://www.youtube.com/embed/${video.key}`}
                                title={video.name}
                                className="w-full h-48 rounded-lg"
                                frameBorder="0"
                                allowFullScreen
                              ></iframe>
                            )}
                          </div>
                        ))}
                      </div>
                      {videos.results.length > 6 && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">Pokazano 6 z {videos.results.length} dostępnych wideo</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mt-8 px-8">
              <button onClick={handleWatchlistAction} className={`relative overflow-hidden font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${isCheckingWatchlist || isSubmittingWatchlist ? 'bg-gray-400 text-gray-600 cursor-wait' : isOnWatchlist ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white focus:ring-red-300 shadow-red-500/25' : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white focus:ring-sky-300 shadow-sky-500/25'}`} 
                disabled={isCheckingWatchlist || isSubmittingWatchlist || !initialized || !keycloak.authenticated}>
                <span className="relative z-10">
                  {isCheckingWatchlist ? 'Sprawdzanie...' : isSubmittingWatchlist
                    ? (isOnWatchlist ? 'Usuwanie...' : 'Dodawanie...')
                    : isOnWatchlist ? 'Usuń z Listy Obejrzenia' : 'Dodaj do Listy Obejrzenia'}
                </span>
              </button>
              
              {credits.cast?.length > 0 && (
                <button onClick={() => setShowCast(!showCast)} className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-300 focus:ring-opacity-50 shadow-emerald-500/25">
                  <span className="relative z-10">
                    {showCast ? 'Ukryj' : 'Pokaż'} Obsadę
                  </span>
                </button>
              )}
              
              {videos.results?.length > 0 && (
                <button onClick={() => setShowTrailers(!showTrailers)} className="relative overflow-hidden bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300 focus:ring-opacity-50 shadow-red-500/25">
                  <span className="relative z-10">
                    {showTrailers ? 'Ukryj' : 'Pokaż'} Zwiastuny ({videos.results.length})
                  </span>
                </button>
              )}
              
              {reviews.results?.length > 0 && (
                <button onClick={() => setShowReviews(!showReviews)} className="relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-amber-300 focus:ring-opacity-50 shadow-amber-500/25">
                  <span className="relative z-10">
                    {showReviews ? 'Ukryj' : 'Pokaż'} Recenzje ({reviews.results.length})
                  </span>
                </button>
              )}
              
              {similarMedia.results?.length > 0 && (
                <button onClick={() => setShowSimilar(!showSimilar)} className="relative overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300 focus:ring-opacity-50 shadow-indigo-500/25">
                  <span className="relative z-10">
                    {showSimilar ? 'Ukryj' : 'Pokaż'} Podobne
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {mediaId && mediaType && mediaDetails && (
          <div className="mt-8 max-w-6xl mx-auto">
            {initialized && keycloak.authenticated ? (
              <div className="relative group"> 
                <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                  <NotesSection mediaId={mediaId} mediaType={mediaType} title={mediaDetails.title} />
                </div>
              </div>
            ) : (
              <div className="relative group max-w-2xl mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 via-orange-500/20 to-red-500/20 dark:from-amber-400/10 dark:via-orange-500/10 dark:to-red-500/10 rounded-xl blur-xl transition-all duration-500 opacity-50"></div>
                <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-xl p-6 text-center border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xl">🔒</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Zaloguj się, aby dodać notatki</h3>
                  <p className="text-gray-600 dark:text-gray-400">Musisz być zalogowany, aby zobaczyć lub dodać notatki do tego tytułu.</p>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-4 items-center text-center">
          <Link href="/explore" className="inline-flex items-center text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors font-medium">
            <span className="mr-2">←</span>
            Powrót do wyszukiwania
          </Link>
        </div>
      </div>
    </div>
  );
}

const ExploreDetailPage = () => {
  return (
    <Suspense fallback={
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 transition-all duration-500"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-sky-300/30 to-purple-400/30 dark:from-sky-400/10 dark:to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        </div>
        <div className="relative z-10 flex justify-center items-center h-screen">
          <div className="text-center space-y-4">
            <div className="inline-block w-12 h-12 border-4 border-gray-300 dark:border-gray-600 border-t-sky-500 rounded-full animate-spin"></div>
            <p className="text-xl font-medium text-gray-700 dark:text-gray-300">Ładowanie strony...</p>
          </div>
        </div>
      </div>
    }>
      <ExploreDetailContent />
    </Suspense>
  );
};

export default ExploreDetailPage;