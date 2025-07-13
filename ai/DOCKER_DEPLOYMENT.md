# 🐳 Docker Deployment Guide

## Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed
- Google Gemini API key
- Hugging Face API token

### Environment Setup

1. Create a `.env` file in the project root:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
HF_TOKEN=your_huggingface_token_here
```

### Build and Run

#### Option 1: Using Docker Compose (Recommended)
```bash
# Build and start the application
docker-compose up --build

# Run in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

#### Option 2: Using Docker directly
```bash
# Build the image
docker build -t walmart-sustainable-platform .

# Run the container
docker run -d \
  --name walmart-app \
  -p 5000:5000 \
  -e GEMINI_API_KEY=your_key_here \
  -e HF_TOKEN=your_token_here \
  -v $(pwd)/static:/app/static \
  walmart-sustainable-platform

# View logs
docker logs -f walmart-app

# Stop the container
docker stop walmart-app
docker rm walmart-app
```

### API Endpoints

- **Health Check**: `GET http://localhost:5000/health`
- **Create Product**: `POST http://localhost:5000/create-product`
- **Static Images**: `GET http://localhost:5000/static/<filename>`

### Example API Usage

```bash
curl -X POST http://localhost:5000/create-product \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Sustainable organic cotton t-shirt",
    "material": "Organic Cotton",
    "region": "Ahmedabad",
    "quantity": 1.0
  }'
```

### Production Deployment

For production deployment on cloud platforms:

#### Docker Hub Deployment
```bash
# Tag for Docker Hub
docker tag walmart-sustainable-platform your-username/walmart-platform:latest

# Push to Docker Hub
docker push your-username/walmart-platform:latest
```

#### Cloud Platform Deployment
- **AWS ECS/Fargate**: Use the provided Dockerfile
- **Google Cloud Run**: Compatible with the current setup
- **Azure Container Instances**: Deploy directly from Docker Hub
- **Kubernetes**: Use the Docker image with appropriate ConfigMaps and Secrets

### Monitoring and Scaling

The application includes:
- Health check endpoint at `/health`
- Gunicorn with 4 workers for handling concurrent requests
- 120-second timeout for long-running AI operations
- Automatic restart policy in docker-compose

### Troubleshooting

1. **Port conflicts**: Change `5000:5000` to `8080:5000` in docker-compose.yml
2. **Memory issues**: Add memory limits in docker-compose.yml:
   ```yaml
   deploy:
     resources:
       limits:
         memory: 2G
   ```
3. **API key issues**: Ensure environment variables are properly set
4. **Static files**: Check volume mounting for persistent image storage

### Security Notes

- API keys are passed as environment variables (not in the image)
- Static directory is mounted as a volume for persistence
- Health checks ensure container reliability
- Use HTTPS in production with a reverse proxy (nginx/traefik)
