'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { discoverMovies, discoverTv, searchMultiTMDB, getMovieGenres, 
  getTvGenres, getMovieProviders, getTvProviders,getItemWatchProviders } from '@/services/tmdbService';
import { MediaTypeSwitcher } from '@/components/explore/MediaTypeSwitcher';
import { SearchControls } from '@/components/explore/SearchControls';
import { FilterGroup } from '@/components/explore/FilterGroup';
import { ResultsDisplay } from '@/components/explore/ResultsDisplay';
import { PaginationControls } from '@/components/explore/PaginationControls';

const movieSortOptions = [
  { value: "popularity.desc", label: "Popularność (malejąco)" },
  { value: "popularity.asc", label: "Popularność (rosnąco)" },
  { value: "primary_release_date.desc", label: "Data wydania (najnowsze)" },
  { value: "primary_release_date.asc", label: "Data wydania (najstarsze)" },
  { value: "vote_average.desc", label: "Ocena (malejąco)" },
  { value: "vote_average.asc", label: "Ocena (rosnąco)" },
];

const tvSortOptions = [
  { value: "popularity.desc", label: "Popularność (malejąco)" },
  { value: "popularity.asc", label: "Popularność (rosnąco)" },
  { value: "first_air_date.desc", label: "Data emisji (najnowsze)" },
  { value: "first_air_date.asc", label: "Data emisji (najstarsze)" },
  { value: "vote_average.desc", label: "Ocena (malejąco)" },
  { value: "vote_average.asc", label: "Ocena (rosnąco)" },
];


const ExplorePage = () => {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMediaType, setSelectedMediaType] = useState("movie");
  const [genresForFilter, setGenresForFilter] = useState([]);
  const [platformsForFilter, setPlatformsForFilter] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [selectedSortBy, setSelectedSortBy] = useState("popularity.desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [rawResultsFromApi, setRawResultsFromApi] = useState([]);
  const [resultsWithProviders, setResultsWithProviders] = useState([]);
  const [displayedResults, setDisplayedResults] = useState([]);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); 

  const mapPlatformDataToFilterItem = useCallback((platform) => ({
    id: platform.provider_id,
    name: platform.provider_name,
    logo_path: platform.logo_path,
    display_priority: platform.display_priority, 
  }), []);

  const fetchFilterDropdownOptions = useCallback(async () => {
    setLoading(true); 
    setError(null);
    try {
      if (selectedMediaType === "movie") {
        const [genresData, providersData] = await Promise.all([
          getMovieGenres(),
          getMovieProviders("PL"),
        ]);
        setGenresForFilter(genresData.genres || []);
        setPlatformsForFilter((providersData.results || []).map(mapPlatformDataToFilterItem));
      } else if (selectedMediaType === "tv") {
        const [genresData, providersData] = await Promise.all([
          getTvGenres(),
          getTvProviders("PL"),
        ]);
        setGenresForFilter(genresData.genres || []);
        setPlatformsForFilter((providersData.results || []).map(mapPlatformDataToFilterItem));
      } else { 
        const [movieProvidersData, tvProvidersData] = await Promise.all([
          getMovieProviders("PL"),
          getTvProviders("PL")
        ]);
        const allPlatformsMap = new Map(); 
        
        (movieProvidersData.results || []).forEach(p => {
          if (p && p.provider_id) {
            allPlatformsMap.set(p.provider_id, mapPlatformDataToFilterItem(p));
          }
        });
        
        (tvProvidersData.results || []).forEach(p => {
            if (p && p.provider_id && !allPlatformsMap.has(p.provider_id)) {
              allPlatformsMap.set(p.provider_id, mapPlatformDataToFilterItem(p));
            }
        });
        
        const mergedPlatforms = Array.from(allPlatformsMap.values())
            .sort((a,b) => (a.display_priority ?? 99) - (b.display_priority ?? 99));
        setPlatformsForFilter(mergedPlatforms);
        setGenresForFilter([]); 
      }
    } catch (err) {
      console.error("Failed to fetch filter options:", err);
      setError("Nie udało się załadować opcji filtrowania.");
      setGenresForFilter([]);
      setPlatformsForFilter([]);
    } finally {
      setLoading(false); 
    }
  }, [selectedMediaType, mapPlatformDataToFilterItem]);

  const handleApiSearch = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    setDisplayedResults([]); 
    setCurrentPage(page);

    try {
      let response;
      let initialApiResults = []; 
      let totalPgs = 0;

      if (searchTerm.trim()) {
        response = await searchMultiTMDB(searchTerm); 
        initialApiResults = response.results.map(r => ({...r, media_type: r.media_type || 'person'})); 
        totalPgs = response.total_pages || 0;
      } else {
        const baseDiscoverParams = {
            watchRegion: "PL",
            page: page,
            sortBy: (selectedMediaType === "movie" || selectedMediaType === "tv") ? selectedSortBy : "popularity.desc",
        };

        let movieDiscoverParams = {...baseDiscoverParams}; 
        let tvDiscoverParams = {...baseDiscoverParams}; 

        if (selectedMediaType === "movie") {
            movieDiscoverParams.genreIds = selectedGenres.length > 0 ? selectedGenres : undefined;
            movieDiscoverParams.providerIds = selectedPlatforms.length > 0 ? selectedPlatforms : undefined;
        } else if (selectedMediaType === "tv") {
            tvDiscoverParams.genreIds = selectedGenres.length > 0 ? selectedGenres : undefined;
            tvDiscoverParams.providerIds = selectedPlatforms.length > 0 ? selectedPlatforms : undefined;
        } else { 
            movieDiscoverParams.providerIds = selectedPlatforms.length > 0 ? selectedPlatforms : undefined;
            tvDiscoverParams.providerIds = selectedPlatforms.length > 0 ? selectedPlatforms : undefined;
        }

        if (selectedMediaType === "movie") {
          response = await discoverMovies(movieDiscoverParams);
          initialApiResults = response.results.map(r => ({ ...r, media_type: 'movie' })); 
          totalPgs = response.total_pages || 0;
        } else if (selectedMediaType === "tv") {
          response = await discoverTv(tvDiscoverParams);
          initialApiResults = response.results.map(r => ({ ...r, media_type: 'tv' })); 
          totalPgs = response.total_pages || 0;
        } else { 
          const [moviesResp, tvResp] = await Promise.all([
            discoverMovies(movieDiscoverParams), 
            discoverTv(tvDiscoverParams)      
          ]);
          const merged = [];
          const len = Math.max(moviesResp.results.length, tvResp.results.length);
          for (let i = 0; i < len; i++) {
            if (moviesResp.results[i]) merged.push({ ...moviesResp.results[i], media_type: 'movie' }); 
            if (tvResp.results[i]) merged.push({ ...tvResp.results[i], media_type: 'tv' });
          }
          initialApiResults = merged;
          totalPgs = Math.max(moviesResp.total_pages || 0, tvResp.total_pages || 0);
        }
      }
      const filteredInitialResults = initialApiResults.filter(item => item.media_type === 'movie' || item.media_type === 'tv');
      setRawResultsFromApi(filteredInitialResults); 
      setTotalPages(totalPgs);

      if (filteredInitialResults.length === 0) {
        setResultsWithProviders([]); 
        setLoading(false); 
      } 

    } catch (err) {
      setError(err.message); 
      setRawResultsFromApi([]);
      setResultsWithProviders([]); 
      setTotalPages(0);
      setLoading(false); 
    }
  }, [searchTerm, selectedMediaType, selectedGenres, selectedPlatforms, selectedSortBy]); 

  const handleSubmitOrFilter = useCallback((event) => {
    if (event) event.preventDefault();
    handleApiSearch(1); 
  }, [handleApiSearch]);

  const handleMediaTypeSelect = useCallback((type) => { 
    setSelectedMediaType(type);
  }, []); 

  const handleGenreChange = useCallback((genreId) => { 
    setSelectedGenres(prev => {
      const newGenres = prev.includes(genreId) ? prev.filter(id => id !== genreId) : [...prev, genreId];
      return newGenres;
    });
  }, []);

  const handlePlatformChange = useCallback((platformId) => { 
    setSelectedPlatforms(prev => {
      const newPlatforms = prev.includes(platformId) ? prev.filter(id => id !== platformId) : [...prev, platformId];
      return newPlatforms;
    });
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchFilterDropdownOptions();
    setSelectedGenres([]); 
    setSelectedPlatforms([]);
    setSelectedSortBy("popularity.desc"); 
    setCurrentPage(1);
  }, [selectedMediaType, fetchFilterDropdownOptions]);

  useEffect(() => {
    if (mounted && !searchTerm.trim()) {
      handleApiSearch(1); 
    }
  }, [mounted, selectedMediaType, selectedGenres, selectedPlatforms, selectedSortBy, handleApiSearch, searchTerm]); 

  useEffect(() => {
    const fetchProvidersForItems = async () => {
      if (rawResultsFromApi.length === 0) { 
        setResultsWithProviders([]);
        setLoading(false); 
        return;
      }

      setResultsWithProviders(rawResultsFromApi.map(r => ({ ...r, providersLoading: true, availableOnPlatforms: [], providersDetails: undefined })));

      try {
        const augmentedResults = await Promise.all(
          rawResultsFromApi.map(async (item) => {
            if (item.media_type === 'person') { 
              return { ...item, providersLoading: false };
            }
            try {
              const providerData = await getItemWatchProviders(item.media_type, item.id); 
              let currentItemPlatforms = []; 
              if (providerData) {
                const allProviderListsForItem = [
                  ...(providerData.flatrate || []),
                ];
                const uniqueProviderMap = new Map(); 
                allProviderListsForItem.forEach(p => {
                  if (p && p.provider_id && !uniqueProviderMap.has(p.provider_id)) {
                    uniqueProviderMap.set(p.provider_id, p);
                  }
                });
                currentItemPlatforms = Array.from(uniqueProviderMap.values()).sort((a,b) => (a.display_priority ?? 99) - (b.display_priority ?? 99));
              }
              return { ...item, providersDetails: providerData, availableOnPlatforms: currentItemPlatforms, providersLoading: false };
            } catch (e) {
              console.error(`Failed to fetch providers for item ${item.id}`, e);
              return { ...item, providersDetails: null, availableOnPlatforms: [], providersLoading: false, errorFetchingProviders: true };
            }
          })
        );
        setResultsWithProviders(augmentedResults);
      } catch (err) {
        console.error("Error processing providers for items:", err);
        setError(prevError => prevError || "Błąd podczas przetwarzania informacji o dostawcach.");
        setResultsWithProviders(rawResultsFromApi.map(r => ({ ...r, providersLoading: false, errorFetchingProviders: true })));
      } finally {
        setLoading(false); 
      }
    };

    if (loading && rawResultsFromApi.length > 0) {
      fetchProvidersForItems();
    }
  }, [rawResultsFromApi, loading]); 

  useEffect(() => {
    if (loading) { 
      return; 
    }

    let finalFilteredResults = [...resultsWithProviders];

    if (searchTerm.trim() && selectedMediaType !== "all") {
      finalFilteredResults = finalFilteredResults.filter(item => item.media_type === selectedMediaType);
    }

    if (loading) {
      return; 
    }

    if (selectedGenres.length > 0 && genresForFilter.length > 0) {
      finalFilteredResults = finalFilteredResults.filter(item =>
        item.genre_ids?.some(genreId => selectedGenres.includes(genreId.toString()))
      );
    }

    if (selectedPlatforms.length > 0) {
      finalFilteredResults = finalFilteredResults.filter(item => {
        if (item.providersLoading || !item.availableOnPlatforms || item.availableOnPlatforms.length === 0) {
          return false; 
        }
        return item.availableOnPlatforms.some(p => selectedPlatforms.includes(p.provider_id.toString()));
      });
    }
    setDisplayedResults(finalFilteredResults);
  }, [resultsWithProviders, selectedGenres, selectedPlatforms, genresForFilter, searchTerm, selectedMediaType, loading]); 

  if (!mounted) return null;

  const currentSortOptions = selectedMediaType === "movie" ? movieSortOptions : tvSortOptions;

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 transition-all duration-500"></div>

      <div className="relative z-10 min-h-screen">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="relative group mb-6">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-purple-500 to-pink-500 group-hover:from-pink-500 group-hover:via-purple-500 group-hover:to-sky-400 transition-all duration-700">Eksploruj</span>
                <span className="ml-2 inline-block w-3 h-3 bg-gradient-to-r from-sky-400 to-purple-500 rounded-full animate-pulse"></span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mt-4 leading-relaxed">
                Odkrywaj <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-indigo-500">filmy</span> i{" "}
                <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">seriale</span>{" "}
                na różnych platformach streamingowych!
              </p>
            </div>
          </div>

          <div className="space-y-8 mb-8">
            <div>
              <MediaTypeSwitcher
                selectedMediaType={selectedMediaType}
                onSelectMediaType={handleMediaTypeSelect}
              />
            </div>

            <div>
              <SearchControls
                searchTerm={searchTerm}
                onSearchTermChange={setSearchTerm}
                onSubmit={handleSubmitOrFilter}
                onApplyFilters={() => handleApiSearch(1)} 
                loading={loading}
                placeholder={`Wyszukaj ${selectedMediaType === "movie" ? "filmy" : selectedMediaType === "tv" ? "seriale" : "filmy i seriale"}...`}
                showApplyFiltersButton={!searchTerm.trim()}
              />
            </div>

            <div className="flex flex-col lg:flex-row justify-between items-center gap-6 max-w-6xl mx-auto">
              {(selectedMediaType === "movie" || selectedMediaType === "tv") && !searchTerm.trim() && (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Sortuj według:</span>
                  <div className="relative min-w-[200px]">
                    <select
                      value={selectedSortBy}
                      onChange={(e) => setSelectedSortBy(e.target.value)}
                      disabled={loading}
                      className="block w-full px-4 pr-12 py-2 border-2 border-gray-200/50 dark:border-gray-600/50 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed appearance-none font-medium"
                    >
                      {currentSortOptions.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-white dark:bg-gray-800">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 flex-1 lg:flex-initial">
                <div className="flex items-center gap-4">
                  <button onClick={() => setFiltersVisible(!filtersVisible)} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white/90 dark:hover:bg-gray-800/90 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl font-medium">
                    <FilterIcon className={`transition-transform duration-200 ${filtersVisible ? 'rotate-180' : ''}`} />
                    {filtersVisible ? 'Ukryj filtry' : 'Pokaż filtry'}
                  </button>
                  
                  {searchTerm.trim() && (
                    <div className="text-sm text-blue-600 dark:text-blue-300 italic bg-blue-50/50 dark:bg-blue-900/20 px-3 py-1 rounded-lg">Filtry stosowane po załadowaniu wyników</div>
                  )}
                  
                  {selectedMediaType === "all" && !searchTerm.trim() && (
                    <div className="text-sm text-purple-600 dark:text-purple-300 italic bg-purple-50/50 dark:bg-purple-900/20 px-3 py-1 rounded-lg">Tryb "Wszystko" - filtrowanie po gatunkach wyłączone</div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Widok:</span>
                  <div className="flex bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border-2 border-gray-200/50 dark:border-gray-700/50 p-1 shadow-lg">
                    <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'grid'? 'bg-sky-500 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200' }`}>
                      <GridIcon />
                    </button>
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'list'? 'bg-sky-500 text-white shadow-md': 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}>
                      <ListIcon />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {filtersVisible && (
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl border-2 border-gray-200/50 dark:border-gray-700/50 shadow-xl transition-all duration-300">
                  {((selectedMediaType === "movie" || selectedMediaType === "tv") || (searchTerm.trim() && selectedMediaType !== "all")) && genresForFilter.length > 0 && (
                    <FilterGroup
                      label="Kategorie"
                      items={genresForFilter}
                      selectedItems={selectedGenres}
                      onItemChange={handleGenreChange}
                      loading={loading} 
                      itemType="genre"
                    />
                  )}
                  
                  {((selectedMediaType === "movie" || selectedMediaType === "tv" || (selectedMediaType === "all" && !searchTerm.trim())) || (searchTerm.trim() && selectedMediaType !== "all")) && platformsForFilter.length > 0 && (
                    <FilterGroup
                      label="Platformy"
                      items={platformsForFilter}
                      selectedItems={selectedPlatforms}
                      onItemChange={handlePlatformChange}
                      loading={loading} 
                      itemType="platform"
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-sky-400/5 via-purple-500/5 to-pink-500/5 dark:from-sky-400/5 dark:via-purple-500/5 dark:to-pink-500/5 rounded-2xl blur-xl"></div>
            <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 min-h-[400px] p-6">
              {loading && (
                <div className="flex flex-col justify-center items-center h-96">
                  <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-xl text-gray-600 dark:text-gray-400">Ładowanie wyników...</p>
                </div>
              )}
              
              {!loading && error && (
                <div className="flex flex-col justify-center items-center h-96">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-xl text-red-600 dark:text-red-400">Błąd: {error}</p>
                </div>
              )}
              
              {!loading && !error && (
                <ResultsDisplay results={displayedResults} viewMode={viewMode} />
              )}
            </div>
          </div>

          <div className="mt-8">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handleApiSearch}
              loading={loading} 
            />
          </div>

          {!loading && !error && displayedResults.length === 0 && (searchTerm.trim() || selectedGenres.length > 0 || selectedPlatforms.length > 0) && (
            <div className="text-center mt-8 p-8 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-lg text-gray-500 dark:text-gray-400">Brak wyników dla podanych kryteriów</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Spróbuj zmienić filtry lub wyszukiwane hasło</p>
            </div>
          )}

          <div className="flex justify-center mt-12">
            <button onClick={() => router.push('/')} className="inline-flex items-center gap-2 px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all duration-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-800/80">
              <BackIcon />
              Powrót do strony głównej
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${className}`}>
    <path fillRule="evenodd" d="M3.792 2.938A49.069 49.069 0 0112 2.25c2.797 0 5.54.236 8.208.688a1.424 1.424 0 011.792 1.386v4.132a3 3 0 01-.879 2.121l-7.26 7.26a2.25 2.25 0 01-1.591.659H8.617a1.5 1.5 0 01-1.06-.44L2.439 12.939A1.5 1.5 0 012.25 11.69V8.558a1.424 1.424 0 011.792-1.386c.853-.09 1.708-.162 2.565-.214l.186-.014z" clipRule="evenodd" />
  </svg>
);

const GridIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${className}`}>
    <path fillRule="evenodd" d="M3 6a3 3 0 013-3h2.25a3 3 0 013 3v2.25a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm9.75 0a3 3 0 013-3H18a3 3 0 013 3v2.25a3 3 0 01-3 3h-2.25a3 3 0 01-3-3V6zM3 15.75a3 3 0 013-3h2.25a3 3 0 013 3V18a3 3 0 01-3 3H6a3 3 0 01-3-3v-2.25zm9.75 0a3 3 0 013-3H18a3 3 0 013 3V18a3 3 0 01-3 3h-2.25a3 3 0 01-3-3v-2.25z" clipRule="evenodd" />
  </svg>
);

const ListIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${className}`}>
    <path fillRule="evenodd" d="M2.625 6.75a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0A.75.75 0 018.25 6h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75zM2.625 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zM7.5 12a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12A.75.75 0 017.5 12zm-4.875 5.25a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875 0a.75.75 0 01.75-.75h12a.75.75 0 010 1.5h-12a.75.75 0 01-.75-.75z" clipRule="evenodd" />
  </svg>
);

const BackIcon = ({ className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 ${className}`}>
    <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
  </svg>
);

export default ExplorePage;
