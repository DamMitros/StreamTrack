const TMDB_PROXY_URL = process.env.NEXT_PUBLIC_TMDB_PROXY_URL;

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  media_type: "movie" | "tv" | "person";
}

interface SearchResponse {
  page: number;
  results: SearchResult[];
  total_pages: number;
  total_results: number;
}

export const searchMultiTMDB = async (
  query: string
): Promise<SearchResponse> => {
  if (!TMDB_PROXY_URL) {
    throw new Error("TMDB Proxy URL is not configured");
  }
  const response = await fetch(
    `${TMDB_PROXY_URL}/search?query=${encodeURIComponent(query)}`
  );
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ detail: "Network error" }));
    throw new Error(
      `Error fetching from TMDB: ${errorData.detail || response.statusText}`
    );
  }
  return response.json();
};

export interface Genre {
  id: number;
  name: string;
}

export interface Provider {
  provider_id: number; 
  provider_name: string;
  logo_path: string | null;
  display_priority?: number; 
}

export const getMovieGenres = async (): Promise<{ genres: Genre[] }> => {
  if (!TMDB_PROXY_URL) throw new Error("TMDB Proxy URL is not configured");
  const response = await fetch(`${TMDB_PROXY_URL}/genres/movie`);
  if (!response.ok) throw new Error("Failed to fetch movie genres");
  return response.json();
};

export const getTvGenres = async (): Promise<{ genres: Genre[] }> => {
  if (!TMDB_PROXY_URL) throw new Error("TMDB Proxy URL is not configured");
  const response = await fetch(`${TMDB_PROXY_URL}/genres/tv`);
  if (!response.ok) throw new Error("Failed to fetch TV genres");
  return response.json();
};

export const getMovieProviders = async (
  watchRegion: string = "PL"
): Promise<{ results: Provider[] }> => {
  if (!TMDB_PROXY_URL) throw new Error("TMDB Proxy URL is not configured");
  const response = await fetch(
    `${TMDB_PROXY_URL}/providers/movie?watch_region=${watchRegion.toUpperCase()}`
  );
  if (!response.ok) throw new Error("Failed to fetch movie providers");
  const data = await response.json();
  data.results.sort((a: Provider, b: Provider) => {
    if (a.display_priority !== undefined && b.display_priority !== undefined) {
      return a.display_priority - b.display_priority;
    }
    return a.provider_name.localeCompare(b.provider_name);
  });
  return data;
};

export const getTvProviders = async (
  watchRegion: string = "PL"
): Promise<{ results: Provider[] }> => {
  if (!TMDB_PROXY_URL) throw new Error("TMDB Proxy URL is not configured");
  const response = await fetch(
    `${TMDB_PROXY_URL}/providers/tv?watch_region=${watchRegion.toUpperCase()}`
  );
  if (!response.ok) throw new Error("Failed to fetch TV providers");
  const data = await response.json();
  data.results.sort((a: Provider, b: Provider) => {
    if (a.display_priority !== undefined && b.display_priority !== undefined) {
      return a.display_priority - b.display_priority;
    }
    return a.provider_name.localeCompare(b.provider_name);
  });
  return data;
};

export interface MediaDetails {
  id: number;
  title?: string; 
  name?: string; 
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string; 
  first_air_date?: string; 
  genres: Genre[];
}

export const getMediaDetails = async (
  mediaId: string,
  mediaType: "movie" | "tv"
): Promise<MediaDetails> => {
  if (!TMDB_PROXY_URL) {
    throw new Error("TMDB Proxy URL is not configured");
  }
  const response = await fetch(
    `${TMDB_PROXY_URL}/details/${mediaType}/${mediaId}`
  );
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ detail: "Network error fetching media details" }));
    throw new Error(
      `Error fetching ${mediaType} details from TMDB: ${errorData.detail || response.statusText}`
    );
  }
  return response.json();
};

interface DiscoverMediaParams {
  genreIds?: string[]; 
  providerIds?: string[]; 
  watchRegion?: string;
  page?: number;
  sortBy?: string;
}

export interface WatchProviderDetailsRegion {
  link?: string;
  flatrate?: Provider[]; 
  rent?: Provider[];
  buy?: Provider[];
  ads?: Provider[];
  free?: Provider[];
}

export const getItemWatchProviders = async (
  mediaType: "movie" | "tv",
  id: number,
  watchRegion: string = "PL"
): Promise<WatchProviderDetailsRegion | null> => {
  if (!TMDB_PROXY_URL) throw new Error("TMDB Proxy URL is not configured");
  try {
    const response = await fetch(
      `${TMDB_PROXY_URL}/${mediaType}/${id}/watch/providers?watch_region=${watchRegion.toUpperCase()}`
    );
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      console.error(
        `Failed to fetch watch providers for ${mediaType} ${id} (status ${response.status})`
      );
      return null;
    }
    return response.json();
  } catch (error) {
    console.error(
      `Error in getItemWatchProviders for ${mediaType} ${id}:`,
      error
    );
    return null;
  }
};

