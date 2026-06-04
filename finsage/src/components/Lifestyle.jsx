import React, { useState } from 'react';
import { useGmail } from '../GmailContext';

const LifestyleBudgeting = ({ onNavigateBack }) => {
  const gmail = useGmail();

  const [formData, setFormData] = useState({
    weekendPreference: '',
    hobbies: [],
    savingsGoal: ''
  });
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userArchetype, setUserArchetype] = useState(null);
  const [budgetPlan, setBudgetPlan] = useState(null);
  const [insights, setInsights] = useState([]);
  const [saveStatus, setSaveStatus] = useState('');

  const categoryEmojis = {
    rent: 'Home',
    food: 'Food',
    transportation: 'Transport',
    entertainment: 'Fun',
    healthcare: 'Health',
    savings: 'Savings',
    otherExpenses: 'Other'
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
      setFormError('Please answer all questions to proceed.');
      return false;
    }
    setFormError('');
    return true;
  };

  const handleAnalyze = async () => {
    if (!validateForm()) return;
    if (!gmail) {
      setFormError('You are not logged in. Please sign in to create a budget.');
      return;
    }

    setIsLoading(true);
    setBudgetPlan(null);
    setUserArchetype(null);
    setInsights([]);

    try {
      const response = await fetch('http://localhost:3000/lifestyle-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gmail,
          weekendPreference: formData.weekendPreference,
          hobbies: formData.hobbies,
          savingsGoal: formData.savingsGoal,
          save: true
        })
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to create lifestyle budget.');
      }

      setUserArchetype(result.archetype);
      setBudgetPlan(result.budgetPlan);
      setInsights(result.insights || []);
      setSaveStatus(`Budget saved successfully with ${result.provider || 'ollama'}!`);
      setTimeout(() => setSaveStatus(''), 5000);
    } catch (error) {
      setFormError(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setFormData({ weekendPreference: '', hobbies: [], savingsGoal: '' });
    setUserArchetype(null);
    setBudgetPlan(null);
    setInsights([]);
    setFormError('');
    setSaveStatus('');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-2xl mx-auto relative">
          {saveStatus && (
            <div className="fixed top-4 right-4 bg-white px-6 py-3 rounded-lg shadow-lg z-50">
              <p className="text-sm font-semibold">{saveStatus}</p>
            </div>
          )}

          {!budgetPlan && (
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Your Lifestyle Budget</h2>
              <p className="text-gray-500 mb-6">Answer a few questions. Ollama will predict a new budget plan using your financial context.</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-md font-semibold text-gray-700 mb-2">
                    How do you prefer to spend a free weekend?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { id: 'traveling to new places', label: 'Traveling' },
                      { id: 'relaxing at home', label: 'Staying Home' },
                      { id: 'going out with friends', label: 'Socializing' },
                      { id: 'working on a creative project', label: 'Hobby Project' }
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
                    Which hobbies or activities do you enjoy?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'outdoors and hiking', label: 'Outdoors' },
                      { id: 'video games', label: 'Gaming' },
                      { id: 'cooking and baking', label: 'Cooking' },
                      { id: 'art and design', label: 'Art/Design' },
                      { id: 'dining out', label: 'Dining Out' },
                      { id: 'movies and streaming', label: 'Movies' }
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
                    placeholder="e.g., A trip, a new laptop, a down payment..."
                  />
                </div>
              </div>

              {formError && <div className="text-red-500 text-sm mt-4 text-center">{formError}</div>}

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="flex-1 px-8 py-3 font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 disabled:bg-gray-400 transition-colors duration-200"
                >
                  {isLoading ? 'Asking Ollama...' : 'Generate Budget With Ollama'}
                </button>
                <button
                  onClick={onNavigateBack}
                  className="px-8 py-3 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {budgetPlan && (
            <div className="w-full">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Your Ollama-Generated Budget Plan</h2>
                <p className="text-gray-500">
                  A predicted budget tailored to your <span className="font-bold text-green-600">{userArchetype?.name}</span> lifestyle.
                </p>
                {userArchetype?.description && (
                  <p className="text-gray-600 mt-3 max-w-xl mx-auto">{userArchetype.description}</p>
                )}
              </div>

              {insights.length > 0 && (
                <div className="bg-white rounded-xl shadow p-5 mb-6">
                  <h3 className="font-bold text-lg mb-2">Insights</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {insights.map((item, index) => <li key={index}>{item}</li>)}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(budgetPlan.plan).map(([category, amount]) => {
                  if (amount < 0) return null;
                  const percentage = Math.max(0, (amount / budgetPlan.totalEarnings) * 100).toFixed(1);
                  const label = categoryEmojis[category] || category;
                  return (
                    <div key={category} className="bg-white rounded-xl shadow-lg p-5 flex flex-col">
                      <div className="flex items-center mb-3">
                        <span className="text-sm font-bold mr-3 text-gray-500">{label}</span>
                        <div>
                          <h3 className="font-bold text-lg text-gray-800 capitalize">
                            {category.replace(/([A-Z])/g, ' $1')}
                          </h3>
                          <p className="text-2xl font-bold text-green-600">
                            INR {Number(amount).toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                      <div className="mt-auto">
                        <p className="text-sm text-gray-500 text-right mb-1">{percentage}% of earnings</p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-4 justify-center mt-8">
                <button
                  onClick={handleStartOver}
                  className="px-8 py-3 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200"
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
