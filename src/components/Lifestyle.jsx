import React, { useState } from 'react';
import { useGmail } from '../GmailContext';

const LifestyleBudgeting = ({ onNavigateBack }) => {
  const gmail = useGmail();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    weekendPreference: '',
    hobbies: [],
    savingsGoal: ''
  });
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userArchetype, setUserArchetype] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [budgetPlan, setBudgetPlan] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;

  const archetypes = {
    explorer: {
      name: "The Explorer",
      icon: "🗺️",
      description: "You thrive on new experiences, travel, and adventure.",
      adjustments: { entertainment: 1.5, transportation: 1.3, food: 1.1, savings: 0.9 }
    },
    homebody: {
      name: "The Homebody",
      icon: "🏡",
      description: "You find comfort and joy in your personal space.",
      adjustments: { otherExpenses: 1.4, food: 1.2, entertainment: 0.8, transportation: 0.7 }
    },
    socialite: {
      name: "The Socialite",
      icon: "🥂",
      description: "You're energized by social connections and events.",
      adjustments: { entertainment: 1.6, food: 1.4, transportation: 1.2, savings: 0.8 }
    },
    creator: {
      name: "The Creator",
      icon: "🎨",
      description: "You are driven by your passions and creative pursuits.",
      adjustments: { otherExpenses: 1.5, entertainment: 1.2, savings: 1.1, food: 0.9 }
    }
  };

  const categoryEmojis = {
    rent: '🏠',
    food: '🍔',
    transportation: '🚗',
    entertainment: '🎬',
    healthcare: '❤️‍🩹',
    savings: '💰',
    otherExpenses: '🛍️'
  };

  const fetchUserData = async () => {
    const response = await fetch(`/api/user-data?email=${encodeURIComponent(gmail)}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`No financial data found for user: ${gmail}`);
      }
      throw new Error("Failed to fetch user data from the server.");
    }
    return await response.json();
  };

  const saveLifestyleBudget = async (gmail, archetype, budgetPlan) => {
    try {
      const payload = {
        gmail,
        weekendPreference: formData.weekendPreference,
        hobbies: formData.hobbies,
        savingsGoal: formData.savingsGoal,
        archetype: {
          name: archetype.name,
          icon: archetype.icon,
          description: archetype.description
        },
        budgetPlan
      };

      const response = await fetch('http://localhost:3000/save-lifestyle-budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setSaveStatus('✅ Budget saved successfully!');
        setTimeout(() => setSaveStatus(''), 5000);
      } else {
        const errorMsg = result.message || 'Failed to save budget';
        setSaveStatus(` ${errorMsg}`);
        setTimeout(() => setSaveStatus(''), 5000);
      }
    } catch (error) {
      setSaveStatus(` Network error: ${error.message}`);
      setTimeout(() => setSaveStatus(''), 5000);
    }
  };

  const handleWeekendChange = (value) => {
    setFormData(prev => ({ ...prev, weekendPreference: value }));
  };

  const handleHobbyChange = (value) => {
    setFormData(prev => {
      const hobbies = prev.hobbies.includes(value)
        ? prev.hobbies.filter(h => h !== value)
        : [...prev.hobbies, value];
      return { ...prev, hobbies };
    });
  };

  const validateForm = () => {
    if (!formData.weekendPreference || formData.hobbies.length === 0 || !formData.savingsGoal.trim()) {
      setFormError("Please answer all questions to proceed.");
      return false;
    }
    setFormError('');
    return true;
  };

  const handleAnalyze = async () => {
    if (!validateForm()) return;

    setCurrentStep(2);
    setIsLoading(true);

    try {
      if (!gmail) {
        throw new Error("You are not logged in. Please sign in to create a budget.");
      }
      const userData = await fetchUserData();
      setCurrentUserData(userData);

      const userSummary = `
        My preferred weekend activity is ${formData.weekendPreference}. 
        My hobbies include ${formData.hobbies.join(', ')}. 
        I am currently saving for ${formData.savingsGoal}.
      `;

      const systemPrompt = "Analyze the following user interests and classify them into one of the four archetypes: 'explorer', 'homebody', 'socialite', or 'creator'. Respond with only the single lowercase archetype key and nothing else.";

      const payload = {
        contents: [{ parts: [{ text: userSummary }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] }
      };

      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const result = await response.json();
      const archetypeKey = result.candidates?.[0]?.content?.parts?.[0]?.text.trim().toLowerCase();

      if (archetypeKey && archetypes[archetypeKey]) {
        setUserArchetype(archetypes[archetypeKey]);
        setIsLoading(false);
      } else {
        throw new Error("Could not determine a valid archetype from the AI's response.");
      }
    } catch (error) {
      setCurrentStep(1);
      setFormError(`Error: ${error.message}`);
      setIsLoading(false);
    }
  };

  const createPersonalizedBudget = (userData, archetype) => {
    const baseBudget = {
      rent: userData.rent,
      food: userData.food,
      transportation: userData.transportation,
      entertainment: userData.entertainment,
      healthcare: userData.healthcare,
      savings: userData.savings,
      otherExpenses: userData.otherExpenses
    };

    const adjustedBudget = { ...baseBudget };
    for (const category in archetype.adjustments) {
      if (adjustedBudget[category]) {
        adjustedBudget[category] = Math.round(baseBudget[category] * archetype.adjustments[category]);
      }
    }

    let newTotalSpent = Object.keys(adjustedBudget)
      .filter(k => k !== 'savings')
      .reduce((sum, key) => sum + adjustedBudget[key], 0);
    adjustedBudget.savings = userData.totalEarnings - newTotalSpent;

    return {
      totalEarnings: userData.totalEarnings,
      plan: adjustedBudget
    };
  };

  const handleCreateBudget = async () => {
    if (!currentUserData || !userArchetype) {
      alert("Error: User data or archetype is missing. Please start over.");
      return;
    }
    const budget = createPersonalizedBudget(currentUserData, userArchetype);
    setBudgetPlan(budget);
    setCurrentStep(3);

    if (gmail) {
      await saveLifestyleBudget(gmail, userArchetype, budget);
    }
  };

  const handleStartOver = () => {
    setCurrentStep(1);
    setFormData({ weekendPreference: '', hobbies: [], savingsGoal: '' });
    setUserArchetype(null);
    setCurrentUserData(null);
    setBudgetPlan(null);
    setFormError('');
    setSaveStatus('');
  };


  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6">

        <div className="w-full max-w-2xl mx-auto relative">
          {/* Save Status Notification */}
          {saveStatus && (
            <div className="fixed top-4 right-4 bg-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
              <p className="text-sm font-semibold">{saveStatus}</p>
            </div>
          )}

          {/* Step 1: Interests */}
          {currentStep === 1 && (
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Your Lifestyle Budget</h2>
              <p className="text-gray-500 mb-6">Answer a few questions to help us understand what matters to you.</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-md font-semibold text-gray-700 mb-2">
                    How do you prefer to spend a free weekend?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { id: 'traveling to new places', label: '🗺️ Traveling' },
                      { id: 'relaxing at home', label: '🏡 Staying Home' },
                      { id: 'going out with friends', label: '🥂 Socializing' },
                      { id: 'working on a creative project', label: '🎨 Hobby Project' }
                    ].map(option => (
                      <div
                        key={option.id}
                        onClick={() => handleWeekendChange(option.id)}
                        className={`p-4 rounded-lg border-2 cursor-pointer text-center transition-all ${
                          formData.weekendPreference === option.id
                            ? 'border-blue-700 bg-green-50 text-blue-700 font-semibold'
                            : 'border-gray-200 hover:border-blue-400'
                        }`}
                      >
                        {option.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-md font-semibold text-gray-700 mb-2">
                    Which hobbies or activities do you enjoy? (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'outdoors and hiking', label: '🌲 Outdoors' },
                      { id: 'video games', label: '🎮 Gaming' },
                      { id: 'cooking and baking', label: '🍳 Cooking' },
                      { id: 'art and design', label: '🖌️ Art/Design' },
                      { id: 'dining out', label: '🍜 Dining Out' },
                      { id: 'movies and streaming', label: '🎬 Movies' }
                    ].map(hobby => (
                      <div
                        key={hobby.id}
                        onClick={() => handleHobbyChange(hobby.id)}
                        className={`p-4 rounded-lg border-2 cursor-pointer text-center transition-all ${
                          formData.hobbies.includes(hobby.id)
                            ? 'border-blue-700 bg-green-50 text-blue-700 font-semibold'
                            : 'border-gray-200 hover:border-blue-400'
                        }`}
                      >
                        {hobby.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="savings-goal" className="block text-md font-semibold text-gray-700 mb-2">
                    What is one big thing you are currently saving for?
                  </label>
                  <input
                    type="text"
                    id="savings-goal"
                    value={formData.savingsGoal}
                    onChange={(e) => setFormData(prev => ({ ...prev, savingsGoal: e.target.value }))}
                    className="w-full px-4 py-3 text-gray-700 bg-gray-100 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., A trip to Japan, a new laptop, a down payment..."
                  />
                </div>
              </div>

              {formError && (
                <div className="text-red-500 text-sm mt-4 text-center">{formError}</div>
              )}

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleAnalyze}
                  className="flex-1 px-8 py-3 font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                >
                  Analyze My Lifestyle
                </button>
                <button
                  onClick={onNavigateBack}
                  className="px-8 py-3 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors duration-200"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Archetype Discovery */}
          {currentStep === 2 && (
            <div className="w-full">
              {isLoading ? (
                <div className="text-center py-10">
                  <div className="flex flex-col justify-center items-center">
                    <svg className="animate-spin h-10 w-10 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="mt-4 text-gray-600 text-xl font-medium">Analyzing your interests...</span>
                    <p className="text-gray-500 mt-2">Our AI is crafting your financial archetype.</p>
                  </div>
                </div>
              ) : (
                <div className="text-center bg-white p-8 rounded-xl shadow-lg">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">We've discovered your archetype!</h2>
                  <p className="text-gray-500 mb-6">Based on your answers, here is your lifestyle pattern.</p>
                  <div className="p-6 bg-green-50 rounded-lg inline-block">
                    <div className="w-24 h-24 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center text-5xl">
                      {userArchetype?.icon}
                    </div>
                    <h3 className="text-3xl font-bold text-green-700">{userArchetype?.name}</h3>
                    <p className="text-gray-600 mt-4 max-w-md mx-auto">{userArchetype?.description}</p>
                  </div>
                  <button
                    onClick={handleCreateBudget}
                    className="block w-full sm:w-auto mx-auto mt-8 px-8 py-3 font-semibold text-white bg-green-700 rounded-lg hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                  >
                    Create My Budget Plan
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Personalized Budget */}
          {currentStep === 3 && budgetPlan && (
            <div className="w-full">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Your AI-Generated Budget Plan</h2>
                <p className="text-gray-500">
                  A budget tailored to your <span className="font-bold text-green-600">{userArchetype?.name}</span> lifestyle.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(budgetPlan.plan).map(([category, amount]) => {
                  if (amount < 0) return null;
                  const percentage = Math.max(0, (amount / budgetPlan.totalEarnings) * 100).toFixed(1);
                  const emoji = categoryEmojis[category] || '💵';
                  
                  return (
                    <div key={category} className="bg-white rounded-xl shadow-lg p-5 flex flex-col transition-all duration-300 hover:shadow-xl hover:scale-105">
                      <div className="flex items-center mb-3">
                        <span className="text-3xl mr-3">{emoji}</span>
                        <div>
                          <h3 className="font-bold text-lg text-gray-800 capitalize">
                            {category.replace(/([A-Z])/g, ' $1')}
                          </h3>
                          <p className="text-2xl font-bold text-green-600">
                            ₹{amount.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                      <div className="mt-auto">
                        <p className="text-sm text-gray-500 text-right mb-1">{percentage}% of earnings</p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-green-500 h-2.5 rounded-full transition-all duration-1000"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-4 justify-center mt-8">
                <button
                  onClick={handleStartOver}
                  className="px-8 py-3 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors duration-200"
                >
                  Start Over
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LifestyleBudgeting;