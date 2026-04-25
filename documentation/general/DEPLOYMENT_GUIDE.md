# Docker Deployment Guide for Osdag-Web

This guide provides step-by-step instructions for deploying the React + Django + PostgreSQL application using Docker with separate images for each service.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Project Structure](#project-structure)
4. [Docker Configuration Files](#docker-configuration-files)
5. [Environment Setup](#environment-setup)
6. [Building and Running](#building-and-running)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Overview

This deployment uses three separate Docker containers:
- **PostgreSQL**: Database service using official PostgreSQL image
- **Django Backend**: Python application server with Gunicorn
- **React Frontend**: Built static files served via Nginx

---

## Prerequisites

- Docker Engine 20.10+ installed
- Docker Compose 2.0+ installed
- Git (for cloning repository)
- Basic knowledge of Docker and Linux commands

### Verify Docker Installation

```bash
docker --version
docker-compose --version
```

---

## Project Structure

```
Osdag-web/
├── Dockerfile                    # Django backend Dockerfile
├── docker-compose.yml            # Development compose file
├── docker-compose.prod.yml       # Production compose file
├── requirements.txt             # Python dependencies
├── .env                         # Environment variables (create this)
├── frontend/
│   ├── Dockerfile               # Development frontend Dockerfile
│   ├── Dockerfile.prod          # Production frontend Dockerfile
│   ├── nginx.conf               # Nginx configuration
│   └── package.json
└── osdag_web/
    └── settings.py              # Django settings
```

---

## Docker Configuration Files

### 1. Django Backend Dockerfile

Create or update `Dockerfile` in the project root:

```dockerfile
# Django Backend Dockerfile
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Asia/Kolkata

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    libpq-dev \
    gcc \
    build-essential \
    libgl1-mesa-glx \
    libglu1-mesa \
    freecad \
    texlive-full \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

# Copy project files
COPY . /app/

# Create necessary directories
RUN mkdir -p /app/staticfiles /app/file_storage /app/osifiles

EXPOSE 8000

# Use gunicorn for production
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "120", "osdag_web.wsgi:application"]
```

### 2. Frontend Production Dockerfile

Create `frontend/Dockerfile.prod`:

```dockerfile
# Frontend Production Dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage - serve with nginx
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 3. Nginx Configuration for Frontend

Create `frontend/nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # React app - handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy to Django backend
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }

    # Django admin
    location /admin/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Static files from Django
    location /static/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
    }

    # Media files from Django
    location /media/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
    }

    # OSI files
    location /osifiles/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
    }
}
```

### 4. Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  db:
    image: postgres:14-alpine
    container_name: osdag-postgres
    environment:
      POSTGRES_USER: osdagdeveloper
      POSTGRES_PASSWORD: ${DB_PASSWORD:-changeme}
      POSTGRES_DB: postgres_Intg_osdag
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - osdag-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U osdagdeveloper"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  # Django Backend
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: osdag-backend
    environment:
      - DEBUG=False
      - DATABASE_HOST=db
      - DATABASE_PORT=5432
      - DATABASE_NAME=postgres_Intg_osdag
      - DATABASE_USER=osdagdeveloper
      - DATABASE_PASSWORD=${DB_PASSWORD:-changeme}
      - SECRET_KEY=${SECRET_KEY:-changeme}
      - ALLOWED_HOSTS=${ALLOWED_HOSTS:-localhost,127.0.0.1}
    volumes:
      - ./file_storage:/app/file_storage
      - ./osifiles:/app/osifiles
      - static_volume:/app/staticfiles
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy
    networks:
      - osdag-network
    command: >
      sh -c "python manage.py migrate &&
             python manage.py collectstatic --noinput &&
             gunicorn --bind 0.0.0.0:8000 --workers 3 --timeout 120 osdag_web.wsgi:application"
    restart: unless-stopped

  # React Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    container_name: osdag-frontend
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    networks:
      - osdag-network
    restart: unless-stopped

networks:
  osdag-network:
    driver: bridge

volumes:
  postgres_data:
    driver: local
  static_volume:
    driver: local
```

### 5. Development Docker Compose (Optional)

Update `docker-compose.yml` for development:

