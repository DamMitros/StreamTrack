from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from typing import List
from datetime import datetime
from pathlib import Path
from database import db, users_collection
from schemas import UserCreate, UserUpdate, UserResponse, UserPromoteRequest, UserRole
from auth import get_current_user, require_role
from keycloak_service import keycloak_service
from bson import ObjectId
import os, uuid 

router = APIRouter()

@router.post("/register", response_model=UserResponse, operation_id="user_register")
async def register_user(user_data: UserCreate):
  try:
    existing_user = await users_collection.find_one({
      "$or": [
        {"username": user_data.username},
        {"email": user_data.email}
      ]
    })
    
    if existing_user:
      raise HTTPException(status_code=409, detail="User with this username or email already exists")
    
    keycloak_id = await keycloak_service.create_user(
      username=user_data.username,
      email=user_data.email,
      password=user_data.password,
      first_name=user_data.first_name,
      last_name=user_data.last_name
    )

    await keycloak_service.assign_role(keycloak_id, "user")

    user_doc = {
      "username": user_data.username,
      "email": user_data.email,
      "first_name": user_data.first_name,
      "last_name": user_data.last_name,
      "keycloak_id": keycloak_id,
      "roles": [UserRole.USER],
      "is_active": True,
      "avatar_url": None,
      "created_at": datetime.now(),
      "updated_at": None
    }
    
    result = await users_collection.insert_one(user_doc)
    created_user = await users_collection.find_one({"_id": result.inserted_id})

    response_data = dict(created_user)
    response_data["_id"] = str(response_data["_id"])
    return response_data
    
  except HTTPException:
    raise
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Failed to register user: {str(e)}")

@router.get("/users", response_model=List[UserResponse], operation_id="admin_get_all_users")
async def get_all_users(current_user_data: dict = Depends(require_role("admin"))):
  try:
    cursor = users_collection.find()
    users = await cursor.to_list(length=None)
    
    processed_users = []
    for user in users:
      user["_id"] = str(user["_id"])
      if "created_at" not in user:
        user["created_at"] = datetime.min
      processed_users.append(user)
      
    return processed_users
    
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Failed to fetch users: {str(e)}")

@router.get("/profile", response_model=UserResponse, operation_id="user_get_profile")
async def get_user_profile(current_user_data: dict = Depends(get_current_user)):
  try:
    user = await users_collection.find_one({"keycloak_id": current_user_data["user_id"]})
    
    if not user:
      try:
        user_doc = {
          "keycloak_id": current_user_data["user_id"],
          "username": f"user_{current_user_data['user_id'][:8]}", 
          "email": None,  
          "first_name": None,
          "last_name": None,
          "roles": [UserRole.USER],
          "is_active": True,
          "avatar_url": None,
          "created_at": datetime.now(),
          "updated_at": None
        }
        
        result = await users_collection.insert_one(user_doc)
        user = await users_collection.find_one({"_id": result.inserted_id})
        
      except Exception as create_error:
        raise HTTPException(status_code=500, detail=f"Failed to create user profile: {str(create_error)}")
    
    response_data = dict(user)
    response_data["_id"] = str(response_data["_id"])
    return response_data
    
  except HTTPException:
    raise
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Failed to fetch user profile: {str(e)}")

@router.put("/profile", response_model=UserResponse, operation_id="user_update_profile")
async def update_user_profile(user_update: UserUpdate, current_user_data: dict = Depends(get_current_user)):
  try:
    user = await users_collection.find_one({"keycloak_id": current_user_data["user_id"]})
    
    if not user:
      raise HTTPException(status_code=404, detail="User not found")
    
    update_data = {}
    keycloak_update_data = {}
    
    if user_update.email is not None:
      update_data["email"] = user_update.email
      keycloak_update_data["email"] = user_update.email
      
    if user_update.first_name is not None:
      update_data["first_name"] = user_update.first_name
      keycloak_update_data["first_name"] = user_update.first_name
      
    if user_update.last_name is not None:
      update_data["last_name"] = user_update.last_name
      keycloak_update_data["last_name"] = user_update.last_name
      
    if user_update.avatar_url is not None:
      update_data["avatar_url"] = user_update.avatar_url
    
    if not update_data:
      response_data = dict(user)
      response_data["_id"] = str(response_data["_id"])
      return response_data
      
    if keycloak_update_data:
      await keycloak_service.update_user(
        user_id=current_user_data["user_id"],
        **keycloak_update_data
      )
    
    update_data["updated_at"] = datetime.now()
    
    await users_collection.update_one(
      {"keycloak_id": current_user_data["user_id"]},
      {"$set": update_data}
    )
    
    updated_user = await users_collection.find_one({"keycloak_id": current_user_data["user_id"]})
    response_data = dict(updated_user)
    response_data["_id"] = str(response_data["_id"])
    return response_data
    
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Failed to update user profile: {str(e)}")

