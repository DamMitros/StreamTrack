from fastapi import APIRouter, Depends
from database import notes_collection
from auth import require_role
from schemas import NoteResponse 
from typing import List
from datetime import datetime 

router = APIRouter()

@router.get("/admin/notes", response_model=List[NoteResponse])
async def get_all_notes(current_user_data: dict = Depends(require_role("admin"))):
  cursor = notes_collection.find()
  notes = await cursor.to_list(length=None) 
    
  processed_notes = []
  for note_item in notes:
    note_item["_id"] = str(note_item["_id"])
    if "created_at" not in note_item:
      note_item["created_at"] = datetime.min 
    if "user_id" not in note_item:
      note_item["user_id"] = "unknown_user" 
    processed_notes.append(note_item)
    
  return processed_notes

@router.get("/admin/users") 
async def get_users_with_notes_activity(current_user_data: dict = Depends(require_role("admin"))):
  user_ids_with_notes = await notes_collection.distinct("user_id")
    
  if not user_ids_with_notes:
    return {"message": "No users have created notes yet.", "users": []}
        
  return {"users_with_notes_activity": user_ids_with_notes}
