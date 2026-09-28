# 🏛️ UdyaMarg

**AI-powered platform for helping marginalized entrepreneurs find suitable government schemes.**

UdyaMarg matches users with relevant government schemes based on their profile and provides simple information about eligibility, benefits, documents, and application steps.

## ✨ Features

* 🎯 Personalized government scheme matching
* 🤖 AI-based scheme recommendations
* 🗣️ Voice assistant
* 🌐 Support for multiple Indian languages
* 📄 Document readiness checklist
* 📱 WhatsApp sharing
* 💬 Simple explanations of schemes
* ⚡ Fast responses using caching

## 🛠️ Tech Stack

**Frontend**

* HTML
* JavaScript
* React
* Tailwind CSS

**Backend**

* Python
* Flask
* SQLite

**AI & APIs**

* Gemini API
* Bhashini ASR & TTS

## 📁 Project Structure

```text
scheme_matching_platform/
│
├── backend/
│   ├── app.py
│   ├── database/
│   ├── routes/
│   └── services/
│
├── frontend/
│   ├── index.html
│   └── js/
│
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

## 🚀 Setup

### 1. Clone the repository

```bash
git clone https://github.com/Dhanashri2801/UdyaMarg.git
cd UdyaMarg
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Add API keys

Create a `.env` file and add your API keys:

```env
GEMINI_API_KEY=your_gemini_api_key
BHASHINI_USER_ID=your_bhashini_user_id
BHASHINI_API_KEY=your_bhashini_api_key
```

**Never upload your `.env` file to GitHub.**

### 4. Run the application

```bash
python backend/app.py
```

Then open:

```text
http://127.0.0.1:5000
```

## 🎯 Problem Statement

**SIH26092 — Smart Automation**

UdyaMarg was developed as a Smart India Hackathon 2026 project to make government schemes easier to discover and understand for marginalized entrepreneurs.

## 👥 Team

**Team CodeStorm**

---

Built with ❤️ for India's marginalized entrepreneurs.
