#!/bin/sh

export ASSET_PREFIX=""
export BASE_PATH=""

export NEXT_PUBLIC_KEYCLOAK_URL=${NEXT_PUBLIC_KEYCLOAK_URL:-"http://localhost:8080"}
export NEXT_PUBLIC_KEYCLOAK_REALM=${NEXT_PUBLIC_KEYCLOAK_REALM:-"streamtrack"}
export NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=${NEXT_PUBLIC_KEYCLOAK_CLIENT_ID:-"frontend"}
export NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-"http://localhost:8000"}
export NEXT_PUBLIC_TMDB_PROXY_URL=${NEXT_PUBLIC_TMDB_PROXY_URL:-"http://localhost:9000"}

envsubst < /app/public/env.template.js > /app/public/env.js

echo "Generated env.js with the following configuration:"
cat /app/public/env.js

exec "$@"