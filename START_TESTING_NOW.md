# ⚡ START TESTING NOW - Quick Path

## ✅ Your API Key is Configured!

- **Provider:** Replicate
- **Token:** `r8_7qAkqHOZTp0cv54yWfjejocNfT0otZE0Jr5gu` ✅
- **Files created:** `backend/.env` and `frontend/.env` ✅

---

## 🚨 MongoDB Quick Setup (Choose ONE)

### **Option A: MongoDB Atlas (Cloud - FASTEST, Recommended)**

**No installation needed! Takes 5 minutes:**

1. **Go to:** https://cloud.mongodb.com
2. **Sign up** (use Google/GitHub login)
3. **Create Free Cluster:**
   - Click "Build a Database"
   - Choose **FREE M0** (512MB, perfect for testing)
   - Provider: AWS
   - Region: Choose closest to you
   - Click "Create"

4. **Setup Access:**
   - Username: `jewelryuser`
   - Password: `JewelryTest2024!` (save this!)
   - Click "Create User"
   - IP Access: Click "Add My Current IP Address"
   - Or for testing: Add `0.0.0.0/0` (allow from anywhere)

5. **Get Connection String:**
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://jewelryuser:<password>@cluster0.xxxxx.mongodb.net/...`

6. **Update backend/.env:**
   ```bash
   # Open backend/.env and replace line 7:
   MONGODB_URL=mongodb+srv://jewelryuser:JewelryTest2024!@cluster0.xxxxx.mongodb.net/jewelry_ar_db?retryWrites=true&w=majority
   ```
   (Replace with YOUR actual connection string and password!)

✅ **Done! Skip to "Start Backend" below**

---

### **Option B: Install MongoDB Locally (Mac)**

```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify it's running
pgrep -x mongod
```

**Then continue to "Start Backend" below**

---

### **Option C: Docker (If you have Docker)**

```bash
# Start MongoDB container
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Verify it's running
docker ps | grep mongodb
```

**Then continue to "Start Backend" below**

---

## 🚀 Start Backend

```bash
# Open Terminal 1
cd ~/Desktop/jewelry-ar-tryon/backend

# Create virtual environment (if not done)
python3 -m venv venv

# Activate it
source venv/bin/activate

# Install dependencies (takes ~30 seconds, only needed once)
pip install -r requirements.txt

# Start the server
python main.py
```

**Expected output:**
```
INFO:     Application started
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**✅ Test:** Open http://localhost:8000/health

**Should show:**
```json
{"status": "healthy", "environment": "development"}
```

---

## 📦 Add Sample Jewelry

**Open:** http://localhost:8000/docs

**Find:** `POST /api/v1/jewelry`

**Paste each one and click Execute:**

**1. Gold Ring:**
```json
{
  "name": "Golden Diamond Ring",
  "type": "ring",
  "description": "Elegant 14K gold ring",
  "price": {"amount": 25000, "currency": "NPR"},
  "metadata": {"metal": "gold", "stone": "diamond", "style": "elegant"}
}
```

**2. Pearl Earrings:**
```json
{
  "name": "Pearl Drop Earrings",
  "type": "earrings",
  "description": "Elegant pearl earrings",
  "price": {"amount": 15000, "currency": "NPR"},
  "metadata": {"metal": "gold", "stone": "pearl", "style": "elegant"}
}
```

**3. Gold Necklace:**
```json
{
  "name": "Gold Chain Necklace",
  "type": "necklace",
  "description": "18K gold chain",
  "price": {"amount": 45000, "currency": "NPR"},
  "metadata": {"metal": "gold", "style": "classic"}
}
```

---

## 🎨 Start Frontend

```bash
# Open NEW Terminal 2 (keep backend running!)
cd ~/Desktop/jewelry-ar-tryon/frontend

# Install dependencies (only needed once, takes ~1 min)
npm install

# Start frontend
npm run dev
```

**Expected output:**
```
➜  Local:   http://localhost:5173/
```

---

## 🧪 TEST IT!

**Open:** http://localhost:5173

**You should see:**
- Beautiful gradient UI
- "Jewelry AR Try-On" header
- 4-step progress indicator

**Try this:**

1. **Take/Upload Photo:**
   - Click "Upload Photo"
   - Choose ANY photo (hand photo is best)
   - Click "Use This Photo"

2. **Select Jewelry:**
   - You'll see your 3 jewelry items
   - Click "Golden Diamond Ring"

3. **Wait 5-10 seconds:**
   - Loading animation shows
   - AI processes the image

4. **See Result:**
   - AI-generated image appears!
   - Try download/share buttons

---

## 🐛 Quick Fixes

**"Module not found" when starting backend:**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

**"Cannot connect to MongoDB":**
- Using Atlas? Check connection string in `backend/.env`
- Using local? Run: `brew services start mongodb-community`
- Using Docker? Run: `docker ps` to verify it's running

**"Network error" in frontend:**
- Check backend is running: http://localhost:8000/health
- Check browser console (F12) for specific error

**"AI processing failed":**
- Verify API token in `backend/.env` line 30
- Check Replicate dashboard for billing/credits
- Look at backend terminal for error message

---

## ✅ Success Looks Like:

```
✅ Backend starts (no errors)
✅ Can access http://localhost:8000/docs
✅ Added 3 jewelry items
✅ Frontend shows at http://localhost:5173
✅ Can upload photo
✅ AI generates try-on image
✅ Can download result
```

---

## 💰 Testing Budget

- 10 tests = **$0.55**
- 50 tests = **$2.75**
- 100 tests = **$5.50**

First few tests to verify it works, then use real photos!

---

## 🚦 START NOW!

**Right now, in order:**

**Terminal 1:**
```bash
cd ~/Desktop/jewelry-ar-tryon/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

**Browser:**
- Go to http://localhost:8000/docs
- Add 3 jewelry items

**Terminal 2:**
```bash
cd ~/Desktop/jewelry-ar-tryon/frontend
npm install
npm run dev
```

**Browser:**
- Go to http://localhost:5173
- Test the flow!

---

**Go! 🚀**
