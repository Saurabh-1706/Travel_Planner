# Roamly - AI Travel Planner

Roamly is a modern, AI-powered travel planning application built to simplify how you explore the world. It provides personalized travel itineraries, intelligent place recommendations, and a beautifully designed dark-mode interface to plan your next adventure.

## 🚀 Features

- **Personalized Recommendations**: Uses AI to suggest destinations based on your travel preferences (Beaches, Mountains, Food Tours, etc.).
- **Smart Itineraries**: Generates day-by-day travel plans, including activities, dining, and sightseeing.
- **Multilingual Support**: Built-in internationalization (i18n) for English, Hindi, Spanish, and French.
- **Premium Dark Mode**: Features a stunning "Nocturnal Wanderer" aesthetic with a deep charcoal theme and subtle luminous accents.
- **Secure Authentication**: Integrated with Google OAuth and NextAuth for seamless user login.
- **Interactive Bucket List**: Save and organize your favorite destinations with categorized tags.

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React, Tailwind CSS v4, shadcn/ui, NextAuth, Lucide Icons.
- **Backend**: FastAPI, Python, MongoDB, Redis.
- **Styling**: Tailwind CSS with dynamic CSS variables for theme switching (`next-themes`).

## ⚙️ Local Development

### Prerequisites
- Node.js (v18+)
- Python 3.10+
- MongoDB instance (local or Atlas)
- Redis server

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

## 🎨 Design System
The UI relies on a customized "Midnight Concierge" aesthetic detailed in our `DESIGN.md` spec, emphasizing fluid typography (Playfair Display & DM Sans) and high-contrast pastel accents for readability in low-light environments.
