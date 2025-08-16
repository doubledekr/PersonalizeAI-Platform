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
FRONTEND_APP=$(jq -r '.frontend_app' deployment-info.json)
BACKEND_URL=$(jq -r '.backend_url // empty' deployment-info.json)

if [ -z "$BACKEND_URL" ]; then
  BACKEND_APP=$(jq -r '.backend_app' deployment-info.json)
  BACKEND_URL="https://$BACKEND_APP.azurewebsites.net"
fi

echo "🚀 Starting PersonalizeAI Frontend Deployment (Updated)"
echo "Resource Group: $RESOURCE_GROUP"
echo "Frontend App: $FRONTEND_APP"
echo "Backend URL: $BACKEND_URL"

# Prepare frontend source code
echo "\n📁 Preparing frontend source code..."
if [ -d "frontend-source" ]; then
  rm -rf frontend-source
fi

mkdir -p frontend-source
cp -r ../../frontend/* frontend-source/

# Create environment file for production
cat > frontend-source/.env.production << EOF
VITE_API_URL=$BACKEND_URL
VITE_APP_NAME=PersonalizeAI Platform
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
EOF

echo "✅ Frontend source code prepared"

# Install dependencies and build
echo "\n📦 Installing dependencies and building frontend..."
cd frontend-source

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
  exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
  echo "❌ npm is not installed. Please install npm and try again."
  exit 1
fi

# Install dependencies
npm install

# Build the application
npm run build

echo "✅ Frontend built successfully"

# Get Static Web App deployment token
echo "\n🔑 Getting Static Web App deployment token..."
cd ..
DEPLOYMENT_TOKEN=$(az staticwebapp secrets list \
  --name "$FRONTEND_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --query properties.apiKey \
  --output tsv)

if [ -z "$DEPLOYMENT_TOKEN" ]; then
  echo "❌ Failed to get deployment token"
  exit 1
fi

echo "✅ Deployment token retrieved"

# Deploy to Static Web App using Azure CLI
echo "\n🚀 Deploying to Azure Static Web Apps..."

# Create a temporary deployment directory
DEPLOY_DIR="frontend-deploy-$(date +%s)"
mkdir -p "$DEPLOY_DIR"
cp -r frontend-source/dist/* "$DEPLOY_DIR/"

# Create staticwebapp.config.json for routing
cat > "$DEPLOY_DIR/staticwebapp.config.json" << 'EOF'
{
  "routes": [
    {
      "route": "/api/*",
      "allowedRoles": ["anonymous"]
    },
    {
      "route": "/*",
      "serve": "/index.html",
      "statusCode": 200
    }
  ],
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/images/*.{png,jpg,gif}", "/css/*"]
  },
  "mimeTypes": {
    ".json": "application/json"
  }
}
EOF

# Deploy using SWA CLI if available, otherwise use manual upload
if command -v swa &> /dev/null; then
  echo "Using SWA CLI for deployment..."
  cd "$DEPLOY_DIR"
  swa deploy . --deployment-token "$DEPLOYMENT_TOKEN"
  cd ..
else
  echo "SWA CLI not found. Installing..."
  npm install -g @azure/static-web-apps-cli
  
  echo "Deploying with SWA CLI..."
  cd "$DEPLOY_DIR"
  swa deploy . --deployment-token "$DEPLOYMENT_TOKEN"
  cd ..
fi

# Clean up temporary directory
rm -rf "$DEPLOY_DIR"

echo "✅ Frontend deployment completed"

# Get Static Web App URL
echo "\n🌐 Getting frontend URL..."
FRONTEND_URL=$(az staticwebapp show \
  --name "$FRONTEND_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --query defaultHostname \
  --output tsv)

if [ -n "$FRONTEND_URL" ]; then
  FRONTEND_URL="https://$FRONTEND_URL"
  echo "✅ Frontend URL: $FRONTEND_URL"
  
  # Test frontend deployment
  echo "\n🧪 Testing frontend deployment..."
  sleep 15
  
  if curl -f "$FRONTEND_URL" > /dev/null 2>&1; then
    echo "✅ Frontend accessibility test passed"
  else
    echo "⚠️ Frontend accessibility test failed - may still be deploying"
    echo "You can check the status at: $FRONTEND_URL"
  fi
  
  # Save frontend URL to deployment info
  jq --arg url "$FRONTEND_URL" '. + {frontend_url: $url}' deployment-info.json > temp.json && mv temp.json deployment-info.json
else
  echo "⚠️ Could not retrieve frontend URL"
fi

echo "\n🎉 Frontend deployment completed successfully!"
echo "🌐 Frontend URL: $FRONTEND_URL"
echo "🔗 Backend API: $BACKEND_URL"

echo "\n📋 Deployment Summary:"
echo "Frontend: $FRONTEND_URL"
echo "Backend: $BACKEND_URL"
echo "API Health: $BACKEND_URL/health"
echo "Dashboard API: $BACKEND_URL/api/dashboard"

echo "\n🚀 Next step: ./setup-secrets.sh (optional)"
echo "🎯 Your PersonalizeAI platform is now live!"

