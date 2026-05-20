import React, { useState, useEffect } from 'react';
import { useGmail } from '../GmailContext';

// Robust JSON extractor: finds first valid JSON array in text
function extractJsonArray(raw) {
  // Find first "[" and last "]"
  const start = raw.indexOf("[");
  const end = raw.lastIndexOf("]");
  if (start > -1 && end > start) {
    try {
      return JSON.parse(raw.slice(start, end + 1));
    } catch (e) {
      // Malformed JSON
      return null;
    }
  }
  return null;
}

const Spinner = () => (
  <div className="flex justify-center items-center h-full my-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    <p className="ml-4 text-gray-600">Analyzing your financial profile...</p>
  </div>
);

const InvestmentHub = ({ onNavigateBack }) => {
  const gmail = useGmail();
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const PERPLEXITY_API_KEY = import.meta.env.VITE_PERPLEXITY_API_KEY;

  useEffect(() => {
    const getInvestmentSuggestions = async () => {
      if (!gmail) {
        setError("User not logged in.");
        setIsLoading(false);
        return;
      }
      if (!PERPLEXITY_API_KEY || PERPLEXITY_API_KEY === "YOUR_PERPLEXITY_API_KEY") {
        setError("API Key is missing. Please add your Perplexity API key.");
        setIsLoading(false);
        return;
      }

      try {
        // Fetch finance data from backend
        const financeResponse = await fetch(`http://localhost:3000/api/user-data?email=${encodeURIComponent(gmail)}`);
        if (!financeResponse.ok) {
          throw new Error('Could not fetch your financial data. Please add your financial details first.');
        }
        const financialData = await financeResponse.json();

        // Prompt construction
        const availableForInvestment = financialData.savings;
        const monthlyIncome = financialData.totalEarnings;
        const totalExpenses = financialData.rent + financialData.food + financialData.transportation + 
          financialData.entertainment + financialData.healthcare + financialData.otherExpenses;
        const savingsPercentage = ((availableForInvestment / monthlyIncome) * 100).toFixed(1);
        const currentDate = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

        // Make prompt more strict about valid JSON (no markdown/codetags/extra text)
        const prompt = `
You are analyzing this profile as of ${currentDate}.
Suggest 3-4 diverse investment options for an Indian investor. Respond ONLY with a pure JSON array on a single line (no markdown, no code blocks, no explanations).
Each array element must have these keys:
"name", "ticker", "currentPrice", "description", "riskLevel", "performance", "marketCap", "recommendedMonthlyAmount", "percentageOfSavings", "investmentRationale", "potentialRisks".
- Each "recommendedMonthlyAmount" must be a string like "INR 800", and the sum for all must NOT exceed INR ${availableForInvestment}.
- Provide up-to-date market data (realistic prices/performance as of ${currentDate}).
- Cover at least 2 risk levels ("Low", "Medium", "High").

Here's the user's profile:
Monthly Income: INR ${monthlyIncome}
Savings Available: INR ${availableForInvestment} (${savingsPercentage}% of income)
Expenses: rent: ${financialData.rent}, food: ${financialData.food}, transportation: ${financialData.transportation}, entertainment: ${financialData.entertainment}, healthcare: ${financialData.healthcare}, other: ${financialData.otherExpenses}
Total Expenses: INR ${totalExpenses}

Return ONLY the JSON array—no markdown/code formatting, no additional text.
        `.trim();

        const options = {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'sonar-pro',
            messages: [
              {
                role: 'system',
                content: 'You are an expert financial advisor AI. Respond ONLY with a valid, minified JSON array. Do NOT use code blocks or explanations.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.2,
            max_tokens: 2000
          })
        };

        const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', options);
        if (!perplexityResponse.ok) {
          const errorData = await perplexityResponse.json();
          throw new Error(`Perplexity API request failed [${perplexityResponse.status}]: ${JSON.stringify(errorData)}`);
        }
        const result = await perplexityResponse.json();
        const content = result.choices[0]?.message?.content;

        // Robust JSON parse: extract first JSON array from AI output 
        let parsedSuggestions = extractJsonArray(content || "");
        if (!parsedSuggestions || !Array.isArray(parsedSuggestions)) {
          throw new Error("Failed to parse AI JSON response. Content returned: " + content);
        }
        setSuggestions(parsedSuggestions);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    getInvestmentSuggestions();
  }, [gmail]);
  
  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!gmail) return <div className="p-10 text-center text-lg">Loading...</div>;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg animate-fadeIn">
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">AI Investment Advisor</h1>
      </div>

      <div className="text-center mb-6 bg-indigo-50 p-4 rounded-lg">
        <p className="text-gray-700 font-semibold">
          Based on your financial profile, our AI has generated personalized investment suggestions.
        </p>
        {!isLoading && !error && suggestions.length > 0 && (
          <div className="mt-3 p-3 bg-white rounded-lg border border-indigo-200">
            <p className="text-sm text-gray-600">
              <strong>Your Investment Capacity:</strong> ₹{suggestions.reduce((sum, item) => {
                const amount = item.recommendedMonthlyAmount?.match(/\d+/g)?.join('') || '0';
                return sum + parseInt(amount);
              }, 0).toLocaleString('en-IN')} per month allocated across {suggestions.length} investments
            </p>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-2">
          Disclaimer: This is not financial advice. Please consult with a professional before making any investment decisions.
        </p>
      </div>

      {isLoading && <Spinner />}
      {error && (
        <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg">
          <p className="font-bold text-lg mb-2">An Error Occurred</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      )}
      {!isLoading && !error && suggestions.length === 0 && (
        <div className="text-center text-gray-600 bg-gray-50 p-8 rounded-lg">
          <p className="text-lg">No investment suggestions available at this time.</p>
          <p className="text-sm mt-2">Please make sure you have added your financial details.</p>
        </div>
      )}
      {!isLoading && !error && suggestions.length > 0 && (
        <div className="space-y-6">
          {suggestions.map((item, index) => (
            <div key={index} className="border-2 border-gray-200 rounded-xl p-6 transition-all hover:shadow-lg hover:border-indigo-300 bg-gradient-to-br from-white to-gray-50">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h2 className="text-2xl font-bold text-indigo-700">{item.name}</h2>
                  {item.ticker && (
                    <p className="text-sm text-gray-500 font-mono mt-1">Ticker: {item.ticker}</p>
                  )}
                </div>
                <span className={`px-3 py-1 text-sm font-bold rounded-full border ${getRiskColor(item.riskLevel)}`}>
                  {item.riskLevel} Risk
                </span>
              </div>

              {/* Recommended Investment Amount - HIGHLIGHTED */}
              {item.recommendedMonthlyAmount && (
                <div className="mb-4 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-400">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-green-800 font-semibold mb-1">RECOMMENDED MONTHLY INVESTMENT</p>
                      <p className="text-2xl font-bold text-green-700">{item.recommendedMonthlyAmount}</p>
                      {item.percentageOfSavings && (
                        <p className="text-xs text-green-700 mt-1">({item.percentageOfSavings} of your monthly savings)</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">Annual Investment</p>
                      <p className="text-lg font-bold text-gray-700">
                        ₹{(parseInt(item.recommendedMonthlyAmount?.match(/\d+/g)?.join('') || '0') * 12).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Investment Rationale */}
              {item.investmentRationale && (
                <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-xs text-purple-800 font-semibold mb-1"> Why This Investment?</p>
                  <p className="text-sm text-gray-700">{item.investmentRationale}</p>
                </div>
              )}

              {/* Current Price & Market Info */}
              {(item.currentPrice || item.marketCap) && (
                <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-blue-50 rounded-lg">
                  {item.currentPrice && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Current Price</p>
                      <p className="text-lg font-bold text-blue-700">{item.currentPrice}</p>
                    </div>
                  )}
                  {item.marketCap && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Market Cap / AUM</p>
                      <p className="text-sm font-semibold text-gray-700">{item.marketCap}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Performance Metrics */}
              {item.performance && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs text-gray-600 mb-1 font-semibold">Recent Performance</p>
                  <p className="text-sm text-gray-700">{item.performance}</p>
                </div>
              )}

              {/* Description */}
              <p className="text-gray-600 mb-4 leading-relaxed">{item.description}</p>

              {/* Potential Risks */}
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  Potential Risks
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.potentialRisks}</p>
              </div>
            </div>
          ))}
          
          {/* Portfolio Summary */}
          <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border-2 border-indigo-300">
            <h3 className="text-xl font-bold text-indigo-800 mb-4 flex items-center">
              Your Monthly Investment Portfolio Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Total Monthly Investment</p>
                <p className="text-2xl font-bold text-indigo-700">
                  ₹{suggestions.reduce((sum, item) => {
                    const amount = item.recommendedMonthlyAmount?.match(/\d+/g)?.join('') || '0';
                    return sum + parseInt(amount);
                  }, 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Total Annual Investment</p>
                <p className="text-2xl font-bold text-green-700">
                  ₹{(suggestions.reduce((sum, item) => {
                    const amount = item.recommendedMonthlyAmount?.match(/\d+/g)?.join('') || '0';
                    return sum + parseInt(amount);
                  }, 0) * 12).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Number of Investments</p>
                <p className="text-2xl font-bold text-purple-700">{suggestions.length}</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Portfolio Diversification</p>
                <div className="flex gap-2 mt-2">
                  {suggestions.filter(s => s.riskLevel?.toLowerCase() === 'low').length > 0 && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                      {suggestions.filter(s => s.riskLevel?.toLowerCase() === 'low').length} Low Risk
                    </span>
                  )}
                  {suggestions.filter(s => s.riskLevel?.toLowerCase() === 'medium').length > 0 && (
                    <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                      {suggestions.filter(s => s.riskLevel?.toLowerCase() === 'medium').length} Medium
                    </span>
                  )}
                  {suggestions.filter(s => s.riskLevel?.toLowerCase() === 'high').length > 0 && (
                    <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                      {suggestions.filter(s => s.riskLevel?.toLowerCase() === 'high').length} High Risk
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Disclaimer Footer */}
          <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <p className="text-xs text-gray-700">
              <strong>Important:</strong> Stock prices and market data are subject to real-time changes. 
              The recommended investment amounts are based on your current financial profile and should be reviewed periodically.
              This information is for educational purposes only and should not be considered as financial advice. 
              Always conduct your own research and consult with a certified financial advisor before making investment decisions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentHub;