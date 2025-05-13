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

export const searchTMDB = async (query: string): Promise<SearchResponse> => {
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

export const getTMDBDetails = async (mediaType: "movie" | "tv", id: string) => {
  if (!TMDB_PROXY_URL) {
    throw new Error("TMDB Proxy URL is not configured");
  }
  if (mediaType !== "movie") {
    console.warn(
      `Fetching details for ${mediaType} is not fully supported by the current proxy.`
    );
  }
  const response = await fetch(`${TMDB_PROXY_URL}/movie/${id}`);
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ detail: "Network error" }));
    throw new Error(
      `Error fetching movie details from TMDB: ${
        errorData.detail || response.statusText
      }`
    );
  }
  return response.json();
};
