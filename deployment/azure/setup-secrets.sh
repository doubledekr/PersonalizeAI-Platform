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
KEY_VAULT=$(jq -r '.key_vault' deployment-info.json)
BACKEND_APP=$(jq -r '.backend_app' deployment-info.json)
DB_SERVER=$(jq -r '.database_server' deployment-info.json)
DB_ADMIN=$(jq -r '.database_admin' deployment-info.json)
DB_PASSWORD=$(jq -r '.database_password' deployment-info.json)

echo "🚀 Starting PersonalizeAI Secrets Setup"
echo "Resource Group: $RESOURCE_GROUP"
echo "Key Vault: $KEY_VAULT"
echo "Backend App: $BACKEND_APP"

# Prompt for OpenAI API Key if not provided
if [ -z "$OPENAI_API_KEY" ]; then
  echo "\n🔑 OpenAI API Key Setup"
  echo "Please enter your OpenAI API Key (starts with sk-):"
  read -s OPENAI_API_KEY
  
  if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OpenAI API Key is required for PersonalizeAI to function"
    exit 1
  fi
  
  if [[ ! "$OPENAI_API_KEY" =~ ^sk- ]]; then
    echo "⚠️ Warning: OpenAI API Key should start with 'sk-'"
    echo "Continue anyway? (y/N)"
    read -r confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
      exit 1
    fi
  fi
fi

# Generate a secure secret key if not provided
if [ -z "$SECRET_KEY" ]; then
  SECRET_KEY=$(openssl rand -hex 32)
  echo "✅ Generated secure secret key"
fi

echo "\n🔐 Storing secrets in Azure Key Vault..."

# Store secrets in Key Vault
az keyvault secret set \
  --vault-name "$KEY_VAULT" \
  --name "openai-api-key" \
  --value "$OPENAI_API_KEY" \
  > /dev/null

az keyvault secret set \
  --vault-name "$KEY_VAULT" \
  --name "secret-key" \
  --value "$SECRET_KEY" \
  > /dev/null

az keyvault secret set \
  --vault-name "$KEY_VAULT" \
  --name "database-password" \
  --value "$DB_PASSWORD" \
  > /dev/null

DATABASE_URL="postgresql://$DB_ADMIN:$DB_PASSWORD@$DB_SERVER.postgres.database.azure.com:5432/personalizeai_db"
az keyvault secret set \
  --vault-name "$KEY_VAULT" \
  --name "database-url" \
  --value "$DATABASE_URL" \
  > /dev/null

echo "✅ Secrets stored in Key Vault"

# Configure Web App to use Key Vault references
echo "\n⚙️ Configuring Web App to use Key Vault..."

# Get the Web App's managed identity
echo "Enabling managed identity for Web App..."
PRINCIPAL_ID=$(az webapp identity assign \
  --name "$BACKEND_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --query principalId \
  --output tsv)

echo "✅ Managed identity enabled: $PRINCIPAL_ID"

# Grant Key Vault access to the Web App
echo "Granting Key Vault access to Web App..."
az keyvault set-policy \
  --name "$KEY_VAULT" \
  --object-id "$PRINCIPAL_ID" \
  --secret-permissions get list

echo "✅ Key Vault access granted"

# Update Web App settings to use Key Vault references
echo "Updating Web App settings with Key Vault references..."
az webapp config appsettings set \
  --name "$BACKEND_APP" \
  --resource-group "$RESOURCE_GROUP" \
  --settings \
    OPENAI_API_KEY="@Microsoft.KeyVault(VaultName=$KEY_VAULT;SecretName=openai-api-key)" \
    SECRET_KEY="@Microsoft.KeyVault(VaultName=$KEY_VAULT;SecretName=secret-key)" \
    DATABASE_URL="@Microsoft.KeyVault(VaultName=$KEY_VAULT;SecretName=database-url)"

echo "✅ Web App configured with Key Vault references"

# Restart Web App to apply new settings
echo "\n🔄 Restarting Web App to apply new settings..."
az webapp restart --name "$BACKEND_APP" --resource-group "$RESOURCE_GROUP"
echo "✅ Web App restarted"

# Test the configuration
echo "\n🧪 Testing configuration..."
sleep 30

BACKEND_URL="https://$BACKEND_APP.azurewebsites.net"
echo "Testing backend health: $BACKEND_URL/health"

if curl -f "$BACKEND_URL/health" > /dev/null 2>&1; then
  echo "✅ Backend health check passed"
  
  # Test API endpoints that require OpenAI
  echo "Testing dashboard API: $BACKEND_URL/api/dashboard"
  if curl -f "$BACKEND_URL/api/dashboard" > /dev/null 2>&1; then
    echo "✅ Dashboard API test passed"
  else
    echo "⚠️ Dashboard API test failed - check logs for details"
  fi
else
  echo "❌ Backend health check failed"
  echo "Please check the Web App logs for details:"
  echo "az webapp log tail --name $BACKEND_APP --resource-group $RESOURCE_GROUP"
fi

# Create a test script for validating the setup
cat > test-setup.sh << 'EOF'
#!/bin/bash
echo "🧪 PersonalizeAI Setup Validation"

# Load configuration
BACKEND_APP=$(jq -r '.backend_app' deployment-info.json)
FRONTEND_URL=$(jq -r '.frontend_url' deployment-info.json)
BACKEND_URL="https://$BACKEND_APP.azurewebsites.net"

echo "Testing endpoints..."

# Test backend health
echo -n "Backend health: "
if curl -s "$BACKEND_URL/health" | jq -r '.status' | grep -q "healthy"; then
  echo "✅ PASS"
else
  echo "❌ FAIL"
fi

# Test dashboard API
echo -n "Dashboard API: "
if curl -s "$BACKEND_URL/api/dashboard" | jq -r '.status' | grep -q "success"; then
  echo "✅ PASS"
else
  echo "❌ FAIL"
fi

# Test frontend
echo -n "Frontend: "
if curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" | grep -q "200"; then
  echo "✅ PASS"
else
  echo "❌ FAIL"
fi

echo ""
echo "🌐 URLs:"
echo "Frontend: $FRONTEND_URL"
echo "Backend: $BACKEND_URL"
echo "API Docs: $BACKEND_URL/api"
EOF

chmod +x test-setup.sh

echo "\n🎉 Secrets setup completed successfully!"
echo ""
echo "📋 Configuration Summary:"
echo "✅ OpenAI API Key stored in Key Vault"
echo "✅ Database credentials secured"
echo "✅ Web App configured with Key Vault references"
echo "✅ Managed identity enabled and configured"
echo ""
echo "🧪 Run './test-setup.sh' to validate the complete setup"
echo ""
echo "🚀 Your PersonalizeAI platform is now fully configured and ready for production!"
echo ""
echo "📊 Access your dashboard at:"
jq -r '.frontend_url' deployment-info.json
echo ""
echo "🔗 API endpoints:"
echo "Health: $BACKEND_URL/health"
echo "Dashboard: $BACKEND_URL/api/dashboard"
echo "Subscribers: $BACKEND_URL/api/subscribers"

