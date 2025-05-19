from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from bson import ObjectId
from datetime import datetime
from pymongo import ReturnDocument 
from database import notes_collection
from schemas import NoteCreate, NoteResponse, NoteUpdate
from auth import get_current_user

router = APIRouter()

@router.post("/notes", response_model=NoteResponse)
async def create_note(note: NoteCreate, current_user_data: dict = Depends(get_current_user)):
  note_dict = note.model_dump() 
  note_dict["user_id"] = current_user_data["user_id"] 
  current_time = datetime.now()
  note_dict["created_at"] = current_time
  note_dict["updated_at"] = current_time 
    
  try:
    result = await notes_collection.insert_one(note_dict)
  except Exception as e:
    raise HTTPException(status_code=500, detail="Failed to insert note into database")
    
  created_note_from_db = await notes_collection.find_one({"_id": result.inserted_id})
    
  if not created_note_from_db:
    raise HTTPException(status_code=500, detail="Failed to create and retrieve note from database")

  response_data = dict(created_note_from_db)
  response_data["_id"] = str(response_data["_id"]) 
  return response_data

@router.get("/notes", response_model=List[NoteResponse])
async def get_notes(current_user_data: dict = Depends(get_current_user)):
  user_id_str = current_user_data["user_id"]

  try:
    cursor = notes_collection.find({"user_id": user_id_str})
    notes_from_db = await cursor.to_list(length=None) 
  except Exception as e:
    raise HTTPException(status_code=500, detail="Error fetching notes from database")

  processed_notes = []
  if not notes_from_db:
    return []

  for i, note_item_db in enumerate(notes_from_db):
    processed_item = dict(note_item_db)

    try:
      original_id = processed_item["_id"]
      processed_item["_id"] = str(original_id)
    except Exception as e:
      continue

    if "created_at" not in processed_item:
      processed_item["created_at"] = datetime.min 
    if "updated_at" not in processed_item:
      processed_item["updated_at"] = None
    processed_notes.append(processed_item)

  return processed_notes

@router.get("/notes/{note_id}", response_model=NoteResponse)
async def get_note(note_id: str, current_user_data: dict = Depends(get_current_user)):
  user_id_str = current_user_data["user_id"]
  try:
    obj_id = ObjectId(note_id)
  except Exception: 
    raise HTTPException(status_code=400, detail="Invalid note ID format")
    
  note = await notes_collection.find_one({"_id": obj_id, "user_id": user_id_str})
    
  if not note:
    raise HTTPException(status_code=404, detail="Note not found or access denied")
  note["_id"] = str(note["_id"])
  if "created_at" not in note:
    note["created_at"] = datetime.min 

  return note

@router.delete("/notes/{note_id}", status_code=200) 
async def delete_note(note_id: str, current_user_data: dict = Depends(get_current_user)):
  user_id_str = current_user_data["user_id"]
  try:
    obj_id = ObjectId(note_id)
  except Exception: 
    raise HTTPException(status_code=400, detail="Invalid note ID format")
    
  delete_result = await notes_collection.delete_one({"_id": obj_id, "user_id": user_id_str})
    
  if delete_result.deleted_count == 0:
    raise HTTPException(status_code=404, detail="Note not found or you don't have permission to delete it")
    
  return {"message": "Note deleted successfully", "deleted_note_id": note_id}

@router.put("/notes/{note_id}", response_model=NoteResponse)
async def update_note(note_id: str, note_update: NoteUpdate, current_user_data: dict = Depends(get_current_user)):
  user_id_str = current_user_data["user_id"]
  try:
    obj_id = ObjectId(note_id)
  except Exception:
    raise HTTPException(status_code=400, detail="Invalid note ID format")

  update_data = note_update.model_dump(exclude_unset=True)
  if not update_data:
    raise HTTPException(status_code=400, detail="No update data provided")
    
  update_data["updated_at"] = datetime.now()

  updated_note_doc = await notes_collection.find_one_and_update(
    {"_id": obj_id, "user_id": user_id_str},
    {"$set": update_data},
    return_document=ReturnDocument.AFTER 
  )

  if not updated_note_doc:
    existing_note = await notes_collection.find_one({"_id": obj_id})
    if not existing_note:
      raise HTTPException(status_code=404, detail="Note not found")
    else: 
      raise HTTPException(status_code=403, detail="Access denied or no changes made")
    
  updated_note_doc["_id"] = str(updated_note_doc["_id"])
  if "created_at" not in updated_note_doc:
    original_note = await notes_collection.find_one({"_id": obj_id, "user_id": user_id_str})
    if original_note and "created_at" in original_note:
      updated_note_doc["created_at"] = original_note["created_at"]
    else: 
      updated_note_doc["created_at"] = datetime.min

  return updated_note_doc
