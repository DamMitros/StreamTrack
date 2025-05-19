from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from routes import notes, admin
from database import notes_collection

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

app.include_router(notes.router, prefix="/api")
app.include_router(admin.router)

@app.get("/")
async def root():
  return {"message": "Welcome to StreamTrack API"}
