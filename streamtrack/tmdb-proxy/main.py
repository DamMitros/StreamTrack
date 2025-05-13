from fastapi import FastAPI
from tmdb import router as tmdb_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],  # później do ograniczenia!
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

app.include_router(tmdb_router)