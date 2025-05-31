export const config = {
  API_URL: typeof window !== "undefined" 
    ? window?.env?.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost/api"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost/api",
    
  TMDB_PROXY_URL: typeof window !== "undefined" 
    ? window?.env?.NEXT_PUBLIC_TMDB_PROXY_URL || process.env.NEXT_PUBLIC_TMDB_PROXY_URL || "http://localhost/tmdb"
    : process.env.NEXT_PUBLIC_TMDB_PROXY_URL || "http://localhost/tmdb",
    
  KEYCLOAK_URL: typeof window !== "undefined" 
    ? window?.env?.NEXT_PUBLIC_KEYCLOAK_URL || process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost"
    : process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost",
    
  KEYCLOAK_REALM: typeof window !== "undefined" 
    ? window?.env?.NEXT_PUBLIC_KEYCLOAK_REALM || process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "streamtrack"
    : process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "streamtrack",
    
  KEYCLOAK_CLIENT_ID: typeof window !== "undefined" 
    ? window?.env?.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "frontend"
    : process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "frontend",
};