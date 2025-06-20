from fastapi import APIRouter, HTTPException
import httpx, os

router = APIRouter()

TMDB_API_KEY_ENV = os.getenv("TMDB_API_KEY")
TMDB_API_KEY_FILE_PATH = os.getenv("TMDB_API_KEY_FILE")

if TMDB_API_KEY_FILE_PATH:
    try:
        with open(TMDB_API_KEY_FILE_PATH, 'r') as f:
            TMDB_API_KEY = f.read().strip()
    except FileNotFoundError:
        TMDB_API_KEY = TMDB_API_KEY_ENV 
    except Exception as e:
        print(f"Error reading TMDB API key from secret file: {e}")
        TMDB_API_KEY = TMDB_API_KEY_ENV 
elif TMDB_API_KEY_ENV:
    TMDB_API_KEY = TMDB_API_KEY_ENV
else:
    raise RuntimeError("TMDB_API_KEY not configured. Set TMDB_API_KEY environment variable or TMDB_API_KEY_FILE path to secret.")

if not TMDB_API_KEY:
    raise RuntimeError("TMDB_API_KEY is empty after attempting to load from env/file.")

TMDB_API_URL = "https://api.themoviedb.org/3"

@router.get("/search")
async def search(query: str):
  async with httpx.AsyncClient() as client:
    response = await client.get(
      f"{TMDB_API_URL}/search/multi",
      params={
        "api_key": TMDB_API_KEY,
        "query": query,
        "language": "pl-PL",
      },
    )
    if response.status_code != 200:
      raise HTTPException(status_code=response.status_code, detail="Error fetching data from TMDB")
    return response.json()
  
@router.get("/movie/{movie_id}")
async def get_movie(movie_id: str):
  async with httpx.AsyncClient() as client:
    response = await client.get(
      f"{TMDB_API_URL}/movie/{movie_id}",
      params={
        "api_key": TMDB_API_KEY,
        "language": "pl-PL",
      },
    )
    if response.status_code != 200:
      raise HTTPException(status_code=response.status_code, detail="Error fetching data from TMDB")
    return response.json()

@router.get("/genres/movie")
async def get_movie_genres():
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{TMDB_API_URL}/genre/movie/list",
            params={"api_key": TMDB_API_KEY, "language": "pl-PL"},
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Error fetching movie genres from TMDB")
        return response.json()

@router.get("/genres/tv")
async def get_tv_genres():
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{TMDB_API_URL}/genre/tv/list",
            params={"api_key": TMDB_API_KEY, "language": "pl-PL"},
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Error fetching TV genres from TMDB")
        return response.json()

@router.get("/providers/movie")
async def get_movie_providers(watch_region: str = "PL"):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{TMDB_API_URL}/watch/providers/movie",
            params={"api_key": TMDB_API_KEY, "language": "pl-PL", "watch_region": watch_region.upper()},
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Error fetching movie providers from TMDB")
        return response.json()

@router.get("/providers/tv")
async def get_tv_providers(watch_region: str = "PL"):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{TMDB_API_URL}/watch/providers/tv",
            params={"api_key": TMDB_API_KEY, "language": "pl-PL", "watch_region": watch_region.upper()},
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Error fetching TV providers from TMDB")
        return response.json()

@router.get("/discover/movie")
async def discover_movies(
    with_genres: str = None, 
    with_watch_providers: str = None, 
    watch_region: str = "PL",
    page: int = 1,
    sort_by: str = "popularity.desc"
):
    params = {
        "api_key": TMDB_API_KEY,
        "language": "pl-PL",
        "watch_region": watch_region.upper(),
        "page": page,
        "sort_by": sort_by,
        "include_adult": "false"
    }

    if with_genres:
        params["with_genres"] = with_genres
    if with_watch_providers:
        params["with_watch_providers"] = with_watch_providers
        params["watch_region"] = watch_region.upper() 

    async with httpx.AsyncClient() as client:
        response = await client.get(f"{TMDB_API_URL}/discover/movie", params=params)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Error discovering movies from TMDB")
        return response.json()

@router.get("/discover/tv")
async def discover_tv_shows(
    with_genres: str = None, 
    with_watch_providers: str = None, 
    watch_region: str = "PL",
    page: int = 1,
    sort_by: str = "popularity.desc"
):
    params = {
        "api_key": TMDB_API_KEY,
        "language": "pl-PL",
        "watch_region": watch_region.upper(),
        "page": page,
        "sort_by": sort_by,
        "include_adult": "false"
    }

    if with_genres:
        params["with_genres"] = with_genres
    if with_watch_providers:
        params["with_watch_providers"] = with_watch_providers
        params["watch_region"] = watch_region.upper() 

    async with httpx.AsyncClient() as client:
        response = await client.get(f"{TMDB_API_URL}/discover/tv", params=params)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Error discovering TV shows from TMDB")
        return response.json()

@router.get("/movie/{movie_id}/watch/providers")
async def get_movie_item_watch_providers(movie_id: int, watch_region: str = "PL"):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{TMDB_API_URL}/movie/{movie_id}/watch/providers",
            params={"api_key": TMDB_API_KEY},
        )
        if response.status_code != 200:
            return {"results": {}} 
        
        data = response.json()
        region_providers = data.get("results", {}).get(watch_region.upper())
        return region_providers if region_providers else {}

