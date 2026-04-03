# MAISON — Virtual Trial Room

## Setup

### 1. Set your Gemini API key
This project now uses Gemini only.

- Set:
  - `GEMINI_API_KEY=YOUR_GOOGLE_API_KEY_FROM_AI_STUDIO`

### 2. Set your API key (Windows)
Open PowerShell or Command Prompt and run:
```
set GEMINI_API_KEY=your_google_ai_studio_key_here
```
Or set it permanently in Windows → System → Environment Variables.

### 3. Install Python dependencies
```
pip install -r requirements.txt
```

### 4. Install frontend dependencies
```
npm install
```

---

## Running the App

You need **two terminals** open at the same time:

**Terminal 1 — Python backend (chatbot):**
```
python server.py
```

**Terminal 2 — React frontend:**
```
npm run dev
```

Then open http://localhost:8080 in your browser.

---

## Quick Start (Windows — double click)
Just double-click `start.bat` — it opens both servers automatically.
*(Make sure GEMINI_API_KEY is set first)*
