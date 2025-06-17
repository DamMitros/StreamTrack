import httpx, asyncio, json, os
from fastapi import HTTPException
from typing import Dict, Any, List

class KeycloakService:
	def __init__(self):
		self.keycloak_url = os.getenv("KEYCLOAK_SERVER_URL", "http://keycloak:8080")
		self.realm = os.getenv("KEYCLOAK_REALM_NAME", "streamtrack")
		self.admin_username = os.getenv("KEYCLOAK_ADMIN", "admin")
		self.admin_password = os.getenv("KEYCLOAK_ADMIN_PASSWORD", "admin")
		self.client_id = "admin-cli"
		
	async def get_admin_token(self):
		async with httpx.AsyncClient() as client:
			try:
				response = await client.post(
					f"{self.keycloak_url}/realms/master/protocol/openid-connect/token",
					data={
						"client_id": self.client_id,
						"username": self.admin_username,
						"password": self.admin_password,
						"grant_type": "password"
					},
					headers={"Content-Type": "application/x-www-form-urlencoded"}
				)
				response.raise_for_status()
				token_data = response.json()
				return token_data["access_token"]
			except httpx.RequestError as exc:
				raise HTTPException(status_code=503, detail=f"Could not connect to Keycloak: {exc}")
			except KeyError:
				raise HTTPException(status_code=500, detail="Invalid token response from Keycloak")

	async def create_user(self, username, email, password, first_name=None, last_name=None):
		token = await self.get_admin_token()
		
		user_data = {
			"username": username,
			"email": email,
			"enabled": True,
			"emailVerified": True,
			"credentials": [{
				"type": "password",
				"value": password,
				"temporary": False
			}]
		}
		
		if first_name:
			user_data["firstName"] = first_name
		if last_name:
			user_data["lastName"] = last_name
			
		async with httpx.AsyncClient() as client:
			try:
				response = await client.post(
					f"{self.keycloak_url}/admin/realms/{self.realm}/users",
					json=user_data,
					headers={
						"Authorization": f"Bearer {token}",
						"Content-Type": "application/json"
					}
				)
				
				if response.status_code == 409:
					raise HTTPException(status_code=409, detail="User already exists")
					
				response.raise_for_status()
				location = response.headers.get("Location")
				if location:
					user_id = location.split("/")[-1]
					return user_id
				else:
					return await self.get_user_id_by_username(username)
					
			except httpx.RequestError as exc:
				raise HTTPException(status_code=503, detail=f"Could not connect to Keycloak: {exc}")

	async def get_user_id_by_username(self, username):
		token = await self.get_admin_token()
		
		async with httpx.AsyncClient() as client:
			try:
				response = await client.get(
					f"{self.keycloak_url}/admin/realms/{self.realm}/users",
					params={"username": username, "exact": "true"},
					headers={"Authorization": f"Bearer {token}"}
				)
				response.raise_for_status()
				users = response.json()
				
				if not users:
					raise HTTPException(status_code=404, detail="User not found")
					
				return users[0]["id"]
				
			except httpx.RequestError as exc:
				raise HTTPException(status_code=503, detail=f"Could not connect to Keycloak: {exc}")

	async def update_user(self, user_id, email=None, first_name=None, last_name=None):
		token = await self.get_admin_token()
		
		user_data = {}
		if email:
			user_data["email"] = email
		if first_name:
			user_data["firstName"] = first_name
		if last_name:
			user_data["lastName"] = last_name
			
		if not user_data:
			return True
			
		async with httpx.AsyncClient() as client:
			try:
				response = await client.put(
					f"{self.keycloak_url}/admin/realms/{self.realm}/users/{user_id}",
					json=user_data,
					headers={
						"Authorization": f"Bearer {token}",
						"Content-Type": "application/json"
					}
				)
				response.raise_for_status()
				return True
				
			except httpx.RequestError as exc:
				raise HTTPException(status_code=503, detail=f"Could not connect to Keycloak: {exc}")

	async def assign_role(self, user_id, role_name):
		token = await self.get_admin_token()

		async with httpx.AsyncClient() as client:
			try:
				role_response = await client.get(
					f"{self.keycloak_url}/admin/realms/{self.realm}/roles/{role_name}",
					headers={"Authorization": f"Bearer {token}"}
				)
				role_response.raise_for_status()
				role_data = role_response.json()
			
				assign_response = await client.post(
					f"{self.keycloak_url}/admin/realms/{self.realm}/users/{user_id}/role-mappings/realm",
					json=[role_data],
					headers={
						"Authorization": f"Bearer {token}",
						"Content-Type": "application/json"
					}
				)
				assign_response.raise_for_status()
				return True
				
			except httpx.RequestError as exc:
				raise HTTPException(status_code=503, detail=f"Could not connect to Keycloak: {exc}")

	async def remove_role(self, user_id, role_name):
		token = await self.get_admin_token()
		
		async with httpx.AsyncClient() as client:
			try:
				role_response = await client.get(
					f"{self.keycloak_url}/admin/realms/{self.realm}/roles/{role_name}",
					headers={"Authorization": f"Bearer {token}"}
				)
				role_response.raise_for_status()
				role_data = role_response.json()

				remove_response = await client.request(
					method="DELETE",
					url=f"{self.keycloak_url}/admin/realms/{self.realm}/users/{user_id}/role-mappings/realm",
					json=[role_data],
					headers={
						"Authorization": f"Bearer {token}",
						"Content-Type": "application/json"
					}
				)
				remove_response.raise_for_status()
				return True
				
			except httpx.RequestError as exc:
				raise HTTPException(status_code=503, detail=f"Could not connect to Keycloak: {exc}")

	async def get_user_roles(self, user_id):
		token = await self.get_admin_token()
		
		async with httpx.AsyncClient() as client:
			try:
				response = await client.get(
					f"{self.keycloak_url}/admin/realms/{self.realm}/users/{user_id}/role-mappings/realm",
					headers={"Authorization": f"Bearer {token}"}
				)
				response.raise_for_status()
				roles = response.json()
				return [role["name"] for role in roles]
				
			except httpx.RequestError as exc:
				raise HTTPException(status_code=503, detail=f"Could not connect to Keycloak: {exc}")

keycloak_service = KeycloakService()
