from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime
from database import db 
from schemas import WatchlistItemCreate, WatchlistItemResponse
from auth import get_current_user

router = APIRouter()

def get_watchlist_collection():
	return db.watchlist_items 

@router.post("/watchlist", response_model=WatchlistItemResponse)
async def add_to_watchlist(item: WatchlistItemCreate, current_user_data: dict = Depends(get_current_user)):
	watchlist_collection = get_watchlist_collection()
	item_dict = item.model_dump()
	item_dict["user_id"] = current_user_data["user_id"]
	item_dict["added_at"] = datetime.now()
	existing_item = await watchlist_collection.find_one({
		"user_id": item_dict["user_id"],
		"movie_id": item_dict["movie_id"]
	})
	if existing_item:
		raise HTTPException(status_code=409, detail="Item already in watchlist")

	try:
		result = await watchlist_collection.insert_one(item_dict)
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"Failed to add item to watchlist: {e}")

	created_item_from_db = await watchlist_collection.find_one({"_id": result.inserted_id})

	if not created_item_from_db:
		raise HTTPException(status_code=500, detail="Failed to create and retrieve watchlist item")
	
	response_data = dict(created_item_from_db)
	response_data["_id"] = str(response_data["_id"])
	return response_data

@router.get("/watchlist", response_model=List[WatchlistItemResponse])
async def get_watchlist(current_user_data: dict = Depends(get_current_user)):
	watchlist_collection = get_watchlist_collection()
	user_id_str = current_user_data["user_id"]

	try:
		cursor = watchlist_collection.find({"user_id": user_id_str})
		watchlist_items_from_db = await cursor.to_list(length=None)
	except Exception as e:
		raise HTTPException(status_code=500, detail=f"Error fetching watchlist: {e}")

	processed_items = []
	if not watchlist_items_from_db:
		return []

	for item_db in watchlist_items_from_db:
		processed_item = dict(item_db)
		processed_item["_id"] = str(item_db["_id"]) 
		if "added_at" not in processed_item: 
			processed_item["added_at"] = datetime.min 
		processed_items.append(processed_item)
		
	return processed_items

@router.delete("/watchlist/{movie_id}", status_code=200)
async def remove_from_watchlist(movie_id: str, current_user_data: dict = Depends(get_current_user)):
	watchlist_collection = get_watchlist_collection()
	user_id_str = current_user_data["user_id"]
	delete_result = await watchlist_collection.delete_one({
		"movie_id": movie_id,
		"user_id": user_id_str
	})

	if delete_result.deleted_count == 0:
		raise HTTPException(status_code=404, detail="Item not found in watchlist or you don't have permission")
	
	return {"message": "Item removed from watchlist successfully", "removed_movie_id": movie_id}

@router.get("/watchlist/check/{movie_id}", response_model=bool)
async def check_watchlist_item(movie_id: str, current_user_data: dict = Depends(get_current_user)):
	watchlist_collection = get_watchlist_collection()
	user_id_str = current_user_data["user_id"]
	
	item = await watchlist_collection.find_one({
		"user_id": user_id_str,
		"movie_id": movie_id
	})
	return item is not None
