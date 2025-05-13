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