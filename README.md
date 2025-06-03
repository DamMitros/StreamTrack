# StreamTrack

## Autor: Damian Mitros

## Opis Projektu

Mikroserwisowa aplikacja do odkrywania filmów i serialów z różnych platformy streamingowych. Projekt realizowany w ramach przedmiotów 
- Technologie chmurowe
- Bezpieczeństwo aplikacji webowych

**Serwisy:**
- Frontend (Next.js) - interfejs użytkownika z OAuth 2.0 + PKCE
- API (FastAPI) - backend z weryfikacją JWT i autoryzacją ról
- TMDB-Proxy (FastAPI) - proxy do TMDB API
- Keycloak - serwer OAuth 2.0 z JWT
- MongoDB - baza danych użytkowników

## 🚀 Uruchomienie

### Docker Compose

```bash
cd streamtrack
echo "YOUR_TMDB_API_KEY" > tmdb_api_key.secret
docker-compose up -d
```

**Dostęp:**
- Frontend: http://localhost:3000
- API: http://localhost:8000
- Keycloak: http://localhost:8080

### Kubernetes

```bash
kubectl apply -R -f kubernetes/
minikube tunnel
```