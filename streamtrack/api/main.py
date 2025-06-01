from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import os

from routes.notes import router as notes_router
from routes.admin import router as admin_router
from routes.watchlist import router as watchlist_router
from routes.users import router as users_router

app = FastAPI()

origins_env = os.getenv("CORS_ORIGINS")
if origins_env:
    origins = [o.strip() for o in origins_env.split(",") if o.strip()]
else:
    origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"], 
    allow_headers=["*"], 
)

app.include_router(notes_router, prefix="/api", tags=["Notes"])
app.include_router(watchlist_router, prefix="/api", tags=["Watchlist"])
app.include_router(admin_router, prefix="/api", tags=["Admin"])
app.include_router(users_router, prefix="/api", tags=["Users"])

static_dir = Path("static")
static_dir.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def root():
  return {"message": "Welcome to StreamTrack API"}
