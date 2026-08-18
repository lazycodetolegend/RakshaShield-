# RakshaShield 🛡️

**Check before you trust.** A web app that lets Indian students and families paste a job/internship offer, a message, a link, or a UPI ID and instantly get a scam-risk score with clear reasoning — before they trust it or pay.

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │────▶│  ML Service  │
│ React + Vite │     │ Node/Express │     │   FastAPI    │
│   (Vercel)   │     │  (Render)    │     │  (Render)    │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                     ┌──────▼───────┐
                     │ MongoDB Atlas│
                     └──────────────┘
```

## Features

1. **Message Scam Checker** — Paste text → get risk score + red flags
2. **Link/Domain Checker** — Paste URL → check domain age + typosquatting
3. **UPI ID Checker** — Enter UPI ID → look up community reports
4. **Screenshot Upload** — Upload image → OCR extracts text → scam check
5. **Community Reporting** — Flag scam UPI IDs, domains, phone numbers

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- MongoDB Atlas account (free tier)

### 1. Python ML Service
```bash
cd ml-service
pip install -r requirements.txt
uvicorn main:app --port 8000
```

### 2. Node Backend
```bash
cd backend
npm install
# Edit .env with your MongoDB URI
node server.js
```

### 3. React Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Environment Variables

### backend/.env
```
MONGODB_URI=mongodb+srv://...
PORT=5000
ML_SERVICE_URL=http://localhost:8000
```

### frontend/.env
```
VITE_API_BASE_URL=http://localhost:5000/api
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS v4 |
| Backend | Node.js, Express, Mongoose |
| ML Service | Python, FastAPI |
| Database | MongoDB Atlas |
| OCR | tesseract.js |
| WHOIS | whoiser |

## Disclaimer

This is a risk indicator based on known scam patterns, not a certified fraud verification. Always verify independently before making a decision.