@router.get("/tv/{tv_id}/watch/providers")
async def get_tv_item_watch_providers(tv_id: int, watch_region: str = "PL"):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{TMDB_API_URL}/tv/{tv_id}/watch/providers",
            params={"api_key": TMDB_API_KEY},
        )
        if response.status_code != 200:
            return {"results": {}}
        
        data = response.json()
        region_providers = data.get("results", {}).get(watch_region.upper())
        return region_providers if region_providers else {}

@router.get("/details/{media_type}/{media_id}")
async def get_media_details(media_type: str, media_id: str, language: str = "pl-PL"):
    if media_type not in ["movie", "tv"]:
        raise HTTPException(status_code=400, detail="Invalid media_type. Must be 'movie' or 'tv'.")
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{TMDB_API_URL}/{media_type}/{media_id}",
            params={
                "api_key": TMDB_API_KEY,
                "language": language,
            },
        )
        if response.status_code != 200:
            error_detail = response.json().get("status_message", "Error fetching data from TMDB") if response.content else "Error fetching data from TMDB"
            raise HTTPException(status_code=response.status_code, detail=error_detail)
        return response.json()

@router.get("/movie/{movie_id}/reviews")
async def get_movie_reviews(movie_id: str, language: str = "en-US", page: int = 1):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{TMDB_API_URL}/movie/{movie_id}/reviews",
            params={
                "api_key": TMDB_API_KEY,
                "language": language,
                "page": page,
            },
        )
        if response.status_code != 200:
            return {"results": [], "total_results": 0}
        return response.json()

@router.get("/tv/{tv_id}/reviews")
async def get_tv_reviews(tv_id: str, language: str = "en-US", page: int = 1):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{TMDB_API_URL}/tv/{tv_id}/reviews",
            params={
                "api_key": TMDB_API_KEY,
                "language": language,
                "page": page,
            },
        )
        if response.status_code != 200:
            return {"results": [], "total_results": 0}
        return response.json()

@router.get("/movie/{movie_id}/credits")
async def get_movie_credits(movie_id: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{TMDB_API_URL}/movie/{movie_id}/credits",
            params={
                "api_key": TMDB_API_KEY,
                "language": "pl-PL",
            },
        )
        if response.status_code != 200:
            return {"cast": [], "crew": []}
        return response.json()

@router.get("/tv/{tv_id}/credits")
async def get_tv_credits(tv_id: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{TMDB_API_URL}/tv/{tv_id}/credits",
            params={
                "api_key": TMDB_API_KEY,
                "language": "pl-PL",
            },
        )
        if response.status_code != 200:
            return {"cast": [], "crew": []}
        return response.json()

@router.get("/movie/{movie_id}/similar")
async def get_similar_movies(movie_id: str, page: int = 1):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{TMDB_API_URL}/movie/{movie_id}/similar",
            params={
                "api_key": TMDB_API_KEY,
                "language": "pl-PL",
                "page": page,
            },
        )
        if response.status_code != 200:
            return {"results": []}
        return response.json()

@router.get("/tv/{tv_id}/similar")
async def get_similar_tv(tv_id: str, page: int = 1):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{TMDB_API_URL}/tv/{tv_id}/similar",
            params={
                "api_key": TMDB_API_KEY,
                "language": "pl-PL",
                "page": page,
            },
        )
        if response.status_code != 200:
            return {"results": []}
        return response.json()

@router.get("/movie/{movie_id}/videos")
async def get_movie_videos(movie_id: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{TMDB_API_URL}/movie/{movie_id}/videos",
            params={
                "api_key": TMDB_API_KEY,
                "language": "pl-PL",
            },
        )
        if response.status_code != 200:
            return {"results": []}
        return response.json()

@router.get("/tv/{tv_id}/videos")
async def get_tv_videos(tv_id: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{TMDB_API_URL}/tv/{tv_id}/videos",
            params={
                "api_key": TMDB_API_KEY,
                "language": "pl-PL",
            },
        )
        if response.status_code != 200:
            return {"results": []}
        return response.json()

@router.get("/movie/{movie_id}/external_ids")
async def get_movie_external_ids(movie_id: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{TMDB_API_URL}/movie/{movie_id}/external_ids",
            params={
                "api_key": TMDB_API_KEY,
            },
        )
        if response.status_code != 200:
            return {}
        return response.json()

@router.get("/tv/{tv_id}/external_ids")
async def get_tv_external_ids(tv_id: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{TMDB_API_URL}/tv/{tv_id}/external_ids",
            params={
                "api_key": TMDB_API_KEY,
            },
        )
        if response.status_code != 200:
            return {}
        return response.json()

@router.get("/tv/{tv_id}")
async def get_tv_details(tv_id: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{TMDB_API_URL}/tv/{tv_id}",
            params={
                "api_key": TMDB_API_KEY,
                "language": "pl-PL",
            },
        )
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Error fetching TV details from TMDB")
        return response.json()