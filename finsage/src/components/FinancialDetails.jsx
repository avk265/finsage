import React, { useState } from 'react';
import { useGmail } from "../GmailContext";

const FinancialDetails = ({ onNavigateBack }) => {
  // ADDED: month and year to formData state
  const [formData, setFormData] = useState(() => {
    const today = new Date();
    return {
      month: (today.getMonth() + 1).toString().padStart(2, '0'), // Current month (1-12)
      year: today.getFullYear().toString(),                       // Current year
      earnings: '',
      housing: '',
      food: '',
      transport: '',
      entertainment: '',
      healthcare: '',
      savings: '',
      other: ''
    };
  });

  const gmail = useGmail();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Helper function for month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper function to generate years
  const getYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 5; i--) { // Last 5 years including current
      years.push(i.toString());
    }
    return years;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!gmail) {
      setError('User not logged in! Please login again.');
      setLoading(false);
      return;
    }

    // Validate all required fields are filled, including month and year
    if (!formData.earnings || !formData.housing || !formData.food || 
        !formData.transport || !formData.entertainment || !formData.healthcare || 
        !formData.savings || !formData.month || !formData.year) {
      setError('Please fill in all required fields (marked with *)');
      setLoading(false);
      return;
    }

    // Validate positive numbers
    const values = [
      formData.earnings, formData.housing, formData.food, 
      formData.transport, formData.entertainment, formData.healthcare, 
      formData.savings
    ];
    if (values.some(val => Number(val) < 0)) {
      setError('All financial values must be positive numbers');
      setLoading(false);
      return;
    }

    // Construct finance data with month and year
    const financeData = {
      gmail,
      month: Number(formData.month),
      year: Number(formData.year),
      totalEarnings: Number(formData.earnings),
      rent: Number(formData.housing),
      food: Number(formData.food),
      transportation: Number(formData.transport),
      entertainment: Number(formData.entertainment),
      healthcare: Number(formData.healthcare),
      savings: Number(formData.savings),
      otherExpenses: Number(formData.other || 0)
    };

    try {
      const res = await fetch('http://localhost:3000/add-finance', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(financeData)
      });

      let result;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        result = await res.json();
      } else {
        const text = await res.text();
        setError('Server returned invalid response. Please check if the server is running properly.');
        setLoading(false);
        return;
      }

      if (res.ok && result.success) {
        alert('✅ ' + result.message);
        // Clear financial fields after successful submission, keep month/year
        setFormData(prev => ({
          ...prev,
          earnings: '',
          housing: '',
          food: '',
          transport: '',
          entertainment: '',
          healthcare: '',
          savings: '',
          other: ''
        }));
        onNavigateBack();
      } else {
        setError(result.message || 'Failed to save financial data');
      }
    } catch (err) {
      setError('Server connection error. Please ensure:\n1. Server is running on port 3000\n2. MongoDB is connected\n3. You are logged in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-3xl bg-white shadow-2xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">Financial Details</h1>
        <p className="text-center text-gray-600 mb-6">
          Please provide your monthly financial information. Fields marked with <span className="text-red-500">*</span> are required.
        </p>
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-red-500 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700 whitespace-pre-line">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ADDED: Month and Year Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Month <span className="text-red-500">*</span>
              </label>
              <select
                name="month"
                value={formData.month}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition appearance-none"
                required
              >
                {monthNames.map((month, index) => (
                  <option key={index} value={(index + 1).toString().padStart(2, '0')}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year <span className="text-red-500">*</span>
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition appearance-none"
                required
              >
                {getYears().map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* END OF ADDED MONTH/YEAR SECTION */}

          {/* Total Monthly Earnings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Monthly Earnings (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="earnings"
              value={formData.earnings}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition"
              placeholder="e.g., 50000"
              required
              min="0"
              step="1"
            />
          </div>

          {/* Monthly Rent / Housing */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Rent / Housing Costs (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="housing"
              value={formData.housing}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition"
              placeholder="e.g., 15000"
              required
              min="0"
              step="1"
            />
          </div>

          {/* Monthly Food & Groceries */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Food & Groceries Spending (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="food"
              value={formData.food}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition"
              placeholder="e.g., 8000"
              required
              min="0"
              step="1"
            />
          </div>

          {/* Monthly Transportation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Transportation Costs (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="transport"
              value={formData.transport}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition"
              placeholder="e.g., 3000"
              required
              min="0"
              step="1"
            />
          </div>

          {/* Monthly Entertainment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Entertainment / Leisure Spending (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="entertainment"
              value={formData.entertainment}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition"
              placeholder="e.g., 2000"
              required
              min="0"
              step="1"
            />
          </div>

          {/* Monthly Healthcare */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Healthcare / Insurance Costs (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="healthcare"
              value={formData.healthcare}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition"
              placeholder="e.g., 1000"
              required
              min="0"
              step="1"
            />
          </div>

          {/* Monthly Savings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Savings / Investments (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="savings"
              value={formData.savings}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition"
              placeholder="e.g., 5000"
              required
              min="0"
              step="1"
            />
          </div>

          {/* Other Monthly Expenses (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Other Monthly Expenses (₹) <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <input
              type="number"
              name="other"
              value={formData.other}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none transition"
              placeholder="e.g., 2000"
              min="0"
              step="1"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className={`${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
              } text-white px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium flex items-center space-x-2`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save & Return</span>
              )}
            </button>
            
            <button
              type="button"
              onClick={onNavigateBack}
              disabled={loading}
              className="bg-gray-300 hover:bg-gray-400 active:bg-gray-500 text-gray-800 px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> Accurate financial data helps us provide better budgeting recommendations and insights.
          </p>
        </div>
      </div>
      
    </div>
  );
};

export default FinancialDetails;