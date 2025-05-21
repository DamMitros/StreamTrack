from fastapi import APIRouter, HTTPException
import httpx, os

router = APIRouter()
TMDB_API_KEY = os.getenv("TMDB_API_KEY")
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