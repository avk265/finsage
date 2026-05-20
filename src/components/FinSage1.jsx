import React, { useEffect, useState } from 'react';

const FinSage1 = ({ onNavigateToDashboard, onNavigateToLogin, onNavigateToRegister, onLogout }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login status on mount and update state
  useEffect(() => {
    const checkLoginStatus = () => {
      const loggedIn = localStorage.getItem("loggedIn") === "true";
      setIsLoggedIn(loggedIn);
    };

    checkLoginStatus();

    // Prevent back navigation
    const preventBack = () => {
      window.history.pushState(null, null, window.location.href);
      window.history.go(1);
    };
    
    window.history.pushState(null, null, window.location.href);
    window.onpopstate = preventBack;

    return () => {
      window.onpopstate = null;
    };
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    console.log('Logging out from FinSage1...');
    localStorage.setItem("loggedIn", "false");
    localStorage.removeItem("loggedIngmail");
    
    // Update local state immediately
    setIsLoggedIn(false);
    
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="bg-gray-50 text-gray-800 font-sans min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-700">FinSage</h1>
          <nav className="space-x-6">
            {isLoggedIn ? (
              <>
                <a href="#" className="text-gray-700 hover:text-blue-600">Home</a>
                <a href="#features" className="text-gray-700 hover:text-blue-600">Features</a>
                <a href="#pricing" className="text-gray-700 hover:text-blue-600">Pricing</a>
                <button
                  onClick={onNavigateToDashboard}
                  className="text-gray-700 hover:text-blue-600 bg-transparent border-none cursor-pointer font-sans"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-blue-600 bg-transparent border-none cursor-pointer font-sans"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <a href="#" className="text-gray-700 hover:text-blue-600">Home</a>
                <a href="#features" className="text-gray-700 hover:text-blue-600">Features</a>
                <a href="#pricing" className="text-gray-700 hover:text-blue-600">Pricing</a>
                <button
                  onClick={onNavigateToLogin}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Login
                </button>
                <button
                  onClick={onNavigateToRegister}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold"
                >
                  Register
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="text-center py-24 px-6 bg-gradient-to-r from-blue-50 to-blue-100">
        <h2 className="text-4xl md:text-5xl font-extrabold text-blue-800">Smart Financial Assistant</h2>
        <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
          Track your expenses, receive budget alerts, and get intelligent financial advice — all in one platform.
        </p>
        {isLoggedIn ? (
          <div className="mt-8">
            <button
              onClick={onNavigateToDashboard}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold shadow"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="mt-8 space-x-4">
            <button
              onClick={onNavigateToLogin}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold shadow"
            >
              Get Started
            </button>
            <button
              onClick={onNavigateToRegister}
              className="bg-white hover:bg-gray-100 text-blue-600 px-6 py-3 rounded-full font-semibold shadow border-2 border-blue-600"
            >
              Sign Up Free
            </button>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
          <h3 className="text-xl font-semibold text-blue-700">Expense Tracker</h3>
          <p className="mt-2 text-gray-600">Automatically categorize and track your spending in real time.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
          <h3 className="text-xl font-semibold text-blue-700">Budget Planner</h3>
          <p className="mt-2 text-gray-600">Set monthly goals, receive alerts, and stay financially disciplined.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
          <h3 className="text-xl font-semibold text-blue-700">Smart Insights</h3>
          <p className="mt-2 text-gray-600">Get AI-powered tips and predictions based on your spending habits.</p>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-12">Choose Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition">
            <h3 className="text-2xl font-semibold text-blue-700">Free</h3>
            <p className="text-4xl font-bold my-4">₹0<span className="text-lg text-gray-500">/month</span></p>
            <ul className="space-y-2 text-gray-600">
              <li>✓ Basic expense tracking</li>
              <li>✓ Monthly reports</li>
              <li>✓ Budget alerts</li>
            </ul>
          </div>
          <div className="bg-blue-600 text-white p-8 rounded-xl shadow-xl transform scale-105">
            <h3 className="text-2xl font-semibold">Pro</h3>
            <p className="text-4xl font-bold my-4">₹299<span className="text-lg">/month</span></p>
            <ul className="space-y-2">
              <li>✓ Everything in Free</li>
              <li>✓ AI-powered insights</li>
              <li>✓ Custom categories</li>
              <li>✓ Priority support</li>
            </ul>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition">
            <h3 className="text-2xl font-semibold text-blue-700">Enterprise</h3>
            <p className="text-4xl font-bold my-4">₹999<span className="text-lg text-gray-500">/month</span></p>
            <ul className="space-y-2 text-gray-600">
              <li>✓ Everything in Pro</li>
              <li>✓ Team collaboration</li>
              <li>✓ Advanced analytics</li>
              <li>✓ Dedicated support</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-6 text-center text-sm text-gray-500">
        &copy; 2025 FinSage. All rights reserved.
      </footer>
    </div>
  );
};

export default FinSage1;