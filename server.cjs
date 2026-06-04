const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");
const { OpenAI } = require("openai");
const cors = require("cors");
const dotenv =require("dotenv");
const app = express();
const port = 3000;

// ------------------ MIDDLEWARE ------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));
app.use(cors({
  origin: "http://localhost:5173", // Your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));
dotenv.config();
// ------------------ INITIALIZATION & CONFIG (APIs) ------------------
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Replace with your key
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY; // Replace with your key

if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
  console.error("FATAL: GEMINI_API_KEY is missing. Please insert your valid key.");
  // process.exit(1); // Consider exiting if essential
}
if (!PERPLEXITY_API_KEY || PERPLEXITY_API_KEY === "YOUR_PERPLEXITY_API_KEY") {
  console.error("FATAL: PERPLEXITY_API_KEY is missing. Please insert your valid key.");
  process.exit(1); // Exit if Perplexity is essential
}

// Initialize AI clients
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const perplexity = new OpenAI({
  apiKey: PERPLEXITY_API_KEY,
  baseURL: "https://api.perplexity.ai",
});

const chatSessions = {};

// ------------------ MONGODB CONNECTION with Mongoose ------------------
const uri = "process.env.MONGO_URL"; // Added DB name to URI

async function connectDB() {
  try {
    await mongoose.connect(uri, {
        //useNewUrlParser: true, // Deprecated but good practice for older versions
        //useUnifiedTopology: true, // Deprecated
        serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
    });
    console.log("✅ MongoDB connected successfully via Mongoose");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); // Exit if DB connection fails
  }
}

// ------------------ MONGOOSE SCHEMAS & MODELS ------------------

// --- User Schema ---
const userSchema = new mongoose.Schema({
  gmail: { type: String, required: true, unique: true, lowercase: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true }, // Keep both for compatibility
  password: { type: String, required: true },
  full_name: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, trim: true },
  country: { type: String, default: "", trim: true },
  state: { type: String, default: "", trim: true },
  pincode: { type: String, default: "", trim: true },
  address: { type: String, default: "", trim: true },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

// Ensure unique index works for both gmail and email if needed (Mongoose handles this via `unique: true`)
// userSchema.index({ gmail: 1 }, { unique: true, sparse: true }); // Example if needed explicitly
const User = mongoose.model('UserDetail', userSchema, 'user_details'); // Explicit collection name

// --- Finance Schema ---
const financeSchema = new mongoose.Schema({
  gmail: { type: String, required: true, lowercase: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true }, // Keep both
  month: { type: Number, required: true, min: 1, max: 12 },
  year: { type: Number, required: true, min: 1900 },
  totalEarnings: { type: Number, default: 0 },
  rent: { type: Number, default: 0 },
  food: { type: Number, default: 0 },
  transportation: { type: Number, default: 0 },
  entertainment: { type: Number, default: 0 },
  healthcare: { type: Number, default: 0 },
  savings: { type: Number, default: 0 },
  otherExpenses: { type: Number, default: 0 },
}, { timestamps: true });

// Index for efficient lookup of monthly records per user
financeSchema.index({ gmail: 1, year: -1, month: -1 });
financeSchema.index({ email: 1, year: -1, month: -1 });
const Finance = mongoose.model('Finance', financeSchema, 'finance');

// --- Lifestyle Budget Schema ---
const lifestyleBudgetSchema = new mongoose.Schema({
  gmail: { type: String, required: true, lowercase: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  weekendPreference: { type: String, default: "" },
  hobbies: [{ type: String }],
  savingsGoal: { type: String, default: "" },
  archetype: {
    name: { type: String, default: "" },
    icon: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  budgetPlan: {
    totalEarnings: { type: Number, default: 0 },
    plan: { type: mongoose.Schema.Types.Mixed, default: {} }, // Flexible object
  },
    start: Date, // For expense categorization logic
    end: Date,   // For expense categorization logic
}, { timestamps: true });

lifestyleBudgetSchema.index({ gmail: 1, createdAt: -1 });
lifestyleBudgetSchema.index({ email: 1, createdAt: -1 });
const LifestyleBudget = mongoose.model('LifestyleBudget', lifestyleBudgetSchema, 'lifestyle_budgets');

// --- Friend Request Schema ---
const friendRequestSchema = new mongoose.Schema({
  senderEmail: { type: String, required: true, lowercase: true, trim: true },
  senderName: { type: String, required: true },
  recipientEmail: { type: String, required: true, lowercase: true, trim: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  respondedAt: Date,
}, { timestamps: true });

friendRequestSchema.index({ recipientEmail: 1, status: 1 });
const FriendRequest = mongoose.model('FriendRequest', friendRequestSchema, 'friend_requests');

// --- Friendship Schema ---
const friendshipSchema = new mongoose.Schema({
  user1: { type: String, required: true, lowercase: true, trim: true }, // user email
  user2: { type: String, required: true, lowercase: true, trim: true }, // friend email
}, { timestamps: true });

// Index to quickly find friendships involving a user
friendshipSchema.index({ user1: 1 });
friendshipSchema.index({ user2: 1 });
const Friendship = mongoose.model('Friendship', friendshipSchema, 'friendships');

// --- Expense Schema ---
const expenseSchema = new mongoose.Schema({
    gmail: { type: String, required: true, lowercase: true, trim: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    category: { type: String, default: 'Other' },
    item: { type: String },
    payment: { type: String },
    transcript: { type: String }, // Original transcript if available
}, { timestamps: true });

expenseSchema.index({ gmail: 1, date: -1 });
const Expense = mongoose.model('Expense', expenseSchema, 'expenses');

// --- User Financial Goal Schema ---
const userFinancialGoalSchema = new mongoose.Schema({
    gmail: { type: String, required: true, lowercase: true, trim: true },
    goalName: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    currentAmount: { type: Number, default: 0 },
    expenses: [{ // Store related expenses for tracking within the goal
      date: { type: String }, // YYYY-MM-DD string
      amount: { type: Number }
    }],
}, { timestamps: true });

userFinancialGoalSchema.index({ gmail: 1, createdAt: -1 });
const UserFinancialGoal = mongoose.model('UserFinancialGoal', userFinancialGoalSchema, 'userFinancial');


// ------------------ HELPER FUNCTIONS ------------------
// (extractJsonContent remains the same)
function extractJsonContent(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  // Basic check for simple JSON object
  if (start !== -1 && end !== -1 && end > start) {
    return text.substring(start, end + 1);
  }
  // Check for JSON array
  const arrayStart = text.indexOf('[');
  const arrayEnd = text.lastIndexOf(']');
   if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
    return text.substring(arrayStart, arrayEnd + 1);
  }
  return text; // fallback
}

// (calculateMatchScore remains the same)
function calculateMatchScore(lifestyle1, lifestyle2) {
  // ... (implementation is unchanged) ...
  let score = 0;
  if (!lifestyle1 || !lifestyle2) return 0; // Handle missing data

  // Archetype match (40%)
  if (lifestyle1.archetype?.name && lifestyle1.archetype?.name === lifestyle2.archetype?.name) {
    score += 0.4;
  }

  // Weekend preference match (20%)
  if (lifestyle1.weekendPreference && lifestyle1.weekendPreference === lifestyle2.weekendPreference) {
    score += 0.2;
  }

  // Hobbies overlap (40%)
  const hobbies1 = lifestyle1.hobbies || [];
  const hobbies2 = lifestyle2.hobbies || [];
  const commonHobbies = hobbies1.filter(h => hobbies2.includes(h)).length;
  const maxHobbies = Math.max(hobbies1.length, hobbies2.length);
  if (maxHobbies > 0) {
    score += 0.4 * (commonHobbies / maxHobbies);
  }

  return score;
}

// ------------------ HOME PAGE ------------------
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ------------------ REGISTER ------------------
app.post("/register", async (req, res) => {
  const { gmail, password, full_name, mobile, country, state, pincode, address } = req.body || {};
  console.log("========== REGISTER REQUEST RECEIVED ==========");
  console.log("Received register request body:", req.body);

  if (!gmail || !password || !full_name || !mobile) {
    return res.status(400).json({ success: false, message: "Required fields missing" });
  }
  // Basic validations (keep these)
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(gmail)) {
    return res.status(400).json({ success: false, message: "Invalid email format" });
  }
  if (!/^[0-9]{10}$/.test(mobile)) { // Simple 10-digit check
    return res.status(400).json({ success: false, message: "Invalid mobile number (should be 10 digits)" });
  }

  try {
    // Check if user exists using Mongoose findOne with $or
    const existingUser = await User.findOne({ $or: [{ gmail: gmail }, { email: gmail }] });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Gmail already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user using Mongoose Model.create()
    const newUser = await User.create({
      gmail,
      email: gmail, // Keep both fields
      password: hashedPassword,
      full_name,
      mobile,
      country: country || "",
      state: state || "",
      pincode: pincode || "",
      address: address || "",
    });

    console.log("User created successfully:", { _id: newUser._id, gmail: newUser.gmail });
    res.status(201).json({ success: true, message: "Registration successful" });

  } catch (err) {
    console.error("Registration error:", err);
    // Handle potential duplicate key error from Mongoose
    if (err.code === 11000) {
        return res.status(409).json({ success: false, message: "Gmail already exists (DB constraint)." });
    }
    res.status(500).json({ success: false, message: "Server error during registration" });
  }
});

// ------------------ LOGIN ------------------
app.post("/login", async (req, res) => {
  console.log("========== LOGIN REQUEST RECEIVED ==========");
  console.log("Request body:", req.body);
  const { gmail, password } = req.body || {};

  if (!gmail || !password) {
    return res.status(400).json({ success: false, message: "Gmail and password required" });
  }

  try {
    // Find user by gmail or email
    const user = await User.findOne({ $or: [{ gmail: gmail }, { email: gmail }] });

    if (!user) {
      console.log("User not found:", gmail);
      return res.status(404).json({ success: false, message: "Gmail not found" });
    }
    console.log("User found:", user.full_name);

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log("Invalid password for:", gmail);
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    // Retrieve latest archetype if needed (from LifestyleBudget)
    const latestLifestyle = await LifestyleBudget.findOne({ $or: [{ gmail }, { email: gmail }] })
                                            .sort({ createdAt: -1 });
    const archetype = latestLifestyle?.archetype?.name || ""; // Default if not found

    console.log("Login successful for:", gmail, "Archetype:", archetype);
    return res.status(200).json({
        success: true,
        message: "Login successful!",
        gmail: user.gmail, // Return consistent gmail
        archetype: archetype // Include archetype in response
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error during login" });
  }
});


// ------------------ FORGOT PASSWORD (Verify Email) ------------------
app.post("/forgot-password", async (req, res) => {
  const { gmail } = req.body || {};
  if (!gmail) return res.status(400).json({ exists: false, message: "Email required" });

  try {
    const user = await User.findOne({ $or: [{ gmail: gmail }, { email: gmail }] });
    res.status(200).json({ exists: !!user }); // Send true if user is not null/undefined
  } catch (err) {
    console.error("Forgot password check error:", err);
    res.status(500).json({ exists: false, message: "Server error" });
  }
});

// ------------------ RESET PASSWORD ------------------
app.post("/reset-password", async (req, res) => {
  const { gmail, newPassword } = req.body || {};
  if (!gmail || !newPassword) {
    return res.status(400).json({ success: false, message: "Gmail and new password required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Find and update using Mongoose findOneAndUpdate
    const updatedUser = await User.findOneAndUpdate(
      { $or: [{ gmail: gmail }, { email: gmail }] }, // Find criteria
      { $set: { password: hashedPassword } },       // Update
      { new: false } // Optional: set to true to return the *updated* document
    );

    if (updatedUser) { // If a document was found and updated
      res.status(200).json({ success: true, message: "Password updated successfully!" });
    } else {
      res.status(404).json({ success: false, message: "Gmail not found" });
    }
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ success: false, message: "Server error during password reset" });
  }
});

// ------------------ ADD FINANCE (Monthly Record) ------------------
app.post("/add-finance", async (req, res) => {
  console.log("Received /add-finance body:", req.body);
  const {
    gmail, totalEarnings, rent, food, transportation, entertainment,
    healthcare, savings, otherExpenses, month, year
  } = req.body || {};

  if (!gmail) return res.status(400).json({ success: false, message: "User email missing" });
  if (!month || !year) return res.status(400).json({ success: false, message: "Month and Year required" });

  const numericMonth = Number(month);
  const numericYear = Number(year);
  // Basic validation for month/year (keep this)
  if (isNaN(numericMonth) || isNaN(numericYear) || numericMonth < 1 || numericMonth > 12 || numericYear < 1900 || numericYear > 3000) {
    return res.status(400).json({ success: false, message: "Invalid month or year" });
  }

  // Convert fields to numbers, default to 0
  const financeDataInput = {
    totalEarnings: Number(totalEarnings || 0), rent: Number(rent || 0), food: Number(food || 0),
    transportation: Number(transportation || 0), entertainment: Number(entertainment || 0),
    healthcare: Number(healthcare || 0), savings: Number(savings || 0), otherExpenses: Number(otherExpenses || 0)
  };

  if (Object.values(financeDataInput).some(isNaN)) {
      return res.status(400).json({ success: false, message: "Invalid numeric value provided for finance fields" });
  }

  try {
    // Check user exists (optional, but good practice)
    const user = await User.findOne({ $or: [{ gmail }, { email: gmail }] });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Check for existing record for the month/year using Mongoose
    const existingRecord = await Finance.findOne({
      $or: [{ gmail }, { email: gmail }],
      month: numericMonth,
      year: numericYear
    });

    if (existingRecord) {
      return res.status(409).json({
          success: false,
          message: `Finance data for ${month}/${year} already exists. Consider updating.`
      });
    }

    // Create new finance record using Mongoose
    const newFinanceRecord = await Finance.create({
      gmail,
      email: gmail,
      month: numericMonth,
      year: numericYear,
      ...financeDataInput // Spread the numeric fields
    });

    console.log("Finance record created:", newFinanceRecord._id);
    res.status(201).json({ success: true, message: "Finance data saved successfully" });

  } catch (err) {
    console.error("Add finance error:", err);
    res.status(500).json({ success: false, message: "Server error saving finance data" });
  }
});

// ------------------ GET LATEST USER FINANCE DATA (/api/user-data) ----------
// Note: This duplicates functionality of /get-finance/:gmail? Consider consolidating.
app.get("/api/user-data", async (req, res) => {
  const { email } = req.query; // Use 'email' consistently from query param
  if (!email) return res.status(400).json({ success: false, message: "Email query parameter required." });

  try {
    // Find the latest record using Mongoose findOne with sort
    const latestRecord = await Finance.findOne({ $or: [{ gmail: email }, { email: email }] })
                                  .sort({ year: -1, month: -1 }); // Sort by year then month descending

    if (!latestRecord) {
      return res.status(404).json({ success: false, message: `No financial data found for user: ${email}` });
    }
    res.status(200).json(latestRecord); // Return the single latest document

  } catch (err) {
    console.error("Get /api/user-data error:", err);
    res.status(500).json({ success: false, message: "Server error fetching user data" });
  }
});
// A NEW route in your server.js/index.js
// This route matches your frontend's POST request to /user-data

app.post("/user-data", async (req, res) => {
  // 1. Get email from the POST body, matching the frontend
  const { gmail } = req.body; 

  if (!gmail) {
    return res.status(400).json({ success: false, message: "Email is required in the body." });
  }

  try {
    // 2. Find the user in your *User* collection (I'm guessing the model name is 'User')
    // Use findOne, as there should only be one user with that email.
    const userProfile = await User.findOne({ $or: [{ gmail: gmail }, { email: gmail }] });

    if (!userProfile) {
      return res.status(404).json({ success: false, message: `No user profile found for: ${gmail}` });
    }

    // 3. Send back the profile data
    // The frontend code (setProfileData) will now work with this response.
    res.status(200).json(userProfile); 

  } catch (err) {
    console.error("Post /user-data error:", err);
    res.status(500).json({ success: false, message: "Server error fetching user profile" });
  }
});

// ------------------ GET ALL FINANCE RECORDS FOR USER ------------------
app.get("/get-finance/:gmail", async (req, res) => {
  const { gmail } = req.params;

  try {
    // Find all records using Mongoose find with sort
    const records = await Finance.find({ $or: [{ gmail }, { email: gmail }] })
                                .sort({ year: -1, month: -1 }); // Sort by date descending

    res.status(200).json(records); // Returns an array of documents
  } catch (err) {
    console.error("Get all finance records error:", err);
    res.status(500).json({ success: false, message: "Server error fetching finance records" });
  }
});

// ------------------ CATEGORIZE EXPENSE ------------------
app.post("/categorize", async (req, res) => {
  const { gmail, content } = req.body;
  if (!gmail || !content) {
    return res.status(400).json({ success: false, message: "Gmail and expense description required" });
  }
  
  const prompt = `
You are a precise AI assistant that fully analyzes and categorizes expense details given in text.

Instructions:
- Pick one category strictly from: Salary, Rent, Food, Transportation, Entertainment, Healthcare, Savings, Other.
- Group similar items under a simple item name (e.g., "coffee", "latte" → "coffee").
- Extract the expense amount as a number only (no currency signs).
- Identify payment method. Any method related to UPI services like: 'UPI', 'GPay', 'PhonePe', 'Paytm', 'Amazon Pay' etc should be normalized to "UPI".
- If no payment method given, use "Cash".
- Output ONLY a JSON object with keys: "category", "item", "amount", "paymentMethod".
- Do not add any extra texts or explanations.

Example output:
{"category": "Food", "item": "coffee", "amount": 150, "paymentMethod": "UPI"}

Text:
"${content}"

Provide only the JSON response.
`;

  try {
    const aiResponse = await perplexity.chat.completions.create({
      model: "sonar-pro",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    });

    const rawText = aiResponse.choices[0].message?.content || "";
    const jsonText = extractJsonContent(rawText); // Extract JSON string from raw AI response
    
    let parsed = { category: "", item: "", amount: 0, paymentMethod: "" };

    try {
      parsed = JSON.parse(jsonText);
    } catch (e) {
      console.error("Parsing AI JSON response failed:", e, "Raw text:", rawText);
      return res.status(500).json({ success: false, message: "AI response parsing failed" });
    }

    // Normalize payment method
    const knownUpiApps = ["gpay", "phonepe", "paytm", "amazon pay", "mobikwik", "freecharge"];
    const payLower = (parsed.paymentMethod || "").toLowerCase();

    if (payLower.includes("upi") || knownUpiApps.some(app => payLower.includes(app))) {
      parsed.paymentMethod = "UPI";
    } else if (!parsed.paymentMethod || parsed.paymentMethod.trim() === "") {
      parsed.paymentMethod = "Cash";
    }

    // Validate all fields non-empty & amount positive
    if (
      !parsed.category ||
      !parsed.item ||
      !parsed.paymentMethod ||
      typeof parsed.amount !== "number" ||
      parsed.amount <= 0
    ) {
      return res.status(400).json({ success: false, message: "Incomplete expense details from categorization" });
    }

    // Save only if all details are valid and non-empty
    const newExpense = await Expense.create({
      gmail,
      category: parsed.category,
      item: parsed.item,
      amount: parsed.amount,
      payment: parsed.paymentMethod,
      date: new Date(),
      transcript: content,
    });

    // Optionally update financial goal if exists
    const now = new Date();
    const activeGoal = await UserFinancialGoal.findOne({
      gmail,
      startDate: { $lte: now },
      endDate: { $gte: now },
    });

    if (activeGoal) {
      await UserFinancialGoal.updateOne(
        { _id: activeGoal._id },
        { $push: { expenses: { date: new Date().toISOString().split("T")[0], amount: newExpense.amount } } }
      );
      console.log(`Linked expense to active goal: ${activeGoal.goalName}`);
    }

    res.status(200).json({
      success: true,
      category: newExpense.category,
      item: newExpense.item,
      amount: newExpense.amount,
      payment: newExpense.payment,
    });
  } catch (err) {
    console.error("Categorization route error:", err);
    res.status(500).json({ success: false, message: "Categorization failed" });
  }
});



// ------------------ FINANCIAL GOAL ROUTES ------------------

// GET /get-financial-goals/:gmail
app.get('/get-financial-goals/:gmail', async (req, res) => {
  const { gmail } = req.params;
  try {
    const goals = await UserFinancialGoal.find({ gmail: gmail.trim().toLowerCase() })
                                    .sort({ createdAt: -1 }); // Sort by creation date
    res.status(200).json(goals);
  } catch (err) {
    console.error("Error fetching financial goals:", err);
    res.status(500).json({ success: false, message: "Server error fetching goals" });
  }
});

// POST /set-financial-goal
app.post('/set-financial-goal', async (req, res) => {
  const { gmail, goalName, targetAmount, startDate, endDate } = req.body;
  if (!gmail || !goalName || !targetAmount || !startDate || !endDate) {
    return res.status(400).json({ success: false, message: "Missing required goal fields" });
  }
  try {
    // Create goal using Mongoose
    const newGoal = await UserFinancialGoal.create({
      gmail: gmail.trim().toLowerCase(),
      goalName,
      targetAmount: Number(targetAmount),
      startDate: new Date(startDate), // Ensure dates are stored as Date objects
      endDate: new Date(endDate),
      currentAmount: 0,
      expenses: [], // Initialize expenses array
    });
    res.status(201).json({ success: true, message: "Goal added successfully!", goalId: newGoal._id });
  } catch (err) {
    console.error("Error adding financial goal:", err);
    res.status(500).json({ success: false, message: "Server error adding goal" });
  }
});

// POST /update-financial-progress
app.post('/update-financial-progress', async (req, res) => {
  const { gmail, goalName, amount } = req.body;
  if (!gmail || !goalName || typeof amount !== "number" || amount <= 0) { // Add check for positive amount
    return res.status(400).json({ success: false, message: "Valid gmail, goalName, and positive amount required" });
  }
  try {
    // Find and update using Mongoose findOneAndUpdate with $inc
    const updatedGoal = await UserFinancialGoal.findOneAndUpdate(
      { gmail: gmail.trim().toLowerCase(), goalName }, // Find criteria
      { $inc: { currentAmount: amount } }, // Increment currentAmount
      { new: true } // Return the updated document
    );

    if (updatedGoal) {
      res.json({ success: true, message: "Progress updated", updatedGoal });
    } else {
      res.status(404).json({ success: false, message: "Goal not found for this user" });
    }
  } catch (err) {
    console.error("Error updating progress:", err);
    res.status(500).json({ success: false, message: "Server error updating progress" });
  }
});


// ------------------ LIFESTYLE BUDGET ROUTES ------------------

// POST /save-lifestyle-budget
app.post("/save-lifestyle-budget", async (req, res) => {
  console.log("========== SAVE LIFESTYLE BUDGET REQUEST ==========");
  console.log("Received body:", JSON.stringify(req.body, null, 2));
  const { gmail, weekendPreference, hobbies, savingsGoal, archetype, budgetPlan } = req.body || {};

  if (!gmail || !archetype || !budgetPlan) {
    return res.status(400).json({ success: false, message: "Gmail, archetype, and budget plan required" });
  }

  try {
    // Check user exists (optional but good practice)
    const user = await User.findOne({ $or: [{ gmail }, { email: gmail }] });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Create lifestyle budget using Mongoose
    const newLifestyleBudget = await LifestyleBudget.create({
      gmail,
      email: gmail,
      weekendPreference: weekendPreference || "",
      hobbies: Array.isArray(hobbies) ? hobbies : [],
      savingsGoal: savingsGoal || "",
      archetype: {
        name: archetype.name || "",
        icon: archetype.icon || "",
        description: archetype.description || ""
      },
      budgetPlan: {
        totalEarnings: Number(budgetPlan.totalEarnings) || 0,
        plan: budgetPlan.plan || {}
      },
      // You might want start/end dates for the budget period
       // start: new Date(),
       // end: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Example: 1 month budget
    });

    console.log("✅ Lifestyle budget saved successfully:", newLifestyleBudget._id);
    res.status(201).json({
      success: true,
      message: "Lifestyle budget saved successfully",
      budgetId: newLifestyleBudget._id.toString()
    });

  } catch (err) {
    console.error("❌ Save lifestyle budget error:", err);
    res.status(500).json({ success: false, message: `Server error: ${err.message}` });
  }
});

// GET /get-lifestyle-budgets/:gmail
app.get("/get-lifestyle-budgets/:gmail", async (req, res) => {
  const { gmail } = req.params;
  if (!gmail) return res.status(400).json({ success: false, message: "Email required" });

  try {
    const budgets = await LifestyleBudget.find({ $or: [{ gmail }, { email: gmail }] })
                                      .sort({ createdAt: -1 }); // Sort newest first
    res.status(200).json({ success: true, budgets });
  } catch (err) {
    console.error("Get lifestyle budgets error:", err);
    res.status(500).json({ success: false, message: "Server error fetching budgets" });
  }
});

// GET /get-latest-lifestyle-budget/:gmail
app.get("/get-latest-lifestyle-budget/:gmail", async (req, res) => {
  const { gmail } = req.params;
  if (!gmail) return res.status(400).json({ success: false, message: "Email required" });

  try {
    const latestBudget = await LifestyleBudget.findOne({ $or: [{ gmail }, { email: gmail }] })
                                            .sort({ createdAt: -1 }); // Find newest
    if (!latestBudget) {
      return res.status(404).json({ success: false, message: "No lifestyle budget found" });
    }
    res.status(200).json({ success: true, budget: latestBudget });
  } catch (err) {
    console.error("Get latest lifestyle budget error:", err);
    res.status(500).json({ success: false, message: "Server error fetching latest budget" });
  }
});

// DELETE /delete-lifestyle-budget/:id
app.delete("/delete-lifestyle-budget/:id", async (req, res) => {
  const { id } = req.params;
  const { gmail } = req.body; // Ensure gmail is passed in body for verification

  if (!id || !gmail) {
    return res.status(400).json({ success: false, message: "Budget ID and email required" });
  }

  try {
    // Delete using Mongoose deleteOne with ID and owner check
    const result = await LifestyleBudget.deleteOne({
      _id: id, // Mongoose converts string ID automatically
      $or: [{ gmail: gmail }, { email: gmail }] // Ensure user owns the budget
    });

    if (result.deletedCount > 0) {
      res.status(200).json({ success: true, message: "Lifestyle budget deleted successfully" });
    } else {
      res.status(404).json({ success: false, message: "Budget not found or unauthorized" });
    }
  } catch (err) {
    console.error("Delete lifestyle budget error:", err);
    // Handle invalid ObjectId format
     if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(400).json({ success: false, message: "Invalid Budget ID format." });
     }
    res.status(500).json({ success: false, message: "Server error deleting budget" });
  }
});

// ------------------ PEER COMPARISON & FRIENDS ROUTES ------------------

// GET /api/current-user-full (Combined user, finance, lifestyle)
app.get("/api/current-user-full", async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ success: false, message: "Email required" });

  try {
    // Use Promise.all for parallel fetching
    const [user, finance, lifestyle] = await Promise.all([
      User.findOne({ $or: [{ gmail: email }, { email: email }] }).select('-password'), // Exclude password
      Finance.findOne({ $or: [{ gmail: email }, { email: email }] }).sort({ year: -1, month: -1 }),
      LifestyleBudget.findOne({ $or: [{ gmail: email }, { email: email }] }).sort({ createdAt: -1 })
    ]);

    res.json({
      user: user || null,
      finance: finance || null,
      lifestyle: lifestyle || null
    });
  } catch (err) {
    console.error("Get current user full data error:", err);
    res.status(500).json({ success: false, message: "Server error fetching user data" });
  }
});

// GET /api/matching-peers/:email
app.get("/api/matching-peers/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const currentUserLifestyle = await LifestyleBudget.findOne({ $or: [{ gmail: email }, { email: email }] })
                                                 .sort({ createdAt: -1 });

    if (!currentUserLifestyle?.archetype?.name) {
      return res.json({ peers: [] }); // Return empty if no archetype found
    }
    const currentArchetype = currentUserLifestyle.archetype.name;

    // Find distinct emails of users with the same archetype (excluding self)
    const peerEmails = await LifestyleBudget.distinct('gmail', { // Use distinct for efficiency
      "archetype.name": currentArchetype,
      gmail: { $ne: email }, // Ensure 'gmail' field is checked
      email: { $ne: email }  // Ensure 'email' field is checked
    });

    // Fetch details for these peers
    const peersData = await Promise.all(peerEmails.map(async (peerEmail) => {
      // Fetch user, lifestyle, and friendship status in parallel
      const [user, lifestyle, isFriend, requestSent, requestReceived] = await Promise.all([
          User.findOne({ $or: [{ gmail: peerEmail }, { email: peerEmail }] }).select('full_name state country'),
          LifestyleBudget.findOne({ $or: [{ gmail: peerEmail }, { email: peerEmail }] }).sort({ createdAt: -1 }),
          Friendship.exists({ $or: [{ user1: email, user2: peerEmail }, { user1: peerEmail, user2: email }] }),
          FriendRequest.exists({ senderEmail: email, recipientEmail: peerEmail, status: 'pending' }),
          FriendRequest.exists({ senderEmail: peerEmail, recipientEmail: email, status: 'pending' })
      ]);

      let friendshipStatus = 'none';
      if (isFriend) friendshipStatus = 'friends';
      else if (requestSent) friendshipStatus = 'pending_sent'; // Indicate who sent it
      else if (requestReceived) friendshipStatus = 'pending_received';

      const matchScore = calculateMatchScore(currentUserLifestyle, lifestyle);

      return {
        gmail: peerEmail,
        full_name: user?.full_name || 'Anonymous',
        state: user?.state || 'Unknown',
        country: user?.country || 'Unknown',
        archetype: lifestyle?.archetype?.name || 'Unknown',
        friendshipStatus,
        matchScore
      };
    }));

    // Sort by match score descending
    peersData.sort((a, b) => b.matchScore - a.matchScore);

    res.json({ peers: peersData });

  } catch (err) {
    console.error("Error fetching matching peers:", err);
    res.status(500).json({ success: false, message: "Server error fetching peers" });
  }
});


// POST /api/send-friend-request
app.post("/api/send-friend-request", async (req, res) => {
  const { senderEmail, recipientEmail } = req.body;
  if (!senderEmail || !recipientEmail || senderEmail === recipientEmail) {
    return res.status(400).json({ success: false, message: "Valid sender/recipient emails required, cannot friend self" });
  }

  try {
    // Check if already friends or request exists (using Mongoose .exists for efficiency)
    const alreadyFriends = await Friendship.exists({ $or: [{ user1: senderEmail, user2: recipientEmail }, { user1: recipientEmail, user2: senderEmail }] });
    if (alreadyFriends) return res.status(400).json({ success: false, message: "Already friends" });

    const requestExists = await FriendRequest.exists({
        $or: [
           { senderEmail, recipientEmail, status: 'pending' },
           { senderEmail: recipientEmail, recipientEmail: senderEmail, status: 'pending' }
        ]
    });
    if (requestExists) return res.status(400).json({ success: false, message: "Friend request already pending" });

    // Get sender's name
    const sender = await User.findOne({ $or: [{ gmail: senderEmail }, { email: senderEmail }] }).select('full_name');
    if (!sender) return res.status(404).json({ success: false, message: "Sender not found" });

    // Create request using Mongoose
    await FriendRequest.create({
      senderEmail,
      senderName: sender.full_name || 'Anonymous',
      recipientEmail,
      status: 'pending',
    });
    res.json({ success: true, message: "Friend request sent" });

  } catch (err) {
    console.error("Error sending friend request:", err);
    res.status(500).json({ success: false, message: "Server error sending request" });
  }
});

