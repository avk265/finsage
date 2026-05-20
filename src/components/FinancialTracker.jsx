import React, { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingUp,
  Target,
  Flame,
  Calendar,
  DollarSign,
  Loader,
} from 'lucide-react';
import { useGmail } from '../GmailContext';

const BASE_URL = 'http://localhost:3000';

const FinancialTracker = () => {
  const userGmail = useGmail();
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({
    goalName: '',
    targetAmount: '',
    startDate: '',
    endDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [streaks, setStreaks] = useState({ expense: 0, saving: 0 });
  const [dailyStreakList, setDailyStreakList] = useState([]);

  // Fetch goals and expenses to calculate streaks & daily timeline
  const fetchGoals = async () => {
    if (!userGmail) {
      setError('User Gmail is missing. Please log in.');
      setGoals([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BASE_URL}/get-financial-goals/${userGmail}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to fetch goals');
      }
      const data = await res.json();
      setGoals(data);
      calculateStreaksAndDailyList(data);
    } catch (err) {
      setError(err.message);
      setGoals([]);
      setStreaks({ expense: 0, saving: 0 });
      setDailyStreakList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [userGmail]);

  // Add new financial goal
  const handleAddGoal = async () => {
    const { goalName, targetAmount, startDate, endDate } = newGoal;
    if (!goalName || !targetAmount || !startDate || !endDate) {
      alert('Please fill in all fields to add a goal.');
      return;
    }
    if (!userGmail) {
      alert('User Gmail missing. Please login.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/set-financial-goal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gmail: userGmail,
          goalName,
          targetAmount: Number(targetAmount),
          startDate,
          endDate,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || 'Failed to add goal.');
      } else {
        alert(data.message || 'Goal added successfully.');
        setNewGoal({ goalName: '', targetAmount: '', startDate: '', endDate: '' });
        fetchGoals();
      }
    } catch (err) {
      alert('Error adding goal: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update progress entered for a goal
  const updateProgress = async (goalName, amount, setLocalLoading, refresh) => {
    setLocalLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/update-financial-progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gmail: userGmail,
          goalName,
          amount,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || 'Failed to update progress');
      } else {
        alert('Progress updated successfully!');
        refresh();
      }
    } catch (err) {
      alert('Error updating progress: ' + err.message);
    } finally {
      setLocalLoading(false);
    }
  };

  // Calculate streaks and daily timeline
  const calculateStreaksAndDailyList = (goalsData) => {
    if (!goalsData || goalsData.length === 0) {
      setStreaks({ expense: 0, saving: 0 });
      setDailyStreakList([]);
      return;
    }
    const expensesByDate = new Map();
    let earliestDate = null;
    goalsData.forEach(goal => {
      if (goal.expenses && Array.isArray(goal.expenses)) {
        goal.expenses.forEach(exp => {
          if (exp.date && typeof exp.amount === 'number') {
            const dateStr = exp.date.split('T')[0];
            expensesByDate.set(dateStr, (expensesByDate.get(dateStr) || 0) + exp.amount);
            const expDate = new Date(dateStr);
            if (!earliestDate || expDate < earliestDate) earliestDate = expDate;
          }
        });
      }
    });
    if (!earliestDate) earliestDate = new Date();
    earliestDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let expenseStreak = 0;
    let currentDate = new Date(today);
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (expensesByDate.has(dateStr)) {
        expenseStreak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else break;
      if (expenseStreak > 730) break;
    }

    const totalTarget = goalsData.reduce((sum, g) => sum + (g.targetAmount || 0), 0);
    const dailyBudget = totalTarget > 0 ? totalTarget / 30 : Infinity;
    let savingStreak = 0;
    currentDate = new Date(today);
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayExpense = expensesByDate.get(dateStr) || 0;
      if (dayExpense <= dailyBudget) {
        savingStreak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else break;
      if (savingStreak > 730) break;
    }
    setStreaks({ expense: expenseStreak, saving: savingStreak });

    const dayList = [];
    for (let d = new Date(earliestDate); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const amount = expensesByDate.get(dateStr) || 0;
      let status = 'no-expense';
      if (amount > 0) {
        status = amount <= dailyBudget ? 'within-budget' : 'over-budget';
      }
      dayList.push({ date: dateStr, amount, status });
    }
    setDailyStreakList(dayList);
  };

  const totalTarget = goals.reduce((sum, g) => sum + (g.targetAmount || 0), 0);
  const totalCurrent = goals.reduce((sum, g) => sum + (g.currentAmount || 0), 0);
  const savingProgress = totalTarget > 0 ? Math.min((totalCurrent / totalTarget) * 100, 100) : 0;

  if (loading && goals.length === 0)
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center">
        <Loader className="animate-spin text-indigo-600 mb-4" size={48} />
        <p className="text-gray-600">Loading Financial Tracker...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Financial Tracker</h1>
        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        <div className="bg-white p-6 rounded-xl shadow-md max-w-md mx-auto mb-12">
          <h2 className="text-xl font-semibold mb-4">Add New Financial Goal</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Goal Name (e.g., Vacation Fund)"
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-300 outline-none"
              value={newGoal.goalName}
              onChange={(e) => setNewGoal({ ...newGoal, goalName: e.target.value })}
            />
            <input
              type="number"
              placeholder="Target Amount (e.g., 50000)"
              className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-300 outline-none"
              value={newGoal.targetAmount}
              onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
            />
            <div className="flex gap-4">
              <label className="w-1/2 text-sm text-gray-500">
                Start Date:
                <input
                  type="date"
                  className="w-full border rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-300 outline-none"
                  value={newGoal.startDate}
                  onChange={(e) => setNewGoal({ ...newGoal, startDate: e.target.value })}
                />
              </label>
              <label className="w-1/2 text-sm text-gray-500">
                End Date:
                <input
                  type="date"
                  className="w-full border rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-300 outline-none"
                  value={newGoal.endDate}
                  onChange={(e) => setNewGoal({ ...newGoal, endDate: e.target.value })}
                />
              </label>
            </div>
            <button
              onClick={handleAddGoal}
              disabled={loading}
              className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 w-full disabled:opacity-50 transition-colors"
            >
              {loading ? 'Adding...' : 'Add Goal'}
            </button>
          </div>
        </div>

        {/* Financial Streak Card */}
        <div
          className="rounded-2xl shadow-lg p-6 text-white max-w-md mx-auto mb-10"
          style={{
            background: 'linear-gradient(135deg, #f97316, #ec4899)',
            boxShadow: '0 4px 15px rgba(236, 72, 153, 0.4)',
          }}
          title="Your financial consistency shown as consecutive days of expense and saving discipline."
        >
          <div className="flex items-center gap-2 mb-4">
            <Flame size={28} />
            <h3 className="text-xl font-semibold">Financial Streaks</h3>
          </div>
          <p className="text-sm text-white/90 mb-4">
            Consecutive days ending today reflecting your financial consistency.
          </p>
          <div className="space-y-4 mb-4">
            <div
              className="rounded-lg p-4 flex items-center justify-between cursor-default"
              style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)' }}
              title="Number of consecutive days you had expense activity."
            >
              <div className="flex items-center gap-3">
                <Calendar size={24} />
                <span className="font-semibold text-lg">Expense Tracking</span>
              </div>
              <div className="text-4xl font-bold drop-shadow-lg" style={{ animation: 'glow 2.5s infinite ease-in-out' }}>
                {streaks.expense}
              </div>
            </div>
            
          </div>
          
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-indigo-100 flex items-center gap-4">
            <Wallet className="text-indigo-600" size={36} />
            <div>
              <div className="font-semibold text-gray-700">Total Target Amount</div>
              <div className="text-3xl font-bold text-indigo-600">₹{totalTarget.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100 flex items-center gap-4">
            <TrendingUp className="text-green-600" size={36} />
            <div>
              <div className="font-semibold text-gray-700">Current Saved Amount</div>
              <div className="text-3xl font-bold text-green-600">₹{totalCurrent.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100 flex items-center gap-4">
            <Target className="text-purple-600" size={36} />
            <div>
              <div className="font-semibold text-gray-700">Overall Progress</div>
              <div className="text-3xl font-bold text-purple-600">{savingProgress.toFixed(1)}%</div>
            </div>
          </div>
        </div>

        {/* Goals List */}
        <div>
          <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">Your Goals</h2>
          {goals.length === 0 && !loading ? (
            <p className="text-center text-gray-600">No financial goals set yet. Add one above to get started!</p>
          ) : (
            goals.map((goal, idx) => {
              const progressPercent = Math.min(
                ((goal.currentAmount || 0) / (goal.targetAmount || 1)) * 100,
                100
              );
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const start = new Date(goal.startDate);
              start.setHours(0, 0, 0, 0);
              const end = new Date(goal.endDate);
              end.setHours(0, 0, 0, 0);
              const active = today >= start && today <= end;
              const completed = (goal.currentAmount || 0) >= (goal.targetAmount || 1);

              return (
                <div
                  key={goal._id || idx}
                  className="bg-white shadow rounded-xl p-5 mb-6 max-w-xl mx-auto border-l-4"
                  style={{ borderColor: active ? '#4ade80' : '#f87171' }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-xl text-gray-800">{goal.goalName}</h3>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        completed
                          ? 'bg-green-100 text-green-700'
                          : active
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {completed ? 'Completed' : active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm mb-2 text-gray-600">
                    <span>Saved: ₹{(goal.currentAmount || 0).toLocaleString('en-IN')}</span>
                    <span>Target: ₹{(goal.targetAmount || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Duration: {new Date(goal.startDate).toLocaleDateString()} -{' '}
                    {new Date(goal.endDate).toLocaleDateString()}
                  </div>

                  {/* Update progress input */}
                  {active && !completed && (
                    <UpdateProgressInput
                      userGmail={userGmail}
                      goalName={goal.goalName}
                      onSuccess={fetchGoals}
                    />
                  )}

                  {completed && (
                    <p className="text-center text-green-600 font-semibold mt-4">🎉 Goal Achieved! 🎉</p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Glow animation style */}
      <style>
        {`
        @keyframes glow {
          0%, 100% {
            text-shadow: 0 0 8px rgba(236, 72, 153, 0.8);
          }
          50% {
            text-shadow: 0 0 12px rgba(236, 72, 153, 1);
          }
        }
        `}
      </style>
    </div>
  );
};

const UpdateProgressInput = ({ userGmail, goalName, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  const updateProgress = async () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert('Please enter a valid positive numeric amount');
      return;
    }
    setLoadingUpdate(true);
    try {
      const res = await fetch('http://localhost:3000/update-financial-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gmail: userGmail,
          goalName,
          amount: Number(amount),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || 'Failed to update progress');
      } else {
        alert('Progress updated successfully!');
        setAmount('');
        onSuccess();
      }
    } catch (err) {
      alert('Error updating progress: ' + err.message);
    } finally {
      setLoadingUpdate(false);
    }
  };

  return (
    <div className="flex gap-2 items-center mt-4 border-t pt-4">
      <input
        type="number"
        placeholder="Add Amount Saved"
        className="border p-2 rounded w-full focus:ring-2 focus:ring-green-300 outline-none"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={loadingUpdate}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            updateProgress();
          }
        }}
      />
      <button
        onClick={updateProgress}
        disabled={loadingUpdate}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 transition-colors whitespace-nowrap"
      >
        {loadingUpdate ? 'Updating...' : 'Add Progress'}
      </button>
    </div>
  );
};

export default FinancialTracker;
