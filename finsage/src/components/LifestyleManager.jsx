import React, { useEffect, useState } from 'react';
import { useGmail } from '../GmailContext';

const money = (value) => `INR ${Number(value || 0).toLocaleString('en-IN')}`;

const LifestyleManager = () => {
  const gmail = useGmail();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!gmail) return;
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`http://localhost:3000/api/lifestyle-management/${encodeURIComponent(gmail)}`);
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Could not load lifestyle management.');
        }
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [gmail]);

  if (loading) return <div className="p-8 text-center">Loading lifestyle budgets...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!data) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800">Lifestyle Budget Management</h1>
        <p className="text-gray-500 mt-1">History of AI-predicted lifestyle budgets and whether the planned savings has been reached.</p>
        <p className="mt-3 text-sm font-semibold text-blue-700">Current calculated savings: {money(data.actualSavings)}</p>
      </div>

      {data.budgets.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-600">
          No lifestyle budgets created yet.
        </div>
      ) : (
        data.budgets.map((budget) => (
          <div key={budget._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 border-b pb-4 mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{budget.archetype?.name || 'Lifestyle Budget'}</h2>
                <p className="text-sm text-gray-500">Created {new Date(budget.createdAt).toLocaleString()}</p>
                <p className="text-sm text-gray-600 mt-1">Saving for: {budget.savingsGoal || 'Not specified'}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                budget.savingsAchieved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {budget.savingsAchieved
                  ? 'Savings target reached'
                  : `${money(budget.remainingToPlannedSavings)} still needed`}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs text-gray-500">Planned Savings</p>
                <p className="text-xl font-bold text-blue-700">{money(budget.plannedSavings)}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-xs text-gray-500">Actual Savings</p>
                <p className="text-xl font-bold text-green-700">{money(budget.actualSavings)}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-xs text-gray-500">Weekend Preference</p>
                <p className="text-sm font-semibold text-purple-700">{budget.weekendPreference}</p>
              </div>
            </div>

            <h3 className="font-bold text-gray-800 mb-3">Planned vs Actual Spending</h3>
            <div className="space-y-2">
              {Object.entries(budget.variance || {}).map(([key, value]) => (
                <div key={key} className="flex justify-between border-b pb-2 text-sm">
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className={value.exceeded ? 'text-red-600 font-semibold' : 'text-green-700 font-semibold'}>
                    actual {money(value.actual)} / planned {money(value.planned)}
                    {value.exceeded ? ' - exceeded' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default LifestyleManager;