// GET /api/friend-requests/:email
app.get("/api/friend-requests/:email", async (req, res) => {
  const { email } = req.params;
  try {
    // Find pending requests using Mongoose find
    const requests = await FriendRequest.find({ recipientEmail: email, status: 'pending' })
                                    .sort({ createdAt: -1 }); // Show newest first
    res.json({ requests });
  } catch (err) {
    console.error("Error fetching friend requests:", err);
    res.status(500).json({ success: false, message: "Server error fetching requests" });
  }
});

// POST /api/respond-friend-request
app.post("/api/respond-friend-request", async (req, res) => {
  const { requestId, action, userEmail } = req.body; // userEmail is the recipient verifying
  if (!requestId || !action || !userEmail || !['accept', 'reject'].includes(action)) {
    return res.status(400).json({ success: false, message: "Missing/invalid fields (requestId, action, userEmail)" });
  }

  try {
    // Find the request and verify recipient using Mongoose findById
    const request = await FriendRequest.findById(requestId); // Mongoose converts string ID

    if (!request) return res.status(404).json({ success: false, message: "Request not found" });
    if (request.recipientEmail !== userEmail) return res.status(403).json({ success: false, message: "Unauthorized" });
    if (request.status !== 'pending') return res.status(400).json({ success: false, message: "Request already responded to" });


    if (action === 'accept') {
      // Check if friendship already exists (edge case)
       const alreadyFriends = await Friendship.exists({ $or: [{ user1: request.senderEmail, user2: request.recipientEmail }, { user1: request.recipientEmail, user2: request.senderEmail }] });
       if (!alreadyFriends) {
           // Create friendship using Mongoose
           await Friendship.create({
             user1: request.senderEmail,
             user2: request.recipientEmail,
           });
       }
      // Update request status using findByIdAndUpdate
      await FriendRequest.findByIdAndUpdate(requestId, {
        $set: { status: 'accepted', respondedAt: new Date() }
      });
      res.json({ success: true, message: "Friend request accepted" });

    } else { // action === 'reject'
      await FriendRequest.findByIdAndUpdate(requestId, {
        $set: { status: 'rejected', respondedAt: new Date() }
      });
      res.json({ success: true, message: "Friend request rejected" });
    }

  } catch (err) {
    console.error("Error responding to friend request:", err);
     if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(400).json({ success: false, message: "Invalid Request ID format." });
     }
    res.status(500).json({ success: false, message: "Server error responding to request" });
  }
});

// GET /api/friends/:email
app.get("/api/friends/:email", async (req, res) => {
  const { email } = req.params;
  try {
    // Find friendships using Mongoose find
    const friendships = await Friendship.find({ $or: [{ user1: email }, { user2: email }] });

    const friendEmails = friendships.map(f => (f.user1 === email ? f.user2 : f.user1));

    // Fetch details for all friends in parallel
    const friendsData = await Promise.all(friendEmails.map(async (friendEmail) => {
      const [user, lifestyle, finance] = await Promise.all([
        User.findOne({ $or: [{ gmail: friendEmail }, { email: friendEmail }] }).select('full_name state country'),
        LifestyleBudget.findOne({ $or: [{ gmail: friendEmail }, { email: friendEmail }] }).sort({ createdAt: -1 }),
        Finance.findOne({ $or: [{ gmail: friendEmail }, { email: friendEmail }] }).sort({ year: -1, month: -1 })
      ]);
      return {
        gmail: friendEmail,
        full_name: user?.full_name || 'Anonymous',
        state: user?.state || 'Unknown',
        country: user?.country || 'Unknown',
        archetype: lifestyle?.archetype?.name || 'Unknown',
        isFriend: true, // They are definitely friends if found via Friendship collection
        financeData: finance ? { /* Extract relevant fields */
          totalEarnings: finance.totalEarnings, rent: finance.rent, food: finance.food,
          transportation: finance.transportation, entertainment: finance.entertainment,
          healthcare: finance.healthcare, savings: finance.savings, otherExpenses: finance.otherExpenses
        } : null,
        lifestyleData: lifestyle ? { /* Extract relevant fields */
           weekendPreference: lifestyle.weekendPreference, hobbies: lifestyle.hobbies, savingsGoal: lifestyle.savingsGoal
        } : null
      };
    }));

    res.json({ friends: friendsData });
  } catch (err) {
    console.error("Error fetching friends:", err);
    res.status(500).json({ success: false, message: "Server error fetching friends" });
  }
});


