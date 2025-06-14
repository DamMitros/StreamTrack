from fastapi import Request, HTTPException, Depends
from database import users_collection
from keycloak.exceptions import KeycloakError
from keycloak import KeycloakOpenID
import os

KEYCLOAK_ISSUER = os.getenv("KEYCLOAK_ISSUER")
KEYCLOAK_SERVER_URL = os.getenv("KEYCLOAK_SERVER_URL")
KEYCLOAK_REALM_NAME = os.getenv("KEYCLOAK_REALM_NAME")
KEYCLOAK_CLIENT_ID = os.getenv("KEYCLOAK_CLIENT_ID")
KEYCLOAK_AUDIENCE = os.getenv("KEYCLOAK_AUDIENCE")
_keycloak_openid = None

def get_keycloak_openid():
  global _keycloak_openid
  if _keycloak_openid is None:
    _keycloak_openid = KeycloakOpenID(
      server_url=KEYCLOAK_SERVER_URL,
      client_id=KEYCLOAK_CLIENT_ID,
      realm_name=KEYCLOAK_REALM_NAME,
      verify=True
    )
  return _keycloak_openid

async def verify_token(token: str):
  try:
    keycloak_openid = get_keycloak_openid()
    token_info = keycloak_openid.decode_token(token, validate=True)

    if token_info.get("aud") != KEYCLOAK_AUDIENCE:
      raise HTTPException(status_code=401, detail="Token nie jest przeznaczony dla tej aplikacji")
    if token_info.get("iss") != KEYCLOAK_ISSUER:
      raise HTTPException(status_code=401, detail="Token pochodzi z nieprawidłowego źródła")
    if token_info.get("azp") != KEYCLOAK_CLIENT_ID:
      raise HTTPException(status_code=401, detail="Token nie jest przeznaczony dla tego klienta aplikacji")
    if not token_info.get("exp"):
      raise HTTPException(status_code=401, detail="Token nie zawiera daty wygaśnięcia (exp)")
    if not token_info.get("sub"):
      raise HTTPException(status_code=401, detail="Token nie zawiera identyfikatora użytkownika (sub)")
    return token_info
        
  except KeycloakError as e:
    raise HTTPException(status_code=401, detail="Nieprawidłowy lub wygasły token")
  except ValueError as e:
    raise HTTPException(status_code=401, detail="Nieprawidłowy format tokenu")
  except Exception as e:
    raise HTTPException(status_code=401, detail="Błąd weryfikacji tokenu")

async def get_current_user(request: Request):
  auth_header = request.headers.get("Authorization", "")
  if not auth_header.startswith("Bearer "):
    raise HTTPException(status_code=401, detail="Brak prawidłowego tokenu uwierzytelniania")
    
  token = auth_header.removeprefix("Bearer ").strip()
  if not token:
    raise HTTPException(status_code=401, detail="Pusty token")

  token_info = await verify_token(token)
  user_id = token_info.get("sub")
  if not user_id:
    raise HTTPException(status_code=401, detail="Token nie zawiera identyfikatora użytkownika")

  try:
    user = await users_collection.find_one({"keycloak_id": user_id})
    if user and not user.get("is_active", True):
      raise HTTPException(status_code=403, detail="Konto użytkownika zostało dezaktywowane")

  except HTTPException:
    raise
  except Exception as db_error:
    raise HTTPException(status_code=500, detail="Błąd sprawdzania statusu użytkownika")
    
  return {
    "user_id": user_id,
    "username": token_info.get("preferred_username"),
    "email": token_info.get("email"),
    "roles": token_info.get("realm_access", {}).get("roles", []),
    "token_info": token_info
  }

def require_role(required_role: str):
  def wrapper(user_data = Depends(get_current_user)):
    if required_role not in user_data["roles"]:
      raise HTTPException(status_code=403, detail="Brak dostępu. Niewystarczające uprawnienia.")
    return user_data
  return wrapper
