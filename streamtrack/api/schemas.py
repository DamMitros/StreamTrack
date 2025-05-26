from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"

class UserBase(BaseModel):
    username: str
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None
    
class UserCreate(UserBase):
    password: str
    
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None
    
class UserResponse(UserBase):
    id: str = Field(alias="_id")
    keycloak_id: str
    roles: list[UserRole] = []
    is_active: bool = True
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
        populate_by_name = True

class UserPromoteRequest(BaseModel):
    user_id: str
    role: UserRole

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
