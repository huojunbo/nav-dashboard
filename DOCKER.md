# Docker Deployment Guide

This guide explains how to build and run the Navigation Dashboard using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose (optional, for easier deployment)

## Quick Start with Docker Compose

The easiest way to run the application:

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

The application will be available at `http://localhost:3001`

## Manual Docker Commands

### Build the Image

```bash
docker build -t nav-dashboard:latest .
```

### Run the Container

```bash
docker run -d \
  --name nav-dashboard \
  -p 3001:3001 \
  -v $(pwd)/server/data:/app/server/data \
  nav-dashboard:latest
```

### Manage the Container

```bash
# View logs
docker logs -f nav-dashboard

# Stop the container
docker stop nav-dashboard

# Start the container
docker start nav-dashboard

# Remove the container
docker rm nav-dashboard
```

## Configuration

### Environment Variables

You can configure the application using environment variables:

- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Node environment (default: production)

Example with custom port:

```bash
docker run -d \
  --name nav-dashboard \
  -p 8080:8080 \
  -e PORT=8080 \
  -v $(pwd)/server/data:/app/server/data \
  nav-dashboard:latest
```

Or with docker-compose, edit `docker-compose.yml`:

```yaml
environment:
  - PORT=8080
ports:
  - "8080:8080"
```

## Data Persistence

The SQLite database is stored in `server/data/` directory. This directory is mounted as a volume to persist data across container restarts.

**Important**: Make sure the `server/data/` directory exists and has proper permissions:

```bash
mkdir -p server/data
chmod 755 server/data
```

## Health Check

The container includes a health check that monitors the API endpoint:

```bash
# Check container health status
docker inspect --format='{{.State.Health.Status}}' nav-dashboard

# Manual health check
curl http://localhost:3001/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-01-22T02:13:36.000Z"}
```

## Troubleshooting

### Container won't start

Check the logs:
```bash
docker logs nav-dashboard
```

### Database permission issues

Ensure the data directory has correct permissions:
```bash
chmod -R 755 server/data
```

### Port already in use

Change the port mapping:
```bash
docker run -d -p 3002:3001 --name nav-dashboard nav-dashboard:latest
```

### Reset the database

Stop the container and remove the database file:
```bash
docker stop nav-dashboard
rm server/data/dashboard.db
docker start nav-dashboard
```

## Production Deployment

For production deployment, consider:

1. **Use a reverse proxy** (nginx, Traefik) for SSL/TLS termination
2. **Set up backups** for the SQLite database
3. **Use Docker secrets** for sensitive configuration
4. **Configure resource limits**:

```yaml
services:
  nav-dashboard:
    # ... other config
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

## Building for Different Architectures

To build for multiple platforms (e.g., ARM for Raspberry Pi):

```bash
docker buildx build --platform linux/amd64,linux/arm64 -t nav-dashboard:latest .
```
