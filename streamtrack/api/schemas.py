from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class NoteBase(BaseModel):
  movie_id: str
  content: str
  media_type: str 

class NoteCreate(NoteBase):
  pass

class NoteUpdate(BaseModel):
  content: Optional[str] = None

class NoteResponse(NoteBase):
  id: str = Field(alias="_id")
  user_id: str
  created_at: datetime
  updated_at: Optional[datetime] = None 

  class Config:
    from_attributes = True 
    populate_by_name = True

class WatchlistItemBase(BaseModel):
  movie_id: str
  title: str
  media_type: str 

class WatchlistItemCreate(WatchlistItemBase):
  pass

class WatchlistItemResponse(WatchlistItemBase):
  id: str = Field(alias="_id") 
  user_id: str
  added_at: datetime

  class Config:
    from_attributes = True
    populate_by_name = True