export const discoverMovies = async (
  params: DiscoverMediaParams
): Promise<SearchResponse> => {
  if (!TMDB_PROXY_URL) {
    throw new Error("TMDB Proxy URL is not configured");
  }
  const queryParams = new URLSearchParams();
  if (params.genreIds && params.genreIds.length > 0)
    queryParams.append("with_genres", params.genreIds.join("|")); //'|' = OR
  if (params.providerIds && params.providerIds.length > 0)
    queryParams.append("with_watch_providers", params.providerIds.join("|")); 

  queryParams.append(
    "watch_region",
    (params.watchRegion || "PL").toUpperCase()
  );
  if (params.page) queryParams.append("page", params.page.toString());
  queryParams.append("sort_by", params.sortBy || "popularity.desc");

  const response = await fetch(
    `${TMDB_PROXY_URL}/discover/movie?${queryParams.toString()}`
  );
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ detail: "Network error" }));
    throw new Error(
      `Error discovering movies: ${errorData.detail || response.statusText}`
    );
  }
  return response.json();
};

export const discoverTv = async (
  params: DiscoverMediaParams
): Promise<SearchResponse> => {
  if (!TMDB_PROXY_URL) {
    throw new Error("TMDB Proxy URL is not configured");
  }
  const queryParams = new URLSearchParams();
  if (params.genreIds && params.genreIds.length > 0)
    queryParams.append("with_genres", params.genreIds.join("|"));
  if (params.providerIds && params.providerIds.length > 0)
    queryParams.append("with_watch_providers", params.providerIds.join("|"));

  queryParams.append(
    "watch_region",
    (params.watchRegion || "PL").toUpperCase()
  );
  if (params.page) queryParams.append("page", params.page.toString());
  queryParams.append("sort_by", params.sortBy || "popularity.desc");

  const response = await fetch(
    `${TMDB_PROXY_URL}/discover/tv?${queryParams.toString()}`
  );
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ detail: "Network error" }));
    throw new Error(
      `Error discovering TV shows: ${errorData.detail || response.statusText}`
    );
  }
  return response.json();
};

export const getTMDBDetails = async (mediaType: "movie" | "tv", id: string) => {
  if (!TMDB_PROXY_URL) {
    throw new Error("TMDB Proxy URL is not configured");
  }
  
  const endpoint = mediaType === "movie" ? `/movie/${id}` : `/tv/${id}`;
  const response = await fetch(`${TMDB_PROXY_URL}${endpoint}`);
  
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ detail: "Network error" }));
    throw new Error(
      `Error fetching ${mediaType} details from TMDB: ${
        errorData.detail || response.statusText
      }`
    );
  }
  return response.json();
};

export const getMediaReviews = async (mediaType: "movie" | "tv", id: string, language = "en-US") => {
  if (!TMDB_PROXY_URL) throw new Error("TMDB Proxy URL is not configured");
  const response = await fetch(`${TMDB_PROXY_URL}/${mediaType}/${id}/reviews?language=${language}`);
  if (!response.ok) return { results: [], total_results: 0 };
  return response.json();
};

export const getMediaCredits = async (mediaType: "movie" | "tv", id: string) => {
  if (!TMDB_PROXY_URL) throw new Error("TMDB Proxy URL is not configured");
  const response = await fetch(`${TMDB_PROXY_URL}/${mediaType}/${id}/credits`);
  if (!response.ok) return { cast: [], crew: [] };
  return response.json();
};

export const getSimilarMedia = async (mediaType: "movie" | "tv", id: string) => {
  if (!TMDB_PROXY_URL) throw new Error("TMDB Proxy URL is not configured");
  const response = await fetch(`${TMDB_PROXY_URL}/${mediaType}/${id}/similar`);
  if (!response.ok) return { results: [] };
  return response.json();
};

export const getMediaVideos = async (mediaType: "movie" | "tv", id: string) => {
  if (!TMDB_PROXY_URL) throw new Error("TMDB Proxy URL is not configured");
  const response = await fetch(`${TMDB_PROXY_URL}/${mediaType}/${id}/videos`);
  if (!response.ok) return { results: [] };
  return response.json();
};

export const getMediaExternalIds = async (mediaType: "movie" | "tv", id: string) => {
  if (!TMDB_PROXY_URL) throw new Error("TMDB Proxy URL is not configured");
  const response = await fetch(`${TMDB_PROXY_URL}/${mediaType}/${id}/external_ids`);
  if (!response.ok) return {};
  return response.json();
};
