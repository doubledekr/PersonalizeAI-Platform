#!/bin/bash
set -e

# Configuration
SUBSCRIPTION_ID="${AZURE_SUBSCRIPTION_ID:-3f8dee11-c029-4c26-9aa1-4b0a5d732968}"
RESOURCE_GROUP="${AZURE_RESOURCE_GROUP:-personalizeai-rg}"
LOCATION="${AZURE_LOCATION:-centralus}"
APP_NAME="personalizeai"

# Derived names
STORAGE_ACCOUNT="${APP_NAME}storage$(date +%s | tail -c 6)"
DB_SERVER_NAME="${APP_NAME}-db-$(date +%s | tail -c 6)"
DB_ADMIN_USER="${DB_ADMIN_USER:-personalizeai_admin}"
DB_ADMIN_PASSWORD="${DB_ADMIN_PASSWORD:-PersonalizeAI2024!$(date +%s | tail -c 4)}"
CONTAINER_REGISTRY="${APP_NAME}acr$(date +%s | tail -c 5)"
APP_SERVICE_PLAN="${APP_NAME}-plan"
BACKEND_APP="${APP_NAME}-api"
FRONTEND_APP="${APP_NAME}-frontend"
KEY_VAULT="${APP_NAME}kv$(date +%s | tail -c 5)"
APP_INSIGHTS="${APP_NAME}-insights"

echo "🚀 Starting PersonalizeAI Azure Deployment (Updated)"
echo "Subscription: $SUBSCRIPTION_ID"
echo "Resource Group: $RESOURCE_GROUP"
echo "Location: $LOCATION (PostgreSQL compatible)"

# Set Azure subscription
echo "\n🔧 Setting Azure subscription..."
az account set --subscription "$SUBSCRIPTION_ID"
echo "✅ Subscription verified: $(az account show --query id -o tsv)"

# Register required resource providers
echo "\n🔧 Registering Azure resource providers..."
az provider register --namespace Microsoft.DBforPostgreSQL --wait
az provider register --namespace Microsoft.ContainerRegistry --wait
az provider register --namespace Microsoft.Web --wait
az provider register --namespace Microsoft.Storage --wait
az provider register --namespace Microsoft.KeyVault --wait
az provider register --namespace Microsoft.Insights --wait
az provider register --namespace microsoft.operationalinsights --wait
echo "✅ Resource providers registered"

# Create resource group
echo "\n🟡 Creating resource group in $LOCATION..."
if ! az group show --name "$RESOURCE_GROUP" &>/dev/null; then
  az group create --name "$RESOURCE_GROUP" --location "$LOCATION"
  echo "✅ Resource group created: $RESOURCE_GROUP"
else
  echo "✅ Resource group already exists: $RESOURCE_GROUP"
fi

# Create storage account
echo "\n🟡 Creating storage account..."
az storage account create \
  --name "$STORAGE_ACCOUNT" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --sku Standard_LRS \
  --kind StorageV2
echo "✅ Storage account created: $STORAGE_ACCOUNT"

# Create PostgreSQL database
echo "\n🟡 Creating PostgreSQL database..."
echo "Database server name: $DB_SERVER_NAME"
echo "Database admin user: $DB_ADMIN_USER"
az postgres flexible-server create \
  --name "$DB_SERVER_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --admin-user "$DB_ADMIN_USER" \
  --admin-password "$DB_ADMIN_PASSWORD" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --version 14 \
  --public-access 0.0.0.0
echo "✅ PostgreSQL database created: $DB_SERVER_NAME"

# Create Container Registry
echo "\n🟡 Creating Container Registry..."
az acr create \
  --name "$CONTAINER_REGISTRY" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --sku Basic \
  --admin-enabled true
echo "✅ Container Registry created: $CONTAINER_REGISTRY"

# Create App Service Plan
echo "\n🟡 Creating App Service Plan..."
az appservice plan create \
  --name "$APP_SERVICE_PLAN" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --sku B1 \
  --is-linux
echo "✅ App Service Plan created: $APP_SERVICE_PLAN"

# Create Web App for backend
echo "\n🟡 Creating Web App for backend..."
az webapp create \
  --name "$BACKEND_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --plan "$APP_SERVICE_PLAN" \
  --deployment-container-image-name "python:3.11-slim"
echo "✅ Web App created: $BACKEND_APP"

# Create Static Web App for frontend
echo "\n🟡 Creating Static Web App for frontend..."
az staticwebapp create \
  --name "$FRONTEND_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION"
echo "✅ Static Web App created: $FRONTEND_APP"

# Create Key Vault
echo "\n🟡 Creating Key Vault..."
az keyvault create \
  --name "$KEY_VAULT" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION"
echo "✅ Key Vault created: $KEY_VAULT"

# Create Application Insights
echo "\n🟡 Creating Application Insights..."
az monitor app-insights component create \
  --app "$APP_INSIGHTS" \
  --location "$LOCATION" \
  --resource-group "$RESOURCE_GROUP" \
  --application-type web
echo "✅ Application Insights created: $APP_INSIGHTS"

# Save deployment information
echo "\n💾 Saving deployment information..."
cat > deployment-info.json << EOF
{
  "subscription_id": "$SUBSCRIPTION_ID",
  "resource_group": "$RESOURCE_GROUP",
  "location": "$LOCATION",
  "database_server": "$DB_SERVER_NAME",
  "database_admin": "$DB_ADMIN_USER",
  "database_password": "$DB_ADMIN_PASSWORD",
  "storage_account": "$STORAGE_ACCOUNT",
  "container_registry": "$CONTAINER_REGISTRY",
  "backend_app": "$BACKEND_APP",
  "frontend_app": "$FRONTEND_APP",
  "key_vault": "$KEY_VAULT",
  "app_insights": "$APP_INSIGHTS"
}
EOF
echo "✅ Deployment information saved to deployment-info.json"

echo "\n🎉 Azure infrastructure deployment completed successfully!"
echo "📋 Deployment Summary:"
cat deployment-info.json

echo "\n🚀 Next steps:
1. ./deploy-backend.sh
2. ./deploy-frontend.sh
3. ./setup-secrets.sh"


