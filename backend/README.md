# Jewelry AR Try-On - Backend API

FastAPI backend with MongoDB for virtual jewelry try-on application.

## Features

- ✅ RESTful API with FastAPI
- ✅ MongoDB with Motor (async driver)
- ✅ Jewelry item management (CRUD operations)
- ✅ Analytics tracking system
- ✅ Shareable link generation
- ✅ Image upload support
- ✅ CORS enabled for frontend
- ✅ API documentation (Swagger/OpenAPI)

## Prerequisites

- Python 3.9+
- MongoDB (local or MongoDB Atlas)
- pip or poetry

## Quick Start

### 1. Install Dependencies

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your MongoDB connection string
```

**For local MongoDB:**
```env
MONGODB_URL=mongodb://localhost:27017
```

**For MongoDB Atlas (cloud):**
```env
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net
```

### 3. Install and Start MongoDB (if using local)

**macOS (with Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu/Debian:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

**Windows:**
Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)

### 4. Run the Server

```bash
# Development mode (with auto-reload)
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Server will be available at: `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

## API Endpoints

### Jewelry Management

- `GET /api/v1/jewelry` - Get all jewelry items (with pagination)
- `GET /api/v1/jewelry/{item_id}` - Get specific jewelry item
- `POST /api/v1/jewelry` - Create new jewelry item
- `PUT /api/v1/jewelry/{item_id}` - Update jewelry item
- `DELETE /api/v1/jewelry/{item_id}` - Delete jewelry item

### Analytics

- `POST /api/v1/analytics` - Track analytics event
- `GET /api/v1/analytics/{item_id}` - Get item analytics
- `GET /api/v1/analytics` - Get overall analytics summary

### System

- `GET /` - API information
- `GET /health` - Health check

## Example Requests

### Create Jewelry Item

```bash
curl -X POST "http://localhost:8000/api/v1/jewelry" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gold Hoop Earrings",
    "type": "earrings",
    "description": "Beautiful 24K gold-plated hoop earrings",
    "price": {
      "amount": 5000,
      "currency": "NPR"
    },
    "metadata": {
      "material": "gold",
      "weight": "5g",
      "tags": ["gold", "hoops", "wedding"]
    }
  }'
```

### Track Analytics Event

```bash
curl -X POST "http://localhost:8000/api/v1/analytics" \
  -H "Content-Type: application/json" \
  -d '{
    "jewelry_id": "abc123",
    "event_type": "try_on",
    "session_id": "sess_xyz",
    "user_data": {
      "device": "mobile",
      "browser": "Chrome",
      "os": "Android"
    },
    "source": {
      "platform": "tiktok",
      "campaign": "winter_sale_2025"
    }
  }'
```

## Database Schema

### Collections

1. **jewelry_items** - Store jewelry products
2. **analytics_events** - Track user interactions
3. **users** - Admin users (future)
4. **campaigns** - Marketing campaigns (future)

### Indexes

Automatically created on startup:
- `jewelry_items.item_id` (unique)
- `jewelry_items.type`
- `jewelry_items.status`
- `analytics_events.jewelry_id`
- `analytics_events.event_type`

## Configuration

All configuration is done via environment variables in `.env`:

```env
# Application
APP_NAME="Jewelry AR Try-On API"
DEBUG=True
ENVIRONMENT=development

# Database
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=jewelry_ar_db

# CORS (comma-separated URLs)
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Security
SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# File Upload
MAX_UPLOAD_SIZE=10485760  # 10MB
UPLOAD_DIR=./uploads
```

## Testing

### Using Python Requests

```python
import requests

# Create item
response = requests.post(
    "http://localhost:8000/api/v1/jewelry",
    json={
        "name": "Silver Studs",
        "type": "earrings",
        "price": {"amount": 3000, "currency": "NPR"}
    }
)
print(response.json())

# Get all items
response = requests.get("http://localhost:8000/api/v1/jewelry")
print(response.json())
```

### Using Interactive API Docs

Visit `http://localhost:8000/docs` to test all endpoints interactively.

## Deployment

### Railway.app

1. Create account on Railway.app
2. Create new project
3. Add MongoDB plugin
4. Connect GitHub repository
5. Set environment variables
6. Deploy!

### Render.com

1. Create Web Service
2. Connect repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add MongoDB connection string
6. Deploy!

### Docker

```bash
# Build image
docker build -t jewelry-ar-api .

# Run container
docker run -p 8000:8000 \
  -e MONGODB_URL=mongodb://host.docker.internal:27017 \
  jewelry-ar-api
```

## MongoDB Atlas Setup (Free Cloud Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create cluster (Free tier: 512MB)
4. Create database user
5. Whitelist IP (0.0.0.0/0 for development)
6. Get connection string
7. Add to `.env` file

Example connection string:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/jewelry_ar_db?retryWrites=true&w=majority
```

## Troubleshooting

### MongoDB Connection Error

```
pymongo.errors.ServerSelectionTimeoutError: localhost:27017: [Errno 61] Connection refused
```

**Solution:** Make sure MongoDB is running:
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongodb
```

### CORS Error

```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solution:** Add your frontend URL to `CORS_ORIGINS` in `.env`

### Port Already in Use

```
ERROR: [Errno 48] Address already in use
```

**Solution:** Kill process or use different port:
```bash
# Find process
lsof -i :8000

# Kill process
kill -9 <PID>

# Or use different port
uvicorn main:app --port 8001
```

## Performance Tips

1. **Index your queries** - Indexes are created automatically
2. **Use pagination** - Don't fetch all items at once
3. **Cache frequently accessed data** - Use Redis (future)
4. **Optimize images** - Use Cloudinary or similar
5. **Monitor with logs** - Check application logs regularly

## Security Checklist

- [ ] Change SECRET_KEY in production
- [ ] Use strong MongoDB credentials
- [ ] Enable MongoDB authentication
- [ ] Use HTTPS in production
- [ ] Restrict CORS origins
- [ ] Implement rate limiting
- [ ] Add API authentication (JWT)
- [ ] Validate all inputs
- [ ] Sanitize user data

## Next Steps

1. Add image upload to Cloudinary
2. Implement JWT authentication
3. Add rate limiting
4. Set up Redis caching
5. Add WebSocket support for real-time updates
6. Implement payment integration
7. Add email notifications

## Support

For issues or questions:
- Check API docs: `http://localhost:8000/docs`
- Review logs in terminal
- Check MongoDB connection
- Verify environment variables

## License

MIT License - Use freely for your jewelry business!
