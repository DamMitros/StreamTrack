from fastapi import Request, HTTPException, Depends
from database import users_collection
from jose import jwt, JWTError
import httpx, os

KEYCLOAK_URL = os.getenv("KEYCLOAK_JWKS_URL")

async def get_public_key():
  async with httpx.AsyncClient() as client:
    try:
      if not KEYCLOAK_URL:
        raise HTTPException(status_code=500, detail="KEYCLOAK_JWKS_URL is not configured")
      res = await client.get(KEYCLOAK_URL)
      res.raise_for_status()  
      jwks = res.json()
      if "keys" not in jwks or not isinstance(jwks["keys"], list) or not jwks["keys"]:
        raise HTTPException(status_code=500, detail="Invalid JWKS format from Keycloak: \'keys\' array is missing or empty.")
      return jwks["keys"] 
    except httpx.RequestError as exc: # Błędy połączenia, timeouty
      raise HTTPException(status_code=503, detail=f"Could not connect to Keycloak to fetch public key: {exc}")
    except (KeyError, IndexError, TypeError, ValueError) as exc: # ValueError dla errorów z json()
      raise HTTPException(status_code=500, detail=f"Error parsing JWKS response from Keycloak: {exc}")

async def get_current_user(request: Request):
  token = request.headers.get("Authorization", "").removeprefix("Bearer ").strip()
  if not token:
    raise HTTPException(status_code=401, detail="Brak tokenu")

  try:
    keys = await get_public_key()
    payload = jwt.decode(token, key=keys, algorithms=["RS256"], options={"verify_aud": False})
  except JWTError as e:
    raise HTTPException(status_code=401, detail=f"Nieprawidłowy token lub błąd weryfikacji: {e}")
  except Exception as e: 
    raise HTTPException(status_code=500, detail=f"Wewnętrzny błąd serwera podczas weryfikacji tokenu: {e}")

  user_id = payload.get("sub")
  if not user_id:
    raise HTTPException(status_code=401, detail="Token nie zawiera identyfikatora użytkownika (sub).")

  try:
    user = await users_collection.find_one({"keycloak_id": user_id})
    if user and not user.get("is_active", True):
      raise HTTPException(status_code=403, detail="Konto użytkownika zostało dezaktywowane.")
  except HTTPException:
    raise
  except Exception as db_error:
    print(f"Database error while checking user status: {db_error}")

  return {
    "user_id": user_id,
    "roles": payload.get("realm_access", {}).get("roles", [])
  }

def require_role(required_role: str):
  def wrapper(user_data: dict = Depends(get_current_user)): 
    if required_role not in user_data["roles"]:
      raise HTTPException(status_code=403, detail="Brak dostępu. Niewystarczające uprawnienia.")
    return user_data
  return wrapper
