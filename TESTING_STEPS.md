# 🧪 Testing Steps - Get It Running Now!

## ✅ Configuration Complete!

Your API key is set up:
- **Provider:** Replicate
- **API Token:** `r8_7qAkqHOZTp0cv54yWfjejocNfT0otZE0Jr5gu`
- **Location:** `backend/.env` (line 30)

---

## 🚀 Step-by-Step Testing Guide

### **Step 1: Start MongoDB**

**Option A: If you have MongoDB installed locally**
```bash
# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Check if running
pgrep -x mongod
```

**Option B: Use MongoDB Atlas (Cloud - Recommended if local fails)**
1. Go to: https://cloud.mongodb.com
2. Sign up (free)
3. Create **Free M0 Cluster**
4. Get connection string
5. Update `backend/.env`:
   ```bash
   MONGODB_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/jewelry_ar_db?retryWrites=true&w=majority
   ```

**Option C: Use Docker (if you have Docker)**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

---

### **Step 2: Install Backend Dependencies**

```bash
# Navigate to backend
cd backend

# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies (takes ~30 seconds)
pip install -r requirements.txt
```

**Expected output:**
```
Successfully installed fastapi-0.109.0 uvicorn-0.27.0 motor-3.3.2 ...
```

---

### **Step 3: Start Backend Server**

```bash
# Make sure you're in backend/ and venv is activated
python main.py
```

**You should see:**
```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

**✅ Test it:** Open http://localhost:8000/health in browser

**Expected response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-11-01T...",
  "environment": "development"
}
```

---

### **Step 4: Add Sample Jewelry**

**Open in browser:** http://localhost:8000/docs

This opens FastAPI's interactive docs (Swagger UI).

**Find:** `POST /api/v1/jewelry`

**Click:** "Try it out"

**Paste this JSON:**
```json
{
  "name": "Golden Diamond Ring",
  "type": "ring",
  "description": "Elegant 14K gold ring with brilliant diamond",
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

**Click:** "Execute"

**Expected response (200):**
```json
{
  "success": true,
  "message": "Jewelry item created successfully",
  "item": {
    "item_id": "abc12345",
    "name": "Golden Diamond Ring",
    ...
  }
}
```

**Add 3-5 more items:**

**Ring 2:**
```json
{
  "name": "Silver Band",
  "type": "ring",
  "description": "Classic silver wedding band",
  "price": {"amount": 8000, "currency": "NPR"},
  "metadata": {"metal": "silver", "style": "classic"}
}
```

**Earrings:**
```json
{
  "name": "Pearl Drop Earrings",
  "type": "earrings",
  "description": "Elegant pearl drop earrings",
  "price": {"amount": 15000, "currency": "NPR"},
  "metadata": {"metal": "gold", "stone": "pearl", "style": "elegant"}
}
```

**Necklace:**
```json
{
  "name": "Gold Chain Necklace",
  "type": "necklace",
  "description": "18K gold chain necklace",
  "price": {"amount": 45000, "currency": "NPR"},
  "metadata": {"metal": "gold", "style": "classic"}
}
```

**Bracelet:**
```json
{
  "name": "Gold Bangle",
  "type": "bracelet",
  "description": "Traditional gold bangle",
  "price": {"amount": 35000, "currency": "NPR"},
  "metadata": {"metal": "gold", "style": "traditional"}
}
```

---

### **Step 5: Verify Jewelry Was Added**

**In FastAPI docs:** Find `GET /api/v1/jewelry`

**Click:** "Try it out" → "Execute"

**You should see:**
```json
{
  "success": true,
  "items": [
    {"item_id": "...", "name": "Golden Diamond Ring", ...},
    {"item_id": "...", "name": "Silver Band", ...},
    ...
  ],
  "count": 5,
  "total_count": 5
}
```

✅ **Backend is ready!**

---

### **Step 6: Install Frontend Dependencies**

**Open NEW terminal** (keep backend running)

```bash
# Navigate to frontend
cd frontend

# Install dependencies (takes ~1 minute)
npm install
```

**Expected output:**
```
added 234 packages, and audited 235 packages in 45s
```

---

### **Step 7: Start Frontend**

```bash
# Still in frontend/
npm run dev
```

**You should see:**
```
  VITE v7.1.7  ready in 328 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**✅ Open:** http://localhost:5173

---

### **Step 8: Test the Full Flow! 🎉**

**You should see:**
- Beautiful gradient header "Jewelry AR Try-On"
- Progress steps indicator
- "Take Your Photo" interface

**Test Flow:**

1. **Upload a photo:**
   - Click "Upload Photo"
   - Choose a photo of your hand (or any photo for testing)
   - Click "Use This Photo"

2. **Select jewelry:**
   - You should see 5 jewelry items in a grid
   - Filter by type if you want
   - Click on "Golden Diamond Ring"

3. **Wait for AI magic:**
   - Loading animation appears
   - "Creating Magic..." message
   - Processing takes ~5-10 seconds

4. **See result:**
   - AI-generated image appears
   - Download button
   - Share buttons (TikTok, Instagram, WhatsApp, etc.)

---

## 🐛 Troubleshooting