```yaml
version: '3.8'

services:
  db:
    image: postgres:14-alpine
    container_name: osdag-postgres-dev
    environment:
      POSTGRES_USER: osdagdeveloper
      POSTGRES_PASSWORD: password
      POSTGRES_DB: postgres_Intg_osdag
    ports:
      - "5432:5432"
    volumes:
      - postgres_data_dev:/var/lib/postgresql/data
    networks:
      - osdag-network-dev

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: osdag-backend-dev
    ports:
      - "8000:8000"
    volumes:
      - .:/app
      - ./file_storage:/app/file_storage
      - ./osifiles:/app/osifiles
    environment:
      - DEBUG=True
      - DATABASE_HOST=db
      - DATABASE_PORT=5432
      - DATABASE_NAME=postgres_Intg_osdag
      - DATABASE_USER=osdagdeveloper
      - DATABASE_PASSWORD=password
    depends_on:
      - db
    networks:
      - osdag-network-dev
    command: python manage.py runserver 0.0.0.0:8000

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: osdag-frontend-dev
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - CHOKIDAR_USEPOLLING=true
    networks:
      - osdag-network-dev
    command: npm run dev

networks:
  osdag-network-dev:
    driver: bridge

volumes:
  postgres_data_dev:
    driver: local
```

---

## Environment Setup

### 1. Create Environment File

Create `.env` file in the project root:

```env
# Database Configuration
DB_PASSWORD=your_secure_password_here

# Django Configuration
SECRET_KEY=your_django_secret_key_here
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com

# Optional: Database settings (if different from defaults)
DATABASE_NAME=postgres_Intg_osdag
DATABASE_USER=osdagdeveloper
DATABASE_HOST=db
DATABASE_PORT=5432
```

### 2. Generate Django Secret Key

Generate a secure secret key:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Add the output to your `.env` file.

### 3. Update Django Settings (if needed)

Ensure `osdag_web/settings.py` can read from environment variables:

```python
import os

# Database configuration from environment
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': os.environ.get('DATABASE_NAME', 'postgres_Intg_osdag'),
        'USER': os.environ.get('DATABASE_USER', 'osdagdeveloper'),
        'PASSWORD': os.environ.get('DATABASE_PASSWORD', 'password'),
        'HOST': os.environ.get('DATABASE_HOST', 'localhost'),
        'PORT': os.environ.get('DATABASE_PORT', '5432'),
    }
}

# Debug mode from environment
DEBUG = os.environ.get('DEBUG', 'False') == 'True'

# Allowed hosts
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# CORS settings
CORS_ALLOWED_ORIGINS = [
    'http://localhost',
    'https://your-domain.com',
]
```

---

## Building and Running

### Development Mode

1. **Start development containers:**

```bash
docker-compose up -d
```

2. **View logs:**

```bash
docker-compose logs -f
```

3. **Stop containers:**

```bash
docker-compose down
```

4. **Rebuild after code changes:**

```bash
docker-compose up -d --build
```

### Production Mode

1. **Build all images:**

```bash
docker-compose -f docker-compose.prod.yml build
```

2. **Start all services:**

```bash
docker-compose -f docker-compose.prod.yml up -d
```

3. **View logs:**

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f db
```

4. **Check service status:**

```bash
docker-compose -f docker-compose.prod.yml ps
```

5. **Stop services:**

```bash
docker-compose -f docker-compose.prod.yml down
```

6. **Stop and remove volumes (⚠️ deletes data!):**

```bash
docker-compose -f docker-compose.prod.yml down -v
```

---

## Production Deployment

### Step-by-Step Production Deployment

1. **Prepare the server:**
   - Ensure Docker and Docker Compose are installed
   - Clone your repository
   - Create `.env` file with production values

2. **Build and start services:**

```bash
# Build images
docker-compose -f docker-compose.prod.yml build --no-cache

# Start services
docker-compose -f docker-compose.prod.yml up -d
```

3. **Create Django superuser:**

```bash
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

4. **Run database migrations (if not done automatically):**

```bash
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate
```

5. **Collect static files (if not done automatically):**

```bash
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
```

6. **Verify services are running:**

```bash
# Check all containers
docker ps

# Test backend
curl http://localhost:8000/api/

# Test frontend
curl http://localhost/
```

### SSL/HTTPS Setup (Optional)

For production, you'll want to add SSL. Update the frontend service in `docker-compose.prod.yml`:

```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile.prod
  container_name: osdag-frontend
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./ssl/certs:/etc/nginx/certs:ro
  depends_on:
    - backend
  networks:
    - osdag-network
  restart: unless-stopped
```

Update `nginx.conf` to include SSL configuration.

### Backup Database

```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec db pg_dump -U osdagdeveloper postgres_Intg_osdag > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker-compose -f docker-compose.prod.yml exec -T db psql -U osdagdeveloper postgres_Intg_osdag < backup_file.sql
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Error

**Problem:** Backend can't connect to database

**Solution:**
- Check database is running: `docker-compose ps`
- Verify environment variables in `.env`
- Check database logs: `docker-compose logs db`
- Ensure `DATABASE_HOST=db` (service name, not localhost)

#### 2. Frontend Can't Reach Backend API

**Problem:** API calls from frontend fail

**Solution:**
- Verify nginx.conf has correct proxy_pass URL
- Check backend service name matches in nginx config
- Ensure both services are on the same network
- Check CORS settings in Django settings.py

#### 3. Static Files Not Loading

**Problem:** CSS/JS files return 404

**Solution:**
- Run collectstatic: `docker-compose exec backend python manage.py collectstatic --noinput`
- Check static volume is mounted correctly
- Verify STATIC_URL and STATIC_ROOT in settings.py

#### 4. Port Already in Use

**Problem:** Error binding to port 80, 8000, or 5432

**Solution:**
- Change ports in docker-compose.yml
- Or stop the service using the port:
  ```bash
  # Find process using port
  sudo lsof -i :80
  # Kill process
  sudo kill -9 <PID>
  ```

#### 5. Build Fails

**Problem:** Docker build errors

**Solution:**
- Clear Docker cache: `docker system prune -a`
- Rebuild without cache: `docker-compose build --no-cache`
- Check Dockerfile syntax
- Verify all required files exist

#### 6. Container Keeps Restarting

**Problem:** Container exits immediately

**Solution:**
- Check logs: `docker-compose logs <service-name>`
- Verify command in Dockerfile is correct
- Check environment variables are set
- Ensure dependencies are installed

### Useful Commands

```bash
# View container logs
docker-compose -f docker-compose.prod.yml logs -f <service-name>

# Execute command in running container
docker-compose -f docker-compose.prod.yml exec backend bash
docker-compose -f docker-compose.prod.yml exec frontend sh

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend

# View resource usage
docker stats

# Clean up unused resources
docker system prune

# Remove all containers and volumes
docker-compose -f docker-compose.prod.yml down -v
```

---

## Maintenance

### Regular Tasks

1. **Update dependencies:**
   ```bash
   # Update Python packages
   docker-compose -f docker-compose.prod.yml exec backend pip list --outdated
   
   # Update Node packages
   docker-compose -f docker-compose.prod.yml exec frontend npm outdated
   ```

2. **Backup database regularly:**
   - Set up cron job for automated backups
   - Store backups in secure location

3. **Monitor logs:**
   - Set up log aggregation (optional)
   - Monitor error rates

4. **Update images:**
   ```bash
   docker-compose -f docker-compose.prod.yml pull
   docker-compose -f docker-compose.prod.yml up -d
   ```

---

## Security Considerations

1. **Never commit `.env` file** - Add to `.gitignore`
2. **Use strong passwords** for database and secret keys
3. **Keep images updated** - Regularly update base images
4. **Limit exposed ports** - Only expose necessary ports
5. **Use secrets management** for production (Docker secrets, AWS Secrets Manager, etc.)
6. **Enable firewall** on the host server
7. **Use HTTPS** in production with valid SSL certificates

---

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

## Support

For issues specific to this deployment:
1. Check logs: `docker-compose logs`
2. Verify environment variables
3. Ensure all services are running: `docker-compose ps`
4. Review this guide's troubleshooting section

---

**Last Updated:** 2024

