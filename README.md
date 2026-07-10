# Hobby Mastery

A mobile application to help you master any hobby without feeling overwhelmed. Enter a hobby and skill level, and the app generates a curated list of essential techniques with video and article resources.

## Features
- **Curated Learning Paths**: Generates 5-8 essential techniques for your chosen hobby and skill level using Groq (Llama 3).
- **Rich Resources**: Each technique comes with a YouTube video search and a Google article search for learning.
- **Progress Tracking**: Mark techniques as learning, mastered, or skipped. Progress bar dynamically excludes skipped items.
- **Completion Celebration**: Animated banner when you hit 100% mastery.
- **Bottom Sheet Resources**: Tap to view resources in a native slide-up modal.

## Architecture

### Frontend (React Native + Expo)
- **State**: React Context API (`LearningContext.tsx`)
- **Storage**: AsyncStorage with in-memory fallback
- **Styling**: Centralized Theme system (`theme.ts`)

### Backend (Node.js + Express)
- **AI**: Groq API (`llama-3.1-8b-instant`) with multi-model fallback
- **Design**: Controller-Service pattern. API keys stored server-side.

## Setup

### Backend
```bash
cd hobby-mastery-backend
npm install
cp .env.example .env 
npm run dev
```

### Frontend
```bash
cd hobby-mastery-mobile
npm install
npm run android
```

## Design Decisions
- **Bottom Sheet Modal**: Custom Modal instead of a heavy third-party bottom sheet library to keep bundle size small.
- **Graceful Degradation**: If the API is unavailable, the backend returns a mock plan so the app remains functional.
- **Skipped Techniques**: Excluded from the progress denominator to give accurate mastery percentage.