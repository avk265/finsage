# FinSage 

FinSage is a comprehensive, AI-powered financial assistant and budgeting application. Built on the MERN stack (MongoDB, Express, React, Node.js) and powered by Vite, it helps users track expenses, create lifestyle-based budgets, receive personalized investment advice, and build healthy financial habits through streaks and peer comparisons.

##  Key Features

* **AI Financial Chatbot:** An intelligent assistant powered by Google's Gemini 2.5 Flash to answer personal finance questions and guide users through the app.
* **Lifestyle-Based Budgeting:** Analyzes hobbies and weekend preferences to assign users a financial archetype (e.g., *The Explorer*, *The Homebody*) and generates a personalized monthly budget plan.
* **Expense Auto-Categorization:** Allows users to log expenses via natural language text or voice input, automatically extracting the category, amount, and payment method using the Perplexity API.
* **AI Investment Advisor:** Generates dynamic, context-aware investment suggestions based on the user's monthly savings capacity and risk tolerance.
* **Financial Streaks & Goal Tracking:** Gamifies financial discipline by tracking consecutive days of expense logging and savings goals.
* **Peer Comparison & Networking:** Connects users with similar financial archetypes to compare spending habits, share insights, and send friend requests.
* **Robust Authentication:** Secure user registration, login, and password recovery using `bcrypt`.

---

## 🛠️ Tech Stack

**Frontend:**

* React 19 & Vite
* Tailwind CSS v4 (with Typography plugin)
* Framer Motion (Animations)
* Lucide React & LineIcons (Iconography)
* React Markdown (Chatbot rendering)

**Backend & Database:**

* Node.js & Express.js
* MongoDB & Mongoose (Data modeling)
* Bcrypt (Password hashing)

**AI Integrations:**

* `@google/genai` (Gemini API for the chatbot and lifestyle analysis)
* `openai` SDK (configured for Perplexity API for auto-categorization and investment advice)

---

## 📂 Project Structure

```text
avk265-finsage/
├── server.cjs              # Express backend entry point
├── package.json            # Project dependencies and scripts
├── vite.config.js          # Vite configuration and API proxy rules
├── tailwind.config.js      # Tailwind CSS configuration
├── eslint.config.js        # ESLint rules
├── index.html              # Main HTML template
└── src/
    ├── App.jsx             # Main React application routing
    ├── main.jsx            # React DOM rendering
    ├── index.css           # Global Tailwind imports
    ├── GmailContext.jsx    # Global state management for user sessions
    └── components/         # React components (Dashboard, Authentication, Features)

```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas URI)

### Environment Variables

Create a `.env` file in the root directory and add the following keys:

```env
MONGO_URL=your_mongodb_connection_string
GEMINI_API_KEY=your_google_gemini_api_key
PERPLEXITY_API_KEY=your_perplexity_api_key

```

*(Note: Ensure your `server.cjs` is correctly referencing `process.env.MONGO_URL` without quotes for the DB connection).*

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd avk265-finsage

```


2. **Install dependencies:**
```bash
npm install

```



### Running the Application

FinSage requires both the frontend Vite development server and the Express backend server to be running simultaneously.

1. **Start the Express Backend:**
Open a terminal and start the backend server (runs on port 3000 by default):
```bash
node server.cjs

```


2. **Start the Vite Frontend:**
Open a new terminal window and start the React application (runs on port 5173 by default):
```bash
npm run dev

```


3. **Access the App:**
Navigate to `http://localhost:5173` in your web browser. All API calls from the frontend will be automatically proxied to `http://localhost:3000`.

---

## Scripts

* `npm run dev`: Starts the Vite development server.
* `npm run build`: Builds the app for production.
* `npm run lint`: Runs ESLint to check for code quality issues.
* `npm run preview`: Locally previews the production build.
