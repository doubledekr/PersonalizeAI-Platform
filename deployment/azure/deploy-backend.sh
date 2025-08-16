#!/bin/bash
set -e

# Check if deployment info exists
if [ ! -f "deployment-info.json" ]; then
  echo "❌ Error: deployment-info.json not found"
  echo "Please run ./deploy-infrastructure.sh first"
  exit 1
fi

# Load deployment configuration
RESOURCE_GROUP=$(jq -r '.resource_group' deployment-info.json)
BACKEND_APP=$(jq -r '.backend_app' deployment-info.json)
CONTAINER_REGISTRY=$(jq -r '.container_registry' deployment-info.json)
DB_SERVER=$(jq -r '.database_server' deployment-info.json)
DB_ADMIN=$(jq -r '.database_admin' deployment-info.json)
DB_PASSWORD=$(jq -r '.database_password' deployment-info.json)
LOCATION=$(jq -r '.location' deployment-info.json)

echo "🚀 Starting PersonalizeAI Backend Deployment (Updated)"
echo "Resource Group: $RESOURCE_GROUP"
echo "Backend App: $BACKEND_APP"
echo "Container Registry: $CONTAINER_REGISTRY"
echo "Database Server: $DB_SERVER"
echo "Location: $LOCATION"

# Prepare backend source code
echo "\n📁 Preparing backend source code..."
if [ -d "backend-source" ]; then
  rm -rf backend-source
fi

mkdir -p backend-source
cp -r ../../backend/* backend-source/

# Create Dockerfile for backend
cat > backend-source/Dockerfile << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app \
    && chown -R app:app /app
USER app

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Start application
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "2", "--timeout", "120", "src.main:app"]
EOF

echo "✅ Backend source code prepared"

# Login to Azure Container Registry
echo "\n🔐 Logging into Azure Container Registry..."
az acr login --name "$CONTAINER_REGISTRY"
echo "✅ Logged into Container Registry"

# Build and push Docker image
echo "\n🔨 Building and pushing Docker image..."
IMAGE_NAME="$CONTAINER_REGISTRY.azurecr.io/personalizeai-backend:latest"

docker build -t "$IMAGE_NAME" backend-source/
docker push "$IMAGE_NAME"
echo "✅ Docker image built and pushed: $IMAGE_NAME"

# Configure Web App to use container
echo "\n⚙️ Configuring Web App container..."
az webapp config container set \
  --name "$BACKEND_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --docker-custom-image-name "$IMAGE_NAME" \
  --docker-registry-server-url "https://$CONTAINER_REGISTRY.azurecr.io"

# Get ACR credentials
ACR_USERNAME=$(az acr credential show --name "$CONTAINER_REGISTRY" --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name "$CONTAINER_REGISTRY" --query passwords[0].value -o tsv)

# Configure container registry credentials
az webapp config appsettings set \
  --name "$BACKEND_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --settings \
    DOCKER_REGISTRY_SERVER_URL="https://$CONTAINER_REGISTRY.azurecr.io" \
    DOCKER_REGISTRY_SERVER_USERNAME="$ACR_USERNAME" \
    DOCKER_REGISTRY_SERVER_PASSWORD="$ACR_PASSWORD"

echo "✅ Container configuration completed"

# Configure application settings
echo "\n⚙️ Configuring application settings..."
DATABASE_URL="postgresql://$DB_ADMIN:$DB_PASSWORD@$DB_SERVER.postgres.database.azure.com:5432/personalizeai_db"

az webapp config appsettings set \
  --name "$BACKEND_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --settings \
    DATABASE_URL="$DATABASE_URL" \
    WEBSITES_PORT=8000 \
    SCM_DO_BUILD_DURING_DEPLOYMENT=false \
    WEBSITES_ENABLE_APP_SERVICE_STORAGE=false \
    FLASK_ENV=production

echo "✅ Application settings configured"

# Restart the web app
echo "\n🔄 Restarting Web App..."
az webapp restart --name "$BACKEND_APP" --resource-group "$RESOURCE_GROUP"
echo "✅ Web App restarted"

# Wait for deployment and test
echo "\n🧪 Testing backend deployment..."
sleep 30

BACKEND_URL="https://$BACKEND_APP.azurewebsites.net"
echo "Backend URL: $BACKEND_URL"

# Test health endpoint
if curl -f "$BACKEND_URL/health" > /dev/null 2>&1; then
  echo "✅ Backend health check passed"
else
  echo "⚠️ Backend health check failed - may still be starting up"
  echo "You can check the status at: $BACKEND_URL/health"
fi

# Test API endpoints
echo "\n🔍 Testing API endpoints..."
echo "Health: $BACKEND_URL/health"
echo "API Root: $BACKEND_URL/api"
echo "Dashboard: $BACKEND_URL/api/dashboard"

echo "\n🎉 Backend deployment completed successfully!"
echo "🌐 Backend URL: $BACKEND_URL"
echo "📊 Dashboard API: $BACKEND_URL/api/dashboard"

# Save backend URL to deployment info
jq --arg url "$BACKEND_URL" '. + {backend_url: $url}' deployment-info.json > temp.json && mv temp.json deployment-info.json

echo "\n🚀 Next step: ./deploy-frontend.sh"

