'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  discoverMovies, discoverTv, searchMultiTMDB, getMovieGenres, 
  getTvGenres, getMovieProviders, getTvProviders,getItemWatchProviders, 
} from '@/services/tmdbService';

import { MediaTypeSwitcher } from '@/components/explore/MediaTypeSwitcher';
import { SearchControls } from '@/components/explore/SearchControls';
import { FilterGroup } from '@/components/explore/FilterGroup';
import { SortDropdown } from '@/components/explore/SortDropdown';
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

  const mapPlatformDataToFilterItem = (platform) => ({
    id: platform.provider_id,
    name: platform.provider_name,
    logo_path: platform.logo_path,
    display_priority: platform.display_priority, 
  });

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
  }, [selectedMediaType]);

  useEffect(() => {
    fetchFilterDropdownOptions();
    setSelectedGenres([]); 
    setSelectedPlatforms([]);
    setSelectedSortBy("popularity.desc"); 
  }, [selectedMediaType, fetchFilterDropdownOptions]);

  const handleApiSearch = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    setCurrentPage(page);
    setRawResultsFromApi([]); 

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
      setRawResultsFromApi(initialApiResults.filter(item => item.media_type === 'movie' || item.media_type === 'tv')); 
      setTotalPages(totalPgs);

    } catch (err) {
      setError(err.message); 
      setRawResultsFromApi([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedMediaType, selectedGenres, selectedPlatforms, selectedSortBy]);

  useEffect(() => {
    const fetchProvidersForItems = async () => {
      if (rawResultsFromApi.length === 0) {
        setResultsWithProviders([]);
        return;
      }
      setResultsWithProviders(rawResultsFromApi.map(r => ({ ...r, providersLoading: true, availableOnPlatforms: [], providersDetails: undefined })));

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
            return { ...item, providersDetails: null, availableOnPlatforms: [], providersLoading: false };
          }
        })
      );
      setResultsWithProviders(augmentedResults);
    };

    fetchProvidersForItems();
  }, [rawResultsFromApi]);

  useEffect(() => {
    let finalFilteredResults = [...resultsWithProviders];

    if (searchTerm.trim() && selectedMediaType !== "all") {
        finalFilteredResults = finalFilteredResults.filter(item => item.media_type === selectedMediaType);
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
  }, [resultsWithProviders, selectedGenres, selectedPlatforms, genresForFilter, searchTerm, selectedMediaType]);


  const handleSubmitOrFilter = (event) => {
    if (event) event.preventDefault();
    handleApiSearch(1); 
  };
  
  useEffect(() => { 
    if(!searchTerm.trim()){
      handleApiSearch(1);
    }
  }, [selectedMediaType]); 

  const handleMediaTypeSelect = (type) => { 
    setSelectedMediaType(type);
  };

  const handleGenreChange = (genreId) => { 
    setSelectedGenres(prev => prev.includes(genreId) ? prev.filter(id => id !== genreId) : [...prev, genreId]);
  };

  const handlePlatformChange = (platformId) => { 
    setSelectedPlatforms(prev => prev.includes(platformId) ? prev.filter(id => id !== platformId) : [...prev, platformId]);
  };

  const currentSortOptions = selectedMediaType === "movie" ? movieSortOptions : tvSortOptions;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 drop-shadow-lg mb-2 tracking-tight">
          Katalog Mediów
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Odkrywaj filmy i seriale na różnych platformach streamingowych!
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
        <div className="flex-1">
          <MediaTypeSwitcher
            selectedMediaType={selectedMediaType}
            onSelectMediaType={handleMediaTypeSelect}
          />
        </div>
        <div className="flex-1">
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
      </div>

      <div className="flex flex-wrap gap-6 mb-8">
        {((selectedMediaType === "movie" || selectedMediaType === "tv") || (searchTerm.trim() && selectedMediaType !== "all")) && genresForFilter.length > 0 && (
          <div className="flex-1 min-w-[220px]">
            <FilterGroup
              label="Kategorie"
              items={genresForFilter}
              selectedItems={selectedGenres}
              onItemChange={handleGenreChange}
              loading={loading}
              itemType="genre"
            />
          </div>
        )}
        {((selectedMediaType === "movie" || selectedMediaType === "tv" || (selectedMediaType === "all" && !searchTerm.trim())) || (searchTerm.trim() && selectedMediaType !== "all")) && platformsForFilter.length > 0 && (
          <div className="flex-1 min-w-[220px]">
            <FilterGroup
              label="Platformy"
              items={platformsForFilter}
              selectedItems={selectedPlatforms}
              onItemChange={handlePlatformChange}
              loading={loading}
              itemType="platform"
            />
          </div>
        )}
        {(selectedMediaType === "movie" || selectedMediaType === "tv") && !searchTerm.trim() && (
          <div className="flex-1 min-w-[180px]">
            <SortDropdown
              options={currentSortOptions}
              selectedValue={selectedSortBy}
              onValueChange={setSelectedSortBy}
              loading={loading}
            />
          </div>
        )}
      </div>

      {searchTerm.trim() && (
        <p className="mb-4 text-sm text-blue-600 dark:text-blue-300 italic">
          Przy wyszukiwaniu tekstem, filtrowanie po platformie odbywa się po załadowaniu listy. Sortowanie jest domyślne dla wyszukiwarki. Filtrowanie po kategorii jest stosowane po stronie klienta.
        </p>
      )}
      {selectedMediaType === "all" && !searchTerm.trim() && (
        <p className="mb-4 text-sm text-purple-600 dark:text-purple-300 italic">
          W trybie "Wszystko" bez wyszukiwania: filtrowanie po kategorii jest wyłączone. Możesz filtrować po platformach. Wyświetlane są popularne pozycje.
        </p>
      )}
      {error && <p className="text-red-500 font-semibold mb-4">Błąd: {error}</p>}

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 mb-8">
        <ResultsDisplay results={displayedResults} />
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handleApiSearch}
        loading={loading}
      />

      {!loading && displayedResults.length === 0 && (searchTerm || selectedGenres.length > 0 || selectedPlatforms.length > 0) && (
        <p className="text-center text-gray-500 mt-8">Brak wyników dla podanych kryteriów.</p>
      )}
      {!loading && displayedResults.length === 0 && !searchTerm && selectedGenres.length === 0 && selectedPlatforms.length === 0 && (
        <p className="text-center text-gray-400 mt-8">Wyszukaj lub wybierz filtry, aby zobaczyć wyniki.</p>
      )}
    </div>
  );
};

export default ExplorePage;