@router.post("/avatar", response_model=dict, operation_id="upload_avatar")
async def upload_avatar(file: UploadFile = File(...), current_user_data: dict = Depends(get_current_user)):
  try:
    if not file.content_type or not file.content_type.startswith("image/"):
      raise HTTPException(status_code=400, detail="File must be an image")
    
    if file.size and file.size > 5 * 1024 * 1024:
      raise HTTPException(status_code=400, detail="File size must be less than 5MB")
    
    avatars_dir = Path("static/avatars")
    avatars_dir.mkdir(parents=True, exist_ok=True)
    file_extension = file.filename.split('.')[-1] if file.filename and '.' in file.filename else 'jpg'
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = avatars_dir / unique_filename

    with open(file_path, "wb") as buffer:
      content = await file.read()
      buffer.write(content)
    
    avatar_url = f"/static/avatars/{unique_filename}"
    await users_collection.update_one(
      {"keycloak_id": current_user_data["user_id"]},
      {"$set": {"avatar_url": avatar_url, "updated_at": datetime.now()}}
    )
    
    return {"avatar_url": avatar_url, "message": "Avatar uploaded successfully"}
    
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Failed to upload avatar: {str(e)}")

@router.post("/promote", response_model=dict, operation_id="admin_promote_user")
async def promote_user(promotion_request: UserPromoteRequest, current_user_data: dict = Depends(require_role("admin"))):
  try:
    user = await users_collection.find_one({"_id": ObjectId(promotion_request.user_id)})
    
    if not user:
      raise HTTPException(status_code=404, detail="User not found")
    
    keycloak_id = user["keycloak_id"]
    current_roles = user.get("roles", [])
    
    if promotion_request.role == UserRole.ADMIN:
      if UserRole.ADMIN not in current_roles:
        await keycloak_service.assign_role(keycloak_id, "admin")
        current_roles.append(UserRole.ADMIN)
        
        await users_collection.update_one(
          {"_id": ObjectId(promotion_request.user_id)},
          {"$set": {"roles": current_roles, "updated_at": datetime.now()}}
        )
        
        return {"message": f"User {user['username']} has been promoted to admin"}
      else:
        return {"message": f"User {user['username']} is already an admin"}
        
    elif promotion_request.role == UserRole.USER:
      if UserRole.ADMIN in current_roles:
        await keycloak_service.remove_role(keycloak_id, "admin")
        current_roles.remove(UserRole.ADMIN)
        
        await users_collection.update_one(
          {"_id": ObjectId(promotion_request.user_id)},
          {"$set": {"roles": current_roles, "updated_at": datetime.now()}}
        )
        
        return {"message": f"User {user['username']} has been demoted from admin"}
      else:
        return {"message": f"User {user['username']} is not an admin"}
    
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Failed to change user role: {str(e)}")

@router.get("/users/{user_id}", response_model=UserResponse, operation_id="admin_get_user_by_id")
async def get_user_by_id(user_id: str, current_user_data: dict = Depends(require_role("admin"))):
  try:
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    
    if not user:
      raise HTTPException(status_code=404, detail="User not found")
    
    response_data = dict(user)
    response_data["_id"] = str(response_data["_id"])
    return response_data
    
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Failed to fetch user: {str(e)}")

@router.delete("/users/{user_id}", operation_id="admin_deactivate_user")
async def deactivate_user(user_id: str, current_user_data: dict = Depends(require_role("admin"))):
  try:
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    
    if not user:
      raise HTTPException(status_code=404, detail="User not found")

    await users_collection.update_one(
      {"_id": ObjectId(user_id)},
      {"$set": {"is_active": False, "updated_at": datetime.now()}}
    )
    
    return {"message": f"User {user['username']} has been deactivated"}
    
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Failed to deactivate user: {str(e)}")

@router.put("/users/{user_id}/activate", operation_id="admin_activate_user")
async def activate_user(user_id: str, current_user_data: dict = Depends(require_role("admin"))):
  try:
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    
    if not user:
      raise HTTPException(status_code=404, detail="User not found")

    await users_collection.update_one(
      {"_id": ObjectId(user_id)},
      {"$set": {"is_active": True, "updated_at": datetime.now()}}
    )
    
    return {"message": f"User {user['username']} has been activated"}
    
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Failed to activate user: {str(e)}")