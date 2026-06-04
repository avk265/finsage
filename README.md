# FinSage - Smart Financial Assistant

A comprehensive personal financial management application that uses AI to help users track expenses, create budgets, set financial goals, and connect with peers who share similar financial lifestyles.

## Features

- **User Authentication**: Secure registration and login with password hashing
- **Financial Tracking**: Record monthly income and expenses across multiple categories
- **AI-Powered Expense Categorization**: Automatically categorize expenses using LLM
- **Lifestyle-Based Budgeting**: Get personalized budget recommendations based on lifestyle preferences
- **Financial Goals**: Set and track financial goals with contribution tracking
- **Investment Advice**: AI-generated investment recommendations based on your financial profile
- **Peer Comparison**: Find and connect with users who have similar financial lifestyles
- **Financial Chatbot**: Get personalized financial advice via AI chatbot with RAG (Retrieval-Augmented Generation)
- **Friend Network**: Build a network of financially-minded peers and share insights

## Tech Stack

**Frontend:**
- React 19
- Vite (Build tool)
- Tailwind CSS (Styling)
- Framer Motion (Animations)
- React Markdown

**Backend:**
- Node.js + Express
- MongoDB + Mongoose (Database)
- OpenAI SDK (API compatibility)
- Ollama (Local LLM support)

**AI/ML:**
- Ollama (Local LLM inference)
- Google Generative AI
- Optional: Tavily API (Web search), SerpAPI (Web search)

---

## Prerequisites

Before setting up FinSage, ensure you have the following installed:

1. **Node.js** (v16+): [Download](https://nodejs.org/)
2. **MongoDB**: [Download](https://www.mongodb.com/try/download/community) or use MongoDB Atlas cloud
3. **Ollama** (for local LLM): [Download](https://ollama.ai/)
4. **Git**: [Download](https://git-scm.com/)

---

## Installation & Setup Guide

### Step 1: Clone the Repository

```bash
git clone https://github.com/avk265/finsage.git
cd finsage
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages from `package.json`:
- Backend: express, mongoose, bcrypt, openai, cors, dotenv
- Frontend: react, vite, tailwindcss, framer-motion, lucide-react
- Dev Tools: eslint, postcss, autoprefixer

### Step 3: Set Up Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# ==================== LLM CONFIGURATION ====================
# Choose which LLM provider to use: "ollama" (default)
LLM_PROVIDER=ollama

# Ollama Configuration (running locally)
OLLAMA_BASE_URL=http://localhost:8000/v1
OLLAMA_MODEL=meta-llama/Llama-3.1-8B-Instruct
OLLAMA_API_KEY=not-needed

# ==================== DATABASE ====================
# MongoDB Connection URI
# For local MongoDB: mongodb://localhost:27017/finsage
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/finsage
MONGO_URI=mongodb://localhost:27017/finsage

# ==================== RAG (Retrieval-Augmented Generation) ====================
# Choose RAG search provider: "none", "tavily", or "serpapi"
RAG_SEARCH_PROVIDER=none

# Tavily API Key (optional, for web search in advice)
# Get from: https://tavily.com
TAVILY_API_KEY=your_tavily_api_key_here

# SerpAPI Key (optional, alternative to Tavily)
# Get from: https://serpapi.com
SERPAPI_API_KEY=your_serpapi_api_key_here

# ==================== GOOGLE GENAI (Optional) ====================
# Google Generative AI API Key (if using Google models)
# Get from: https://ai.google.dev/
GOOGLE_GENAI_API_KEY=your_google_genai_api_key_here
```

---

## Downloading & Setting Up Required SDKs

### 1. **Ollama (Local LLM)**

Ollama allows you to run large language models locally without needing expensive API calls.

**Installation:**
- Visit [https://ollama.ai/](https://ollama.ai/)
- Download for your OS (Windows, macOS, Linux)
- Install and run

**Download a Model:**

After installing Ollama, download the model specified in your `.env`:

```bash
# Download Llama 3.1 8B (recommended for FinSage)
ollama pull meta-llama/Llama-3.1-8B-Instruct

# Or download Mistral (smaller, faster)
ollama pull mistral

# Or use any other available model
ollama pull <model-name>
```

**Verify Ollama is Running:**

```bash
# Ollama runs on port 8000 by default
curl http://localhost:8000/v1/models

# You should see a response with available models
```

### 2. **MongoDB**

**Option A: Local MongoDB**

```bash
# macOS (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify connection
mongo  # Should connect to MongoDB shell
```

**Option B: MongoDB Atlas (Cloud)**

1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a cluster
4. Get connection string
5. Update `.env` with your Atlas connection string:
   ```bash
   MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/finsage
   ```

### 3. **Google Generative AI (Optional)**

If you want to use Google's Gemini models:

1. Visit [https://ai.google.dev/](https://ai.google.dev/)
2. Get your API key
3. Add to `.env`:
   ```bash
   GOOGLE_GENAI_API_KEY=your_key_here
   ```

### 4. **Web Search APIs (Optional)**

For RAG search functionality:

**Tavily API:**
- Visit [https://tavily.com/](https://tavily.com/)
- Sign up and get API key
- Add to `.env`: `TAVILY_API_KEY=your_key`

**SerpAPI:**
- Visit [https://serpapi.com/](https://serpapi.com/)
- Sign up and get API key
- Add to `.env`: `SERPAPI_API_KEY=your_key`

---

## Running the Application

### Prerequisites Check:

Before running, ensure these services are running:

```bash
# Check if MongoDB is running
mongo --version

# Check if Ollama is running (should respond to port 8000)
curl http://localhost:8000/v1/models

# Check Node.js
node --version
npm --version
```

### Start Backend Server

```bash
# Terminal 1: Start the backend server on port 3000
npm run server
```

You should see:
```
Server URL: http://localhost:3000
Connected to database successfully
AI provider: ollama
OLLAMA endpoint: http://localhost:8000/v1 model: meta-llama/Llama-3.1-8B-Instruct
RAG search provider: none
```

### Start Frontend Development Server

```bash
# Terminal 2: Start the frontend development server on port 5173
npm run dev
```

You should see:
```
VITE v7.1.7  ready in 245 ms

➜  Local:   http://localhost:5173/
```

### Access the Application

Open your browser and visit:
```
http://localhost:5173
```

---

## Build for Production

```bash
# Build the React frontend
npm run build

# Output will be in the `dist/` folder
```

To serve the built version:
```bash
# Use the backend server which serves the dist folder
npm run server
```

---

## Available Scripts

```bash
npm run dev          # Start frontend dev server (port 5173)
npm run server       # Start backend Express server (port 3000)
npm run build        # Build frontend for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

---

## API Endpoints

### Authentication
- `POST /register` - User registration
- `POST /login` - User login
- `POST /forgot-password` - Check if email exists
- `POST /reset-password` - Reset user password

### Finance Management
- `POST /add-finance` - Add monthly financial record
- `GET /get-finance/:gmail` - Get all finance records
- `GET /api/user-data` - Get latest finance data
- `POST /categorize` - Categorize expense using AI

### Budgeting & Lifestyle
- `POST /lifestyle-advice` - Get AI lifestyle budget recommendations
- `POST /save-lifestyle-budget` - Save a lifestyle budget
- `GET /get-lifestyle-budgets/:gmail` - Get all lifestyle budgets
- `GET /get-latest-lifestyle-budget/:gmail` - Get latest budget
- `DELETE /delete-lifestyle-budget/:id` - Delete a budget

### Financial Goals
- `POST /set-financial-goal` - Create a financial goal
- `GET /get-financial-goals/:gmail` - Get all goals
- `POST /update-financial-progress` - Contribute to a goal
- `POST /contribute-goal-savings` - Allocate savings to goals

### Investment & Advice
- `POST /investment-advice` - Get AI investment recommendations
- `POST /chatbot` - Chat with financial advisor

### Social Features
- `GET /api/matching-peers/:email` - Find peers with similar lifestyle
- `GET /api/friends/:email` - Get list of friends
- `POST /api/send-friend-request` - Send friend request
- `GET /api/friend-requests/:email` - Get pending friend requests
- `POST /api/respond-friend-request` - Accept/reject friend request

---

## Troubleshooting

### Issue: Ollama connection fails

```
ERROR: connect ECONNREFUSED 127.0.0.1:8000
```

**Solution:**
```bash
# Start Ollama (or restart it)
ollama serve

# Verify in another terminal
curl http://localhost:8000/v1/models
```

### Issue: MongoDB connection error

```
MongoServerError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
```bash
# Start MongoDB
brew services start mongodb-community

# Or if using Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

### Issue: Port 3000 or 5173 already in use

```bash
# Find process using port 3000
lsof -i :3000
kill -9 <PID>

# Or change ports in vite.config.js and server.cjs
```

### Issue: Dependencies not installed

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `LLM_PROVIDER` | ollama | Which LLM to use (ollama only currently) |
| `OLLAMA_BASE_URL` | http://localhost:8000/v1 | Ollama API endpoint |
| `OLLAMA_MODEL` | meta-llama/Llama-3.1-8B-Instruct | Which Ollama model to use |
| `MONGO_URI` | mongodb://localhost:27017/finsage | MongoDB connection string |
| `RAG_SEARCH_PROVIDER` | none | Web search provider (none/tavily/serpapi) |
| `TAVILY_API_KEY` | - | Tavily API key for web search |
| `SERPAPI_API_KEY` | - | SerpAPI key for web search |
| `GOOGLE_GENAI_API_KEY` | - | Google Generative AI API key |

---

## Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see LICENSE file for details.

---

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the troubleshooting section above

---

## Architecture Overview

```
finsage/
├── src/                    # React frontend source
│   ├── components/
│   ├── pages/
│   └── App.jsx
├── server.cjs              # Express backend server
├── vite.config.js          # Vite configuration
├── package.json            # Dependencies and scripts
├── .env                    # Environment variables (create this)
└── README.md              # This file
```

---

**Happy budgeting with FinSage! 💰**
