import React, { useEffect, useState } from 'react';
import { useGmail } from '../GmailContext';

const Spinner = () => (
  <div className="flex justify-center items-center h-full my-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    <p className="ml-4 text-gray-600">Analyzing your financial profile with Ollama...</p>
  </div>
);

const InvestmentHub = () => {
  const gmail = useGmail();
  const [suggestions, setSuggestions] = useState([]);
  const [provider, setProvider] = useState('');
  const [sources, setSources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const getInvestmentSuggestions = async () => {
      if (!gmail) {
        setError('User not logged in.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/investment-advice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gmail }),
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Could not generate investment advice.');
        }
        setSuggestions(result.suggestions || []);
        setProvider(result.provider || 'ollama');
        setSources(result.sources || []);
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
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const parseAmount = (value) => {
    const amount = value?.toString().match(/\d+/g)?.join('') || '0';
    return parseInt(amount, 10) || 0;
  };

  if (!gmail) return <div className="p-10 text-center text-lg">Loading...</div>;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg animate-fadeIn">
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">AI Investment Advisor</h1>
      </div>

      <div className="text-center mb-6 bg-indigo-50 p-4 rounded-lg">
        <p className="text-gray-700 font-semibold">
          Based on your financial profile, Ollama has generated personalized investment suggestions.
        </p>
        {provider && <p className="text-xs text-gray-500 mt-1">Provider: {provider}</p>}
        <p className="text-xs text-gray-500 mt-2">
          Disclaimer: This is not financial advice. Please consult with a professional before making investment decisions.
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
          <p className="text-sm mt-2">Please make sure you have added your financial details and Ollama is running.</p>
        </div>
      )}

      {!isLoading && !error && suggestions.length > 0 && (
        <div className="space-y-6">
          {suggestions.map((item, index) => (
            <div key={index} className="border-2 border-gray-200 rounded-xl p-6 transition-all hover:shadow-lg hover:border-indigo-300 bg-gradient-to-br from-white to-gray-50">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h2 className="text-2xl font-bold text-indigo-700">{item.name}</h2>
                  {item.ticker && <p className="text-sm text-gray-500 font-mono mt-1">Ticker: {item.ticker}</p>}
                </div>
                <span className={`px-3 py-1 text-sm font-bold rounded-full border ${getRiskColor(item.riskLevel)}`}>
                  {item.riskLevel || 'Unknown'} Risk
                </span>
              </div>

              {item.recommendedMonthlyAmount && (
                <div className="mb-4 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-400">
                  <p className="text-xs text-green-800 font-semibold mb-1">RECOMMENDED MONTHLY INVESTMENT</p>
                  <p className="text-2xl font-bold text-green-700">{item.recommendedMonthlyAmount}</p>
                  {item.percentageOfSavings && (
                    <p className="text-xs text-green-700 mt-1">({item.percentageOfSavings} of your monthly savings)</p>
                  )}
                </div>
              )}

              {item.currentPrice && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Current Price</p>
                  <p className="text-lg font-bold text-blue-700">{item.currentPrice}</p>
                </div>
              )}

              <p className="text-gray-600 mb-4 leading-relaxed">{item.description}</p>

              {item.investmentRationale && (
                <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-xs text-purple-800 font-semibold mb-1">Why this investment?</p>
                  <p className="text-sm text-gray-700">{item.investmentRationale}</p>
                </div>
              )}

              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h3 className="font-semibold text-gray-800 mb-2">Potential Risks</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.potentialRisks || 'Review risk before investing.'}</p>
              </div>
            </div>
          ))}

          <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border-2 border-indigo-300">
            <h3 className="text-xl font-bold text-indigo-800 mb-4">Monthly Investment Portfolio Summary</h3>
            <p className="text-2xl font-bold text-indigo-700">
              INR {suggestions.reduce((sum, item) => sum + parseAmount(item.recommendedMonthlyAmount), 0).toLocaleString('en-IN')}
            </p>
            <p className="text-sm text-gray-600 mt-1">allocated across {suggestions.length} investments</p>
          </div>

          {sources.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 border rounded-lg">
              <h3 className="font-bold text-gray-800 mb-2">RAG Sources</h3>
              <ul className="text-xs text-gray-600 space-y-1">
                {sources.map((source, index) => (
                  <li key={index}>{source.title || source.url || 'Source'}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InvestmentHub;