### **Issue: "MongoDB connection failed"**

**Solution 1:** Start MongoDB
```bash
brew services start mongodb-community
```

**Solution 2:** Use MongoDB Atlas (cloud)
- Get free cluster from https://cloud.mongodb.com
- Update `MONGODB_URL` in `backend/.env`

---

### **Issue: "Module not found" errors**

**Backend:**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```

---

### **Issue: "Network error" when trying AI try-on**

**Checks:**
1. Backend running? → Check http://localhost:8000/health
2. API key correct? → Check `backend/.env` line 30
3. CORS issue? → Check browser console (F12)

**Verify API key:**
```bash
cat backend/.env | grep REPLICATE
# Should show: REPLICATE_API_TOKEN=r8_7qAkqHOZTp0cv54yWfjejocNfT0otZE0Jr5gu
```

---

### **Issue: "AI processing failed"**

**Possible causes:**

1. **API key invalid:**
   - Go to https://replicate.com/account/api-tokens
   - Verify token is active
   - Copy and update in `backend/.env`

2. **No credits:**
   - Check Replicate dashboard for billing
   - Add payment method if needed

3. **Backend error:**
   - Check backend terminal for error messages
   - Look for Python traceback

**Test API key directly:**
```bash
cd backend
source venv/bin/activate
python

# In Python:
import replicate
replicate.api_token = "r8_7qAkqHOZTp0cv54yWfjejocNfT0otZE0Jr5gu"
print("API key configured!")
# If no error, key is valid
```

---

### **Issue: Port already in use**

**Backend (8000):**
```bash
# Find and kill process
lsof -ti:8000 | xargs kill -9

# Or use different port
python main.py --port 8001
```

**Frontend (5173):**
```bash
# Find and kill
lsof -ti:5173 | xargs kill -9

# Or frontend will auto-use 5174
```

---

## 📊 What to Monitor During Testing

### **1. Backend Terminal**

**Good signs:**
```
INFO:     Using AI provider: replicate for jewelry: abc12345
INFO:     Try-on successful. Cost: $0.055
```

**Bad signs:**
```
ERROR:    Error in AI try-on: API key invalid
ERROR:    MongoDB connection failed
```

### **2. Frontend Browser Console (F12)**

**Good signs:**
```
(No errors)
```

**Bad signs:**
```
Failed to fetch
Network error
CORS error
```

### **3. Network Tab (F12 → Network)**

**Watch for:**
- `POST /api/v1/tryon` → Status 200 (good)
- Response time: 3000-10000ms (normal)
- Status 500 → Check backend logs

---

## ✅ Success Checklist

After testing, verify:

- [ ] Backend starts without errors
- [ ] Can access http://localhost:8000/docs
- [ ] MongoDB connected (no errors)
- [ ] Added 5 jewelry items successfully
- [ ] Frontend loads at http://localhost:5173
- [ ] Can upload/capture photo
- [ ] Can see jewelry grid
- [ ] AI try-on completes (even if result isn't perfect)
- [ ] Can download result image
- [ ] Share buttons work

---

## 🎯 Expected Costs During Testing

**First 10 tests:**
- Replicate: ~$0.55 total
- Should complete in minutes

**If testing 50 images:**
- Cost: ~$2.75
- Takes ~5-10 minutes

**Budget for today:** $5-10 for thorough testing

---

## 📸 Test Photos to Use

**Best test photos:**
1. **Clear hand photo** - fingers spread, good lighting
2. **Face photo** - for earrings/necklace
3. **Side profile** - for earrings
4. **Wrist photo** - for bracelets

**Where to find test images:**
- Take with your phone camera
- Search "hand holding" on Unsplash
- Use stock photos temporarily

---

## 🎉 What Success Looks Like

**After completing all steps, you should have:**

1. ✅ Backend running on http://localhost:8000
2. ✅ 5+ jewelry items in database
3. ✅ Frontend running on http://localhost:5173
4. ✅ Successfully generated at least 1 AI try-on image
5. ✅ Able to download and share results

**Example result:**
```
User uploads hand photo
→ Clicks "Golden Diamond Ring"
→ Waits 5 seconds
→ Sees realistic image of ring on their hand
→ Downloads image
→ Success! 🎉
```

---

## 📞 Next Steps After Successful Test

1. **Test with real jewelry photos** (if you have them)
2. **Share with 5-10 friends** for feedback
3. **Track what works** (which jewelry types, which photos)
4. **Deploy to production** (Railway + Vercel)
5. **Start marketing** (TikTok, Instagram)

---

## 🚨 Emergency Contacts

**If completely stuck:**

1. **Check backend logs** - Most errors show here
2. **Check browser console** - Frontend errors here
3. **Read error messages** - They usually tell you what's wrong
4. **Google the error** - Likely someone solved it
5. **Start fresh** - Restart all services

---

**Ready? Let's test it! 🚀**

Run these commands in order:

```bash
# Terminal 1: MongoDB
brew services start mongodb-community

# Terminal 2: Backend
cd backend
source venv/bin/activate
python main.py

# Terminal 3: Frontend
cd frontend
npm run dev
```

Then open http://localhost:5173 and try it! 🎉