// ------------------ CHATBOT ------------------
app.post("/chatbot", async (req, res) => {
  const { message, gmail } = req.body || {};

  if (!message || !gmail) {
    return res.status(400).json({ success: false, message: "Message and user email required" });
  }

  if (!ai) {
    return res.status(500).json({ success: false, message: "AI service is unavailable. Check server logs." });
  }

  try {
    let chat = chatSessions[gmail];
    if (!chat) {
      console.log(`Creating new chat session for: ${gmail}`);
      chat = ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction:
            "You are FinSage, a friendly and smart financial assistant. Format responses clearly with paragraphs and numbered steps when explaining processes."
        }
      });
      chatSessions[gmail] = chat;
    }

    const response = await chat.sendMessage({ message });
    let replyText = response.text || "";

    // 🧹 SMART FORMATTING & CLEANUP
    replyText = replyText
      .replace(/\r/g, "") // remove carriage returns
      .replace(/\s*\*\*\s*/g, "\n\n") // newline for emphasis markers
      .replace(/\b(here (are|is) (some )?(key )?(things|steps|points|tips).{0,20}:)/gi, "$1\n\n") // newline after "Here are..." or similar
      .replace(/\b(the steps are as follows:)/gi, "$1\n\n") // newline after step intros
      .replace(/\b(follow (these )?steps:)/gi, "$1\n\n") // newline after instructions
      .replace(/\b(before you dive in:)/gi, "$1\n\n") // newline after "before you dive in:"
      .replace(/(\d+)\.\s*/g, "\n\n$1. ") // newline before numbered points
      .replace(/-\s+/g, "\n\n- ") // newline before bullet lists
      .replace(/\*\s+/g, "\n\n• ") // convert * bullets
      .replace(/\*/g, "") // remove leftover *
      .replace(/#+\s*/g, "") // remove markdown headers
      .replace(/\s{2,}/g, " ") // clean double spaces
      .trim();

    // 🧾 ALIGN MULTILINE PARAGRAPHS
    replyText = replyText
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join("\n\n");

    res.status(200).json({ success: true, reply: replyText });

  } catch (err) {
    console.error("Gemini API Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to get response from AI. Please check the network connection or API Key usage limits."
    });
  }
});


