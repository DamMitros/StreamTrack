from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.notes import router as notes_router
from routes.admin import router as admin_router
from routes.watchlist import router as watchlist_router

app = FastAPI()

origins = [
    "http://localhost:3000", 
]

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

@app.get("/")
async def root():
  return {"message": "Welcome to StreamTrack API"}
