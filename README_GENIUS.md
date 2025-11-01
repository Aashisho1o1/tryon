# 🎯 Jewelry AR Try-On - AI Genius MVP

**Branch: `main-Genius`**

A lean, fast prototype using AI image generation for jewelry try-on. Ship fast, learn fast! 🚀

## 💡 The Genius Approach

Instead of complex real-time AR with MediaPipe face tracking, we use:
- **User uploads photo** (hand/face)
- **Selects jewelry from catalog**
- **AI generates realistic try-on image** (FLUX model via Fal.ai/Replicate)
- **Result in 3-5 seconds** ✨

**Why this is brilliant:**
- ✅ Better quality than real-time AR
- ✅ No complex face/hand tracking needed
- ✅ Works perfectly on any device
- ✅ Users can save & share results
- ✅ Much simpler to build and maintain

## 🏗️ Architecture

```
Frontend (React + Vite)          Backend (FastAPI)
┌─────────────────────┐         ┌──────────────────────┐
│  PhotoCapture       │         │  AI Provider         │
│  ↓                  │         │  Abstraction         │
│  JewelrySelector    │────────→│  ┌────────────────┐  │
│  ↓                  │  API    │  │ Fal Provider   │  │
│  ResultDisplay      │←────────│  │ Replicate      │  │
└─────────────────────┘         │  └────────────────┘  │
                                 │  MongoDB (catalog)   │
                                 └──────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB (local or Atlas)
- API Key from [Fal.ai](https://fal.ai) or [Replicate](https://replicate.com)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add:
#   - MongoDB URL
#   - FAL_API_KEY or REPLICATE_API_TOKEN
#   - AI_PROVIDER=fal (or replicate)

# Run backend
python main.py
# → http://localhost:8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run frontend
npm run dev
# → http://localhost:5173
```

### Add Sample Jewelry

```bash
# POST to http://localhost:8000/api/v1/jewelry
curl -X POST http://localhost:8000/api/v1/jewelry \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Golden Ring",
    "type": "ring",
    "description": "Beautiful 14K gold ring",
    "price": {
      "amount": 15000,
      "currency": "NPR"
    },
    "metadata": {
      "metal": "gold",
      "style": "elegant"
    }
  }'
```

Or use the FastAPI docs: http://localhost:8000/docs

## 📁 Project Structure

```
jewelry-ar-tryon/
├── backend/
│   ├── lib/
│   │   └── ai_providers/
│   │       ├── base.py              # AI provider interface
│   │       ├── fal_provider.py      # Fal.ai implementation
│   │       └── replicate_provider.py
│   ├── main.py                      # FastAPI app + /tryon endpoint
│   ├── config.py                    # Settings (AI provider config)
│   └── requirements.txt
│
└── frontend/
    └── src/
        ├── components/
        │   ├── PhotoCapture.jsx     # Camera/upload component
        │   ├── JewelrySelector.jsx  # Catalog grid
        │   └── ResultDisplay.jsx    # Result + share buttons
        ├── pages/
        │   └── TryOnPage.jsx        # Main page (3-step flow)
        └── App.tsx
```

## 🎨 User Flow

1. **📸 Take/Upload Photo**
   - Use webcam or upload image
   - Shows hand/face/where jewelry goes

2. **💎 Select Jewelry**
   - Browse catalog (filtered by type)
   - Click to try on

3. **✨ AI Processing**
   - 3-5 second wait
   - AI places jewelry realistically

4. **🎉 Result**
   - Download image
   - Share to TikTok/Instagram/WhatsApp
   - Try another or take new photo

## 🔌 API Endpoints

### Jewelry Management
- `GET /api/v1/jewelry` - List all jewelry (with filters)
- `GET /api/v1/jewelry/{id}` - Get single item
- `POST /api/v1/jewelry` - Create jewelry
- `PUT /api/v1/jewelry/{id}` - Update jewelry
- `DELETE /api/v1/jewelry/{id}` - Soft delete

### AI Try-On
- `POST /api/v1/tryon` - Generate try-on image
  ```json
  {
    "user_photo": "base64_or_url",
    "jewelry_id": "abc123",
    "options": {
      "strength": 0.75,
      "steps": 28,
      "guidance": 3.5
    }
  }
  ```

### Analytics
- `POST /api/v1/analytics` - Track events
- `GET /api/v1/analytics/{item_id}` - Item analytics
- `GET /api/v1/analytics` - Overall stats

## 💰 Cost per Image

- **Fal.ai FLUX Pro**: ~$0.055/image
- **Replicate FLUX Pro**: ~$0.055/image
- **Fal.ai FLUX Dev**: ~$0.025/image (faster, lower quality)

For 100 users/day = $5.50/day = $165/month

**Tip:** Start with Fal.ai (faster), switch to Replicate if needed.

## 🔄 Switching AI Providers

**Method 1: Environment variable**
```bash
# Use Fal.ai
AI_PROVIDER=fal python main.py

# Use Replicate
AI_PROVIDER=replicate python main.py
```

**Method 2: Edit .env**
```
AI_PROVIDER=fal
FAL_API_KEY=your_key_here
```

**Zero code changes needed!** The abstraction layer handles everything.

## 📊 Testing the Flow

1. **Start backend:** `python backend/main.py`
2. **Start frontend:** `npm run dev` in frontend/
3. **Add test jewelry** via http://localhost:8000/docs
4. **Open** http://localhost:5173
5. **Upload photo** of your hand
6. **Select jewelry** → Wait 3-5s → See result!

## 🐛 Troubleshooting

**Backend won't start:**
- Check MongoDB is running
- Verify Python packages installed
- Check .env file exists with API keys

**Frontend API errors:**
- Backend must be running on port 8000
- Check CORS settings in backend/config.py
- Verify API_BASE in components

**AI processing fails:**
- Verify API key is correct in .env
- Check API key has credits
- Try switching provider (fal ↔ replicate)

**No jewelry showing:**
- Add jewelry via POST /api/v1/jewelry
- Check MongoDB connection
- Verify jewelry status="active"

## 🎯 Next Steps

### Phase 1 Improvements (1-2 days)
- [ ] Better error handling
- [ ] Loading states polish
- [ ] Mobile responsive fixes
- [ ] Image compression before upload

### Phase 2 Features (1 week)
- [ ] User authentication
- [ ] Save try-on history
- [ ] Share links with preview
- [ ] Analytics dashboard

### Phase 3 Scale (2 weeks)
- [ ] Cloudinary for image storage
- [ ] Rate limiting
- [ ] Payment integration (eSewa)
- [ ] Admin panel

## 💡 Why This Beats Real-Time AR

| Feature | Real-Time AR | AI Generation (This) |
|---------|--------------|---------------------|
| **Quality** | Medium (jittery) | High (realistic) |
| **Speed** | 30fps but laggy | 3-5s once |
| **Works on** | High-end phones | Any device |
| **Complexity** | Very high | Low |
| **Maintenance** | Hard | Easy |
| **Result** | Can't save | Downloadable |
| **Sharing** | Screenshot | Direct share |

## 🚀 Deployment Ready

This MVP is production-ready for:
- Railway/Render (backend)
- Vercel/Netlify (frontend)
- MongoDB Atlas (database)

Total hosting cost: ~$5-20/month initially.

## 📝 License

MIT - Built for learning and shipping fast! 🎉

---

**Built with ❤️ in Nepal**

*Ship fast. Learn fast. Iterate fast.* 🚀
