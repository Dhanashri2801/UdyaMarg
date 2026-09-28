# 🏛️ UdyaMarg — AI-Driven Scheme Matching for Marginalized Entrepreneurs

<div align="center">

![SIH 2026](https://img.shields.io/badge/Smart%20India%20Hackathon-2026-orange?style=for-the-badge)
![Problem ID](https://img.shields.io/badge/Problem%20ID-SIH26092-blue?style=for-the-badge)
![Theme](https://img.shields.io/badge/Theme-Smart%20Automation-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**AI-powered platform connecting marginalized entrepreneurs with eligible government schemes through personalized, multilingual, and voice-based assistance.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Demo](#-demo) • [Setup](#-setup-instructions) • [API](#-api-endpoints) • [Team](#-team)

</div>

---

## 📖 About the Project

India has **65+ central and state government schemes** designed to support marginalized entrepreneurs (SC, ST, OBC, Women, Minorities, PwD, Street Vendors, Artisans). However, most entrepreneurs:

- ❌ Don't know which schemes they are eligible for
- ❌ Cannot understand complex government jargon (English + legal terms)
- ❌ Struggle with low digital literacy
- ❌ Miss benefits due to lack of guidance in regional languages

**UdyamAI solves this** by providing:
- ✅ AI-driven personalized scheme matching
- ✅ Voice-based Q&A in **7 Indian languages**
- ✅ Simple explanations of eligibility, benefits, and application process
- ✅ Real-time document readiness checklist

---

## ✨ Features

### 🎯 AI-Driven Scheme Matching
- Matches user profile with **65+ verified government schemes**
- Hybrid scoring engine: **70% AI reasoning + 30% rule-based criteria**
- Real-time **match percentage** with eligibility status
- Personalized **"Why you match"** and **"Things to note"** reasons

### 🗣️ Voice Assistant
- **Bhashini ASR** (Govt of India) for Speech-to-Text
- **Bhashini TTS** for Text-to-Speech
- **7 Indian Languages** — Hindi, English, Punjabi, Bengali, Tamil, Telugu, Marathi
- Browser **Web Speech API fallback** for maximum compatibility

### 🌐 Multilingual Interface
- Complete UI translation for 7 languages
- Localized scheme descriptions
- Voice input/output in user's preferred language

### 📄 Document Readiness
- Real-time checklist of required documents per scheme
- Shows **X/Y documents ready**
- Flags missing documents that may cause rejection

### 📱 WhatsApp Integration
- Share scheme details via WhatsApp with one click
- Generate unique **pairing codes** for future WhatsApp bot integration

### 💾 Smart Caching
- MD5-based response caching for repeat queries
- In-memory cache with TTL
- Fast re-queries with zero API calls

---

## 🛠️ Tech Stack

<table>
<tr>
<td><b>Layer</b></td>
<td><b>Technologies</b></td>
</tr>
<tr>
<td>🎨 <b>Frontend</b></td>
<td>
<img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" />
<img src="https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?logo=tailwind-css&logoColor=white" />
<img src="https://img.shields.io/badge/Babel-Standalone-F9DC3E?logo=babel&logoColor=black" />
</td>
</tr>
<tr>
<td>⚙️ <b>Backend</b></td>
<td>
<img src="https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white" />
<img src="https://img.shields.io/badge/Flask-3.0-000000?logo=flask&logoColor=white" />
<img src="https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white" />
</td>
</tr>
<tr>
<td>🧠 <b>AI Engine</b></td>
<td>
<img src="https://img.shields.io/badge/Gemini_API-Prototype-4285F4?logo=google&logoColor=white" />
<img src="https://img.shields.io/badge/Rule--Based_Scoring-9_Criteria-FF6B6B" />
</td>
</tr>
<tr>
<td>🎤 <b>Voice</b></td>
<td>
<img src="https://img.shields.io/badge/Bhashini-ASR_+_TTS-FF9933?logo=government&logoColor=white" />
<img src="https://img.shields.io/badge/Web_Speech_API-Browser_TTS-4A90E2" />
</td>
</tr>
<tr>
<td>📦 <b>Data</b></td>
<td>
<img src="https://img.shields.io/badge/JSON-65_Schemes-000000?logo=json&logoColor=white" />
<img src="https://img.shields.io/badge/MD5-Cache-blue" />
</td>
</tr>
</table>

---

## 🎬 Demo

### Homepage
<img width="1440" alt="Homepage" src="https://via.placeholder.com/1440x800/1e293b/ffffff?text=UdyamAI+Homepage">

### Profile Form
<img width="1440" alt="Profile Form" src="https://via.placeholder.com/1440x800/f8fafc/1e293b?text=Profile+Form+with+Document+Checklist">

### Scheme Recommendations
<img width="1440" alt="Recommendations" src="https://via.placeholder.com/1440x800/f1f5f9/1e293b?text=Matched+Schemes+with+Match+%25">

### Voice Assistant
<img width="600" alt="Voice Assistant" src="https://via.placeholder.com/600x800/ffffff/1e293b?text=Voice+Assistant+Modal">

---

## 🚀 Setup Instructions

### Prerequisites

- **Python 3.10+** — [Download](https://www.python.org/downloads/)
- **Modern browser** — Chrome/Edge recommended (for Web Speech API)
- **API Keys** (both free):
  - 🔑 [Gemini API Key](https://aistudio.google.com/apikey) — For AI reasoning
  - 🎤 [Bhashini Credentials](https://bhashini.gov.in/) — For voice (Govt of India)

---

### Step 1: Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/udyam-ai.git
cd udyam-ai
```

---

### Step 2: Setup Environment Variables

Copy the template file and add your API keys:

```bash
cp .env.example .env
```

Edit `.env` file:

```env
# ─── Gemini API (Free tier available) ───
# Get from: https://aistudio.google.com/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# ─── Bhashini API (Govt of India - Free) ───
# Get from: https://bhashini.gov.in/
BHASHINI_USER_ID=your_bhashini_user_id_here
BHASHINI_API_KEY=your_bhashini_api_key_here
BHASHINI_PIPELINE_ID=64392f96daac500b55c543cd
```

> ⚠️ **Important:** Never commit your `.env` file. It is already in `.gitignore`.

---

### Step 3: Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

**`requirements.txt` contents:**
```txt
Flask==3.0.0
Flask-CORS==4.0.0
python-dotenv==1.0.0
requests==2.31.0
google-generativeai==0.3.2
```

---

### Step 4: Run the Application

```bash
python app.py
```

**Expected output:**
```
🔧 Initializing database...
✅ Found schemes.json at: .../data/schemes.json
📊 Loading 65 schemes...
✅ All schemes inserted!
✅ Database initialized with 65 schemes
🚀 Starting Server on http://127.0.0.1:5000
```

---

### Step 5: Open in Browser

Navigate to: **http://127.0.0.1:5000**

---

## 📁 Project Structure

```
scheme_matching_platform/
│
├── backend/
│   ├── app.py                          # Flask entry point
│   ├── database/
│   │   ├── db.py                       # SQLite connection + init
│   │   └── app.db                      # SQLite DB (gitignored)
│   ├── routes/
│   │   └── api.py                      # REST API endpoints
│   ├── services/
│   │   ├── matching_engine.py          # Hybrid AI matching engine
│   │   ├── chat_service.py             # Voice assistant Q&A
│   │   ├── voice_service.py            # Bhashini ASR/TTS
│   │   ├── simple_language_service.py  # Translation service
│   │   └── whatsapp_service.py         # WhatsApp pairing
│   └── requirements.txt
│
├── frontend/
│   ├── index.html                      # Main HTML shell
│   └── app.js                          # React application
│
├── data/
│   └── schemes.json                    # 65 government schemes
│
├── .env                                # Secrets (gitignored)
├── .env.example                        # Template
├── .gitignore
└── README.md
```

---

## 🔌 API Endpoints

### Scheme Matching

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/match` | Match profile with 65 schemes |

**Request:**
```json
{
  "profile": {
    "name": "Sunita Rani",
    "age": 30,
    "category": "ST",
    "annual_income": 180000,
    "state": "Punjab",
    "business_type": "Manufacturing",
    "approx_investment": 200000,
    "support_requirement": "Business loan"
  },
  "checked_docs": { "Aadhaar Card": true, "PAN Card": true }
}
```

**Response:**
```json
{
  "success": true,
  "total_schemes_evaluated": 65,
  "matches": [
    {
      "name": "PMEGP",
      "match_percentage": 92,
      "eligibility_status": "Eligible",
      "matched_reasons": ["✓ Priority category match: ST", "..."],
      "missing_reasons": ["⚠ 8th pass certificate needed"],
      "document_readiness": { "available_count": 2, "total_required": 6 }
    }
  ]
}
```

### Voice Assistant

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | AI-powered Q&A in 7 languages |
| `POST` | `/api/voice/transcribe` | Bhashini ASR (Speech → Text) |
| `POST` | `/api/voice/speak` | Bhashini TTS (Text → Speech) |

### Utility

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/documents/common` | Get top 10 common documents |
| `POST` | `/api/profile` | Save user profile |
| `POST` | `/api/whatsapp/pair` | Generate WhatsApp pairing code |

---

## 🧠 How AI Matching Works

```
┌─────────────────────────────────────────────────┐
│  STEP 1: RULE-BASED SCORING (9 Criteria)        │
│  • Category match      → 18%                    │
│  • Income fit          → 18%                    │
│  • Business type       → 15%                    │
│  • Support type        → 14%                    │
│  • Location            → 10%                    │
│  • Age                 → 10%                    │
│  • Documents ready     →  8%                    │
│  • Business description→  5%                    │
│  • Investment fit      →  2%                    │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│  STEP 2: AI ENHANCEMENT (Gemini API)            │
│  • Analyzes business description                │
│  • Generates contextual reasoning               │
│  • Returns AI score (0-100) + reason            │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│  STEP 3: FINAL BLENDED SCORE                    │
│  Final = (AI Score × 0.7) + (Rule Score × 0.3)  │
└─────────────────────────────────────────────────┘
```

---

## 🌍 Supported Languages

| Language | Code | Voice | UI |
|----------|------|-------|-----|
| हिंदी (Hindi) | `hi` | ✅ | ✅ |
| English | `en` | ✅ | ✅ |
| ਪੰਜਾਬੀ (Punjabi) | `pa` | ✅ | ✅ |
| বাংলা (Bengali) | `bn` | ✅ | ✅ |
| தமிழ் (Tamil) | `ta` | ✅ | ✅ |
| తెలుగు (Telugu) | `te` | ✅ | ✅ |
| मराठी (Marathi) | `mr` | ✅ | ✅ |

---

## 🔒 Security

### Environment Variables

All API keys are stored in `.env` file which is **gitignored**. Never hardcode keys in source code.

### If You Accidentally Commit Keys

1. **Immediately revoke** the leaked keys:
   - [Gemini Console](https://aistudio.google.com/apikey) → Delete old → Generate new
   - [Bhashini Portal](https://bhashini.gov.in/) → Regenerate credentials

2. **Remove from git history:**
   ```bash
   pip install git-filter-repo
   git filter-repo --path .env --invert-paths
   git push origin main --force
   ```

3. **Update your local `.env`** with new keys

---

## 🧪 Testing

### Test Scheme Matching
```bash
curl -X POST http://127.0.0.1:5000/api/match \
  -H "Content-Type: application/json" \
  -d '{"profile":{"category":"SC","annual_income":200000}}'
```

### Test Voice Assistant
```bash
curl -X POST http://127.0.0.1:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query":"Best scheme for me?","language":"hi"}'
```

### Test Bhashini ASR
```bash
curl -X POST http://127.0.0.1:5000/api/voice/transcribe \
  -H "Content-Type: application/json" \
  -d '{"audio":"base64_audio_here","language":"hi"}'
```

---

## 🎯 Roadmap

### ✅ Phase 1: Current Prototype
- Rule-based matching (9 criteria)
- Gemini API for AI reasoning
- Bhashini ASR + TTS
- 65 schemes, 7 languages
- Document readiness checklist

### 🚧 Phase 2: Scale-Up (3 months)
- Random Forest classifier (offline AI)
- ChromaDB for semantic search
- Expand to 500+ schemes
- Mobile app (React Native)

### 🔮 Phase 3: Production (6 months)
- Self-hosted LLM via vLLM
- WhatsApp bot integration
- Block-chain based verification
- Integration with Udyam/JanSamarth portal

---

## 🐛 Known Issues

- **Bhashini ASR** requires API key from Bhashini portal; browser fallback available
- **Web Speech API** works best in Chrome/Edge on `localhost` (needs HTTPS for production)
- **Gemini API** free tier has rate limits; caching reduces API calls by 90%

---

## 🤝 Contributing

This project was built for **Smart India Hackathon 2026**. For improvements:

1. Fork the repo
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

All scheme data is sourced from **official Government of India portals** (.gov.in).

---

## 👥 Team #CodeStorm



---

## 🙏 Acknowledgements

- 🇮🇳 **Ministry of Electronics and Information Technology (MeitY)** — For Bhashini voice platform
- 🏛️ **KVIC, MoMSME, MoFPI, MoTA, MoSJE** — For scheme data
- 🤖 **Google AI Studio** — For Gemini API (prototype)
- 🎓 **Smart India Hackathon 2026** — For the opportunity

---



- **Problem Statement ID:** SIH26092
- **Theme:** Smart Automation
- **Category:** Software
- **Team:** CodeStorm

---

<div align="center">

### 🌟 Star this repo if you found it helpful!

**Built with ❤️ for India's marginalized entrepreneurs**

</div>
