# ⚡ Quick Start Guide - Jewelry AR Try-On

Get your prototype running in **15 minutes**!

---

## Step 1: Install MongoDB (5 minutes)

### Option A: MongoDB Atlas (Cloud - Recommended for beginners)

1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free"
3. Create account with email
4. Choose FREE tier (M0 Sandbox)
5. Select cloud provider (AWS recommended)
6. Choose region closest to you
7. Click "Create Cluster" (takes 3-5 minutes)
8. While waiting, click "Database Access" → "Add New Database User"
   - Username: `admin`
   - Password: (auto-generate and save it!)
9. Click "Network Access" → "Add IP Address" → "Allow Access from Anywhere" (for testing only!)
10. Once cluster is ready, click "Connect" → "Connect your application"
11. Copy the connection string, it looks like:
    ```
    mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
    ```
12. **Save this connection string!** You'll need it in Step 3.

### Option B: Local MongoDB (For developers)

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu/Debian:**
```bash
sudo apt install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

**Windows:**
Download from https://www.mongodb.com/try/download/community and follow installer.

Your local connection string: `mongodb://localhost:27017`

---

## Step 2: Start the Backend (3 minutes)

```bash
# Navigate to backend folder
cd jewelry-ar-tryon/backend

# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies (this takes 2-3 minutes)
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Open .env in your text editor
# Replace MONGODB_URL with your connection string from Step 1
# Save the file

# Start the server
python main.py
```

You should see:
```
INFO:     Connected to MongoDB: jewelry_ar_db
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Leave this terminal open!**

Test it: Open http://localhost:8000/docs in your browser. You should see the API documentation.

---

## Step 3: Start the Frontend (5 minutes)

Open a **NEW terminal window**:

```bash
# Navigate to frontend folder
cd jewelry-ar-tryon/frontend

# Install dependencies (this takes 3-4 minutes)
npm install

# Copy environment template
cp .env.example .env

# Start development server
npm run dev
```

You should see:
```
VITE v7.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

Open http://localhost:5173 in your browser!

---

## Step 4: Create Your First Jewelry Item (2 minutes)

### Option A: Using API Docs (Easiest)

1. Go to http://localhost:8000/docs
2. Find `POST /api/v1/jewelry`
3. Click "Try it out"
4. Replace the JSON with:

```json
{
  "name": "Gold Hoop Earrings",
  "type": "earrings",
  "description": "Beautiful 24K gold-plated hoop earrings perfect for weddings",
  "price": {
    "amount": 5000,
    "currency": "NPR",
    "discount": 10
  },
  "metadata": {
    "material": "gold",
    "weight": "5g",
    "tags": ["gold", "hoops", "wedding", "festive"]
  },
  "ar_config": {
    "color": "#FFD700",
    "size": 30
  },
  "stock": {
    "available": true,
    "quantity": 10
  }
}
```

5. Click "Execute"
6. You should see a 201 success response with your item!

### Option B: Using Terminal (For developers)

```bash
curl -X POST "http://localhost:8000/api/v1/jewelry" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gold Hoop Earrings",
    "type": "earrings",
    "description": "Beautiful 24K gold-plated hoop earrings",
    "price": {"amount": 5000, "currency": "NPR"},
    "metadata": {"material": "gold", "tags": ["gold", "hoops"]},
    "ar_config": {"color": "#FFD700", "size": 30}
  }'
```

---

## Step 5: View Your Jewelry (1 minute)

### Check if it's saved:

**Browser:**
Go to http://localhost:8000/api/v1/jewelry

**Terminal:**
```bash
curl http://localhost:8000/api/v1/jewelry
```

You should see your jewelry item in the response!

---

## ✅ Success! What You've Done:

- ✅ MongoDB running (cloud or local)
- ✅ Backend API running on port 8000
- ✅ Frontend running on port 5173
- ✅ Created your first jewelry item
- ✅ Verified it's saved in database

---

## 🎯 Next Steps

### Immediate (Do Now):

1. **Add More Jewelry Items**
   - Create 5-10 test items via API docs
   - Try different types: earrings, necklaces
   - Vary the colors and sizes

2. **Test the API**
   - Get all jewelry: `GET /api/v1/jewelry`
   - Get single item: `GET /api/v1/jewelry/{item_id}`
   - Track analytics: `POST /api/v1/analytics`

### Soon (Next Few Days):

3. **Complete the Frontend**
   - Build the camera component with MediaPipe
   - Create jewelry gallery UI
   - Add admin panel for management

4. **Add Real Jewelry**
   - Photograph your actual jewelry
   - Upload real images
   - Test AR try-on with real items

