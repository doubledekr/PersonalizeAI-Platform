# PersonalizeAI Deployment Guide

## Overview

PersonalizeAI supports multiple deployment options to fit different development and production needs:

- **Azure Cloud** - Production-ready scalable deployment
- **Replit** - Quick development and prototyping
- **Docker** - Local development and containerized deployment
- **GitHub Actions** - Automated CI/CD pipeline

## Prerequisites

### General Requirements
- Git
- Node.js 18+
- Python 3.11+
- OpenAI API Key

### Azure Deployment
- Azure CLI
- Azure subscription
- Docker (for container builds)

### Replit Deployment
- Replit account
- GitHub repository

### Docker Deployment
- Docker & Docker Compose
- PostgreSQL (or use included container)

## Azure Cloud Deployment

### Quick Start (20 minutes)

1. **Clone the repository:**
```bash
git clone https://github.com/your-username/PersonalizeAI-Platform.git
cd PersonalizeAI-Platform/deployment/azure
```

2. **Login to Azure:**
```bash
az login
az account set --subscription "your-subscription-id"
```

3. **Deploy infrastructure:**
```bash
chmod +x *.sh
./deploy-infrastructure.sh
```

4. **Deploy backend:**
```bash
./deploy-backend.sh
```

5. **Deploy frontend:**
```bash
./deploy-frontend.sh
```

6. **Configure secrets:**
```bash
export OPENAI_API_KEY="your-openai-api-key"
./setup-secrets.sh
```

### Azure Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Static Web    │    │    Web App       │    │   PostgreSQL    │
│   App (React)   │◄──►│   (Flask API)    │◄──►│   Database      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Azure CDN     │    │ Container        │    │   Key Vault     │
│                 │    │ Registry         │    │   (Secrets)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Azure Resources Created

- **Resource Group:** `personalizeai-rg`
- **Static Web App:** Frontend dashboard
- **App Service:** Backend API
- **PostgreSQL:** Database
- **Container Registry:** Docker images
- **Key Vault:** Secure secrets storage
- **Application Insights:** Monitoring

### Environment Variables

The following environment variables are configured automatically:

```bash
# Backend (Web App)
DATABASE_URL=postgresql://user:pass@server.postgres.database.azure.com:5432/db
OPENAI_API_KEY=@Microsoft.KeyVault(VaultName=vault;SecretName=openai-api-key)
SECRET_KEY=@Microsoft.KeyVault(VaultName=vault;SecretName=secret-key)
WEBSITES_PORT=8000
FLASK_ENV=production

# Frontend (Static Web App)
VITE_API_URL=https://personalizeai-api.azurewebsites.net
VITE_APP_NAME=PersonalizeAI Platform
VITE_ENVIRONMENT=production
```

## Replit Deployment

### Quick Start (5 minutes)

1. **Import from GitHub:**
   - Go to Replit.com
   - Click "Import from GitHub"
   - Enter: `https://github.com/your-username/PersonalizeAI-Platform`

2. **Configure environment:**
   - Copy `.replit` and `replit.nix` from `deployment/replit/`
   - Set environment variables in Replit Secrets:
     ```
     OPENAI_API_KEY=your-openai-api-key
     DATABASE_URL=sqlite:///personalizeai.db
     SECRET_KEY=your-secret-key
     ```

3. **Run the application:**
   ```bash
   # Backend
   cd backend && python src/main.py
   
   # Frontend (new terminal)
   cd frontend && npm install && npm run dev
   ```

### Replit Configuration

The `.replit` file configures:
- Python 3.11 and Node.js 20
- Port forwarding (8000 for backend, 3000 for frontend)
- Environment variables
- Auto-deployment settings

### Replit Advantages

- **Instant setup** - No local installation required
- **Collaborative development** - Share with team members
- **Built-in hosting** - Automatic public URLs
- **Version control** - Git integration
- **Free tier available** - Great for prototyping

## Docker Deployment

### Quick Start (10 minutes)

1. **Clone and setup:**
```bash
git clone https://github.com/your-username/PersonalizeAI-Platform.git
cd PersonalizeAI-Platform/deployment/docker
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your settings
```

3. **Start services:**
```bash
docker-compose up -d
```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000
   - Database: localhost:5432

### Docker Services

```yaml
services:
  postgres:    # PostgreSQL database
  redis:       # Cache (optional)
  backend:     # Flask API
  frontend:    # React dashboard
  nginx:       # Reverse proxy (optional)
```

### Docker Environment Variables

Create a `.env` file:
```bash
# Database
POSTGRES_DB=personalizeai_db
POSTGRES_USER=personalizeai_admin
POSTGRES_PASSWORD=PersonalizeAI2024!

# API Keys
OPENAI_API_KEY=your-openai-api-key
SECRET_KEY=your-secret-key

# Application
FLASK_ENV=development
VITE_API_URL=http://localhost:8000
```

### Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart a service
docker-compose restart backend

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Access database
docker-compose exec postgres psql -U personalizeai_admin -d personalizeai_db
```

## GitHub Actions CI/CD

### Automated Deployment Pipeline

The repository includes a GitHub Actions workflow that:

1. **Tests** backend and frontend code
2. **Builds** Docker images
3. **Deploys** to Azure automatically
4. **Runs** health checks
5. **Notifies** on success/failure

### Setup GitHub Actions

1. **Add repository secrets:**
   ```
   AZURE_WEBAPP_PUBLISH_PROFILE
   AZURE_STATIC_WEB_APPS_API_TOKEN
   AZURE_RESOURCE_GROUP
   DATABASE_URL
   OPENAI_API_KEY
   SECRET_KEY
   ```

2. **Configure workflow:**
   - Edit `.github/workflows/azure-deploy.yml`
   - Update app names and resource groups
   - Customize deployment steps

3. **Trigger deployment:**
   ```bash
   git push origin main  # Automatic deployment
   # or
   gh workflow run azure-deploy.yml  # Manual trigger
   ```

### Workflow Stages

```mermaid
graph LR
    A[Code Push] --> B[Test Backend]
    A --> C[Test Frontend]
    B --> D[Deploy Backend]
    C --> E[Deploy Frontend]
    D --> F[Health Check]
    E --> F
    F --> G[Notify Success]
    F --> H[Rollback on Failure]
```

## Environment-Specific Configurations

### Development
```bash
# Backend
FLASK_ENV=development
DEBUG=True
DATABASE_URL=sqlite:///dev.db

# Frontend
VITE_API_URL=http://localhost:8000
VITE_ENVIRONMENT=development
```

### Staging
```bash
# Backend
FLASK_ENV=staging
DEBUG=False
DATABASE_URL=postgresql://staging-db-url

# Frontend
VITE_API_URL=https://staging-api.personalizeai.com
VITE_ENVIRONMENT=staging
```

### Production
```bash
# Backend
FLASK_ENV=production
DEBUG=False
DATABASE_URL=@Microsoft.KeyVault(...)

# Frontend
VITE_API_URL=https://api.personalizeai.com
VITE_ENVIRONMENT=production
```

## Monitoring and Logging

### Azure Application Insights

Automatically configured for:
- **Performance monitoring**
- **Error tracking**
- **Custom metrics**
- **User analytics**

### Health Checks

Built-in health check endpoints:
```bash
# Backend health
curl https://your-backend.azurewebsites.net/health

# Database connectivity
curl https://your-backend.azurewebsites.net/health/db

# OpenAI API connectivity
curl https://your-backend.azurewebsites.net/health/openai
```

### Log Access

```bash
# Azure Web App logs
az webapp log tail --name personalizeai-api --resource-group personalizeai-rg

# Docker logs
docker-compose logs -f backend

# Replit logs
# Available in the Replit console
```

## Scaling and Performance

### Azure Scaling

```bash
# Scale up (vertical)
az appservice plan update --name personalizeai-plan --resource-group personalizeai-rg --sku P1V2

# Scale out (horizontal)
az webapp config appsettings set --name personalizeai-api --resource-group personalizeai-rg --settings WEBSITES_CONTAINER_START_TIME_LIMIT=1800
```

### Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX idx_subscribers_email ON subscribers(email);
CREATE INDEX idx_subscribers_status ON subscribers(subscription_status);
CREATE INDEX idx_emails_sent_date ON emails(sent_date);
```

### Caching Strategy

```python
# Redis caching for API responses
from flask_caching import Cache

cache = Cache(app, config={'CACHE_TYPE': 'redis'})

@cache.cached(timeout=300)
def get_dashboard_data():
    # Expensive operation
    return data
```

## Security Best Practices

### Azure Security

- **Key Vault** for secrets management
- **Managed Identity** for service authentication
- **HTTPS** enforced on all endpoints
- **CORS** configured for frontend domain only

### Application Security

```python
# Environment-based security settings
if app.config['FLASK_ENV'] == 'production':
    app.config.update(
        SESSION_COOKIE_SECURE=True,
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE='Lax',
    )
```

### Database Security

```bash
# PostgreSQL security
ALTER USER personalizeai_admin SET default_transaction_isolation TO 'read committed';
GRANT CONNECT ON DATABASE personalizeai_db TO personalizeai_admin;
GRANT USAGE ON SCHEMA public TO personalizeai_admin;
```

## Troubleshooting

### Common Issues

1. **Backend not starting:**
   ```bash
   # Check logs
   az webapp log tail --name personalizeai-api --resource-group personalizeai-rg
   
   # Common fixes
   - Verify DATABASE_URL format
   - Check OPENAI_API_KEY is set
   - Ensure all dependencies installed
   ```

2. **Frontend build failing:**
   ```bash
   # Check Node.js version
   node --version  # Should be 18+
   
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Database connection issues:**
   ```bash
   # Test connection
   psql "postgresql://user:pass@server.postgres.database.azure.com:5432/db"
   
   # Check firewall rules
   az postgres flexible-server firewall-rule list --name server --resource-group rg
   ```

### Performance Issues

1. **Slow API responses:**
   - Enable Redis caching
   - Optimize database queries
   - Use connection pooling

2. **High memory usage:**
   - Implement pagination
   - Use streaming for large datasets
   - Optimize image sizes

### Debugging Tools

```bash
# Azure CLI debugging
az webapp log download --name personalizeai-api --resource-group personalizeai-rg

# Docker debugging
docker-compose exec backend bash
docker-compose exec postgres psql -U personalizeai_admin

# Local debugging
export FLASK_DEBUG=1
python backend/src/main.py
```

## Backup and Recovery

### Database Backups

```bash
# Azure PostgreSQL automatic backups (7-35 days retention)
az postgres flexible-server backup list --name personalizeai-db --resource-group personalizeai-rg

# Manual backup
pg_dump "postgresql://user:pass@server.postgres.database.azure.com:5432/db" > backup.sql
```

### Application Backups

```bash
# Backup application files
az storage blob upload-batch --destination backups --source ./app --account-name storage

# Backup secrets
az keyvault secret backup --vault-name personalizeaikv --name openai-api-key --file backup.blob
```

## Cost Optimization

### Azure Cost Management

- **Use B1 tier** for development ($13/month)
- **Scale down** non-production environments
- **Set spending alerts** in Azure portal
- **Use reserved instances** for production

### Resource Optimization

```bash
# Monitor costs
az consumption usage list --start-date 2024-08-01 --end-date 2024-08-31

# Optimize database
az postgres flexible-server update --name personalizeai-db --resource-group personalizeai-rg --sku-name Standard_B1ms
```

## Support and Maintenance

### Regular Maintenance Tasks

1. **Weekly:**
   - Review application logs
   - Check performance metrics
   - Update dependencies

2. **Monthly:**
   - Database maintenance
   - Security updates
   - Cost review

3. **Quarterly:**
   - Backup testing
   - Disaster recovery testing
   - Performance optimization

### Getting Help

- **Documentation:** https://docs.personalizeai.com
- **GitHub Issues:** https://github.com/your-username/PersonalizeAI-Platform/issues
- **Email Support:** support@personalizeai.com

## Next Steps

After successful deployment:

1. **Configure monitoring** and alerts
2. **Set up backup** procedures
3. **Implement** additional security measures
4. **Scale** based on usage patterns
5. **Optimize** performance based on metrics