// ------------------ PROFILE DATA ROUTES ------------------

// GET Profile Data (Use GET with query param)
app.get("/profile-data", async (req, res) => {
  const { gmail } = req.query; // Changed to query param for GET
  if (!gmail) return res.status(400).json({ success: false, message: "Email query parameter required" });

  try {
    const user = await User.findOne({ $or: [{ gmail }, { email: gmail }] })
                        .select('-password -createdAt -updatedAt -__v'); // Exclude fields

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Return the fields the frontend expects
    res.json({
        success: true, // Indicate success
        full_name: user.full_name || "",
        mobile: user.mobile || "",
        address: user.address || "",
        country: user.country || "",
        state: user.state || "",
        pincode: user.pincode || ""
    });
  } catch (err) {
    console.error("Get profile data error:", err);
    res.status(500).json({ success: false, message: "Server error fetching profile" });
  }
});

// POST Update Profile
app.post("/update-profile", async (req, res) => {
  const { gmail, fullname, mobile, address, country, state, pincode } = req.body;
  if (!gmail) return res.status(400).json({ success: false, message: "Email required to update profile" });

  try {
    // Prepare update object, only including fields that are present
    const updateData = {};
    if (fullname !== undefined) updateData.full_name = fullname;
    if (mobile !== undefined) updateData.mobile = mobile;
    if (address !== undefined) updateData.address = address;
    if (country !== undefined) updateData.country = country;
    if (state !== undefined) updateData.state = state;
    if (pincode !== undefined) updateData.pincode = pincode;

    // Only update if there's something to update
    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ success: false, message: "No profile data provided to update." });
    }

    // Use findOneAndUpdate to find and update in one step
    const updatedUser = await User.findOneAndUpdate(
      { $or: [{ gmail: gmail }, { email: gmail }] }, // Find criteria
      { $set: updateData },                           // Update fields
      { new: false }                                  // Options (return old doc by default)
    );

    if (updatedUser) { // If a document was found and updated
      res.status(200).json({ success: true, message: "Profile updated successfully!" });
    } else {
      res.status(404).json({ success: false, message: "User not found, profile not updated" });
    }
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ success: false, message: "Server error updating profile" });
  }
});


// ------------------ START SERVER ------------------
async function startServer() {
  try {
    await connectDB(); // Ensure DB is connected before starting listener
    app.listen(port, () => {
      console.log(`Server URL: http://localhost:${port}
        Connected to database successfully
        `);
    });
  } catch (err) {
    // Error is already logged in connectDB
    console.error("Failed to start server due to DB connection issue.");
  }
}

// Handle graceful shutdown for Mongoose
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Shutting down gracefully...');
  try {
      await mongoose.connection.close();
      console.log(' MongoDB connection closed via Mongoose');
  } catch (err) {
      console.error(' Error closing MongoDB connection:', err);
  } finally {
      process.exit(0);
  }
});

startServer(); // Initialize DB connection and start Express server