5. **Prepare for Launch**
   - Create TikTok content
   - Test on mobile devices
   - Share with friends for feedback

---

## 🐛 Troubleshooting

### Backend won't start

**Error:** `ModuleNotFoundError: No module named 'fastapi'`

**Fix:**
```bash
# Make sure virtual environment is activated
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Reinstall dependencies
pip install -r requirements.txt
```

---

### MongoDB connection error

**Error:** `pymongo.errors.ServerSelectionTimeoutError`

**Fix for MongoDB Atlas:**
1. Check your IP is whitelisted (0.0.0.0/0 for testing)
2. Verify password in connection string (no special characters need escaping)
3. Make sure cluster is running (not paused)

**Fix for Local MongoDB:**
```bash
# macOS
brew services restart mongodb-community

# Linux
sudo systemctl restart mongodb
```

---

### Frontend won't start

**Error:** `npm ERR! code ENOENT`

**Fix:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

### Port already in use

**Error:** `Address already in use`

**Fix:**
```bash
# Find what's using the port
lsof -i :8000  # for backend
lsof -i :5173  # for frontend

# Kill the process
kill -9 <PID>

# Or use different ports:
# Backend: uvicorn main:app --port 8001
# Frontend: npm run dev -- --port 5174
```

---

## 🎓 Learn the System

### Key URLs to Bookmark:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs (Interactive!)
- **API OpenAPI:** http://localhost:8000/openapi.json
- **Health Check:** http://localhost:8000/health

### Important Files:

```
backend/
  main.py          ← All API endpoints
  models.py        ← Data structures
  database.py      ← MongoDB connection
  config.py        ← Settings
  .env             ← Your secrets (MongoDB URL, etc.)

frontend/
  src/
    components/    ← UI components (to be built)
    utils/api.ts   ← API client (to be built)
    hooks/         ← MediaPipe integration (to be built)
  .env             ← Frontend config
```

### Test Data Structure:

Your jewelry item looks like this in MongoDB:
```javascript
{
  "item_id": "abc12345",
  "name": "Gold Hoop Earrings",
  "type": "earrings",
  "price": {
    "amount": 5000,
    "currency": "NPR"
  },
  "ar_config": {
    "color": "#FFD700",
    "size": 30,
    "landmarks": [234, 454]  // MediaPipe ear positions
  },
  "share_link": {
    "short_code": "abc12345",
    "full_url": "https://yoursite.com/try-on/abc12345"
  },
  "analytics": {
    "views": 0,
    "try_ons": 0,
    "shares": 0
  }
}
```

---

## 📊 Quick Test Checklist

- [ ] Backend starts without errors
- [ ] Frontend shows Vite welcome page
- [ ] API docs load at /docs
- [ ] Can create jewelry item via API
- [ ] Can get all jewelry items
- [ ] MongoDB shows data (check Atlas dashboard or mongo shell)
- [ ] No console errors in browser
- [ ] Health check returns "healthy"

---

## 🚀 Ready to Build!

Your foundation is complete! Now you can:

1. **Build the frontend components** (see PROJECT_SUMMARY.md Phase 1)
2. **Integrate MediaPipe** for AR face tracking
3. **Create the camera UI** for try-on experience
4. **Add real jewelry items** from your business
5. **Launch on TikTok** and start marketing!

---

## 💡 Pro Tips

1. **Keep both terminals open** (one for backend, one for frontend)
2. **Check API docs often** - http://localhost:8000/docs is your friend
3. **Use browser dev tools** - Press F12 to see console logs
4. **Save your MongoDB credentials** - You'll need them often
5. **Commit to git frequently** - Back up your work!

---

## 📞 Need Help?

1. **Check the logs** - Look at terminal output for errors
2. **Read error messages** - They usually tell you what's wrong
3. **Review PROJECT_SUMMARY.md** - Detailed explanations there
4. **Check browser console** - F12 → Console tab
5. **Test API endpoints** - Use /docs to verify backend works

---

## 🎉 Congratulations!

You now have a **working prototype foundation**! The backend API is serving data, MongoDB is storing your jewelry items, and the frontend is ready for development.

**Next:** Follow the Phase 1 checklist in PROJECT_SUMMARY.md to complete the AR try-on features.

**Time invested:** 15 minutes
**Value created:** Fully functional backend + database + frontend scaffolding
**Next milestone:** Working AR try-on in 4-7 days

**Let's build something amazing! 💍✨**

---

*If you completed all steps successfully, you're ready to move on to frontend development!*

*Save this file - you'll reference it often during development.*
