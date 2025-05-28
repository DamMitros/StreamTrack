echo "Building multi-platform Docker images..."

docker buildx create --name multibuilder --use --bootstrap 2>/dev/null || docker buildx use multibuilder

docker buildx build --platform linux/amd64,linux/arm64 -t gollet/streamtrack-api:latest ./api --push

docker buildx build --platform linux/amd64,linux/arm64 -t gollet/streamtrack-frontend:latest ./frontend --push

docker buildx build --platform linux/amd64,linux/arm64 -t gollet/streamtrack-tmdb-proxy:latest ./tmdb-proxy --push

echo "All images built and pushed successfully!"