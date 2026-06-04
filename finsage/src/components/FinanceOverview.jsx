import React, { useEffect, useState } from 'react';
import { useGmail } from '../GmailContext';

const money = (value) => `INR ${Number(value || 0).toLocaleString('en-IN')}`;

const FinanceOverview = () => {
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
        const response = await fetch(`http://localhost:3000/api/finance-overview?email=${encodeURIComponent(gmail)}`);
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Could not load finance overview.');
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

  if (loading) return <div className="p-8 text-center">Loading finance overview...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!data) return null;

  const finance = data.finance || {};
  const categories = ['rent', 'food', 'transportation', 'entertainment', 'healthcare', 'otherExpenses'];

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800">Overall Financial Details</h1>
        <p className="text-gray-500 mt-1">Planned monthly finance, real categorized transactions, and current outcome.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Income</p>
          <p className="text-2xl font-bold text-green-600">{money(finance.totalEarnings)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Expenses</p>
          <p className="text-2xl font-bold text-red-600">{money(data.totalExpenses)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Calculated Savings</p>
          <p className="text-2xl font-bold text-blue-600">{money(data.calculatedSavings)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Savings Pool</p>
          <p className="text-2xl font-bold text-purple-600">{money(finance.savings)}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Category Outcome</h2>
        <div className="space-y-3">
          {categories.map((key) => (
            <div key={key} className="flex justify-between border-b pb-2">
              <span className="capitalize text-gray-700">{key.replace(/([A-Z])/g, ' $1')}</span>
              <span className="font-semibold">{money(finance[key])}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Transaction History</h2>
        {(!data.expenses || data.expenses.length === 0) ? (
          <p className="text-gray-500">No categorized transactions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Date</th>
                  <th>Category</th>
                  <th>Item</th>
                  <th>Payment</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.expenses.map((expense) => (
                  <tr key={expense._id} className="border-b">
                    <td className="py-2">{new Date(expense.date).toLocaleDateString()}</td>
                    <td>{expense.category}</td>
                    <td>{expense.item}</td>
                    <td>{expense.payment}</td>
                    <td className="text-right font-semibold">{money(expense.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinanceOverview;
