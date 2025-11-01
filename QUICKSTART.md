# ⚡ Quick Start Guide - Get Running in 5 Minutes

## Step 1: Get API Key (2 minutes)

Choose ONE provider:

### Option A: Fal.ai (Recommended - Faster)
1. Go to https://fal.ai
2. Sign up (free credits available)
3. Get API key from dashboard
4. Copy for next step

### Option B: Replicate
1. Go to https://replicate.com
2. Sign up
3. Get API token
4. Copy for next step

## Step 2: Backend Setup (2 minutes)

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies (takes ~30 seconds)
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env - add your API key:
# For Fal.ai:
AI_PROVIDER=fal
FAL_API_KEY=your_fal_key_here_abc123

# OR for Replicate:
AI_PROVIDER=replicate
REPLICATE_API_TOKEN=your_replicate_token_here

# Start backend
python main.py
```

✅ Backend running at http://localhost:8000

## Step 3: Frontend Setup (1 minute)

```bash
# Open NEW terminal
cd frontend

# Install dependencies (takes ~20 seconds)
npm install

# Start frontend
npm run dev
```

✅ Frontend running at http://localhost:5173

## Step 4: Add Sample Jewelry (30 seconds)

Open http://localhost:8000/docs in browser

Click on `POST /api/v1/jewelry` → Try it out → Paste this:

```json
{
  "name": "Golden Diamond Ring",
  "type": "ring",
  "description": "Elegant 14K gold ring with diamond",
  "price": {
    "amount": 25000,
    "currency": "NPR"
  },
  "metadata": {
    "metal": "gold",
    "stone": "diamond",
    "style": "elegant"
  }
}
```

Click Execute. Repeat for more items (change name & type).

**Quick jewelry ideas:**
- Ring: "Golden Diamond Ring", "Silver Band", "Ruby Ring"
- Earrings: "Pearl Earrings", "Gold Hoops", "Diamond Studs"
- Necklace: "Gold Chain", "Pearl Necklace", "Diamond Pendant"
- Bracelet: "Gold Bangle", "Silver Bracelet", "Charm Bracelet"

## Step 5: Test It! (30 seconds)

1. Open http://localhost:5173
2. Upload a photo of your hand (or use webcam)
3. Click on a jewelry item
4. Wait 3-5 seconds
5. 🎉 See the AI-generated result!

## Troubleshooting

**"Module not found" error:**
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

**Backend won't start:**
```bash
# Check MongoDB is running:
# If using MongoDB locally, start it:
brew services start mongodb-community  # Mac
sudo systemctl start mongod            # Linux

# OR use MongoDB Atlas (cloud - free tier)
# Get connection string from https://cloud.mongodb.com
# Add to .env: MONGODB_URL=your_atlas_connection_string
```

**"Failed to fetch jewelry":**
- Make sure backend is running (http://localhost:8000)
- Add jewelry via FastAPI docs (Step 4)

**AI processing fails:**
- Check API key is correct in backend/.env
- Verify you have credits (check Fal.ai or Replicate dashboard)
- Try the other provider (switch AI_PROVIDER in .env)

**CORS errors:**
- Backend and frontend must both be running
- Check backend/config.py has `http://localhost:5173` in CORS_ORIGINS

## What to Do Next

### Test the full flow:
1. Try different jewelry types (ring, earrings, necklace)
2. Test with different photos (hand, face, etc.)
3. Try the download & share buttons

### Customize:
1. Add your own jewelry items (with real photos if you have them)
2. Adjust AI settings in TryOnPage.jsx (strength, steps, guidance)
3. Customize colors/branding in components

### Deploy (when ready):
- Backend → Railway or Render
- Frontend → Vercel or Netlify
- Database → MongoDB Atlas

## Cost Tracking

Each try-on costs ~$0.055

**Daily estimates:**
- 10 users = $0.55/day = $16/month
- 50 users = $2.75/day = $82/month
- 100 users = $5.50/day = $165/month

Most APIs give free credits to start!

## Need Help?

1. Check README_GENIUS.md for full documentation
2. Check backend logs in terminal
3. Check frontend console (F12 in browser)
4. Try switching AI providers (fal ↔ replicate)

---

**You're ready! Go to http://localhost:5173 and try it! 🚀**
