import React, { useState, useEffect } from "react";
import { useGmail } from "../GmailContext";
import AutoCategorization from "./AutoCategorization";
import FinancialTracker from "./FinancialTracker";
import InvestmentHub from "./InvestmentHub";
import PeerComparison from "./PeerComparison";
import LifestyleBudgeting from "./Lifestyle";
import LifestyleManager from "./LifestyleManager";
import FinanceOverview from "./FinanceOverview";
import FinancialDetails from "./FinancialDetails";
import Profile from "./Profile"; // Correctly imported
import ReactMarkdown from "react-markdown";

// --- (Sidebar data is unchanged) ---
const sidebarActions = [
  { 
    key: "dashboard", 
    label: "Dashboard",
    iconClass: 'lni-grid-alt',
    click: (setCurrentView) => setCurrentView("dashboard")
  },
  { 
    key: "addFinancial", 
    label: "Add Financial Details", 
    iconClass: 'lni-bar-chart',
    click: (setCurrentView) => setCurrentView("addFinancial")
  },
  {
    key: "financeOverview",
    label: "Financial Details Overview",
    iconClass: 'lni-stats-up',
    click: (setCurrentView) => setCurrentView("financeOverview")
  },
  { 
    key: "investmentHub", 
    label: "AI Investment Advisor", 
    iconClass: 'lni-rocket',
    click: (setCurrentView) => setCurrentView("investmentHub")
  },
  { 
    key: "financialTracker", 
    label: "Financial Streaks",
    iconClass: 'lni-game',
    click: (setCurrentView) => setCurrentView("financialTracker")
  },
  { 
    key: "chatbot", 
    label: "AI Chatbot",
    iconClass: 'lni-bubble',
    click: (setCurrentView) => setCurrentView("chatbot")
  },
  { 
    key: "autoCat", 
    label: "Automated Categorization",
    iconClass: 'lni-android',
    click: (setCurrentView) => setCurrentView("autoCat")
  },
  { 
    key: "lifestyle", 
    label: "Create Lifestyle Budget",
    iconClass: 'lni-shopping-basket',
    click: (setCurrentView) => setCurrentView("lifestyle")
  },
  {
    key: "lifestyleManager",
    label: "Manage Lifestyle Budgets",
    iconClass: 'lni-list',
    click: (setCurrentView) => setCurrentView("lifestyleManager")
  },
  { 
    key: "peerComparison", 
    label: "Peer Comparison",
    iconClass: 'lni-users',
    click: (setCurrentView) => setCurrentView("peerComparison")
  }
];

// --- (Helper components are unchanged) ---
const Spinner = () => (
  <div className="flex justify-center items-center h-full my-8 p-10">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    <p className="ml-4 text-gray-600">Loading your financial dashboard...</p>
  </div>
);

const ExpenseBreakdownChart = ({ data }) => {
  const expenses = [
    { label: "Rent", value: data.rent },
    { label: "Food", value: data.food },
    { label: "Transportation", value: data.transportation },
    { label: "Entertainment", value: data.entertainment },
    { label: "Healthcare", value: data.healthcare },
    { label: "Other", value: data.otherExpenses },
  ];

  const totalExpenses = expenses.reduce((sum, item) => sum + item.value, 0);
  if (totalExpenses === 0) {
    return <p className="text-gray-500">No expense data to display.</p>;
  }

  return (
    <div className="space-y-3">
      {expenses.filter(item => item.value > 0).sort((a, b) => b.value - a.value).map(item => {
        const percentage = (item.value / totalExpenses) * 100;
        return (
          <div key={item.label}>
            <div className="flex justify-between mb-1 text-sm font-medium text-gray-700">
              <span>{item.label}</span>
              <span>₹{item.value.toLocaleString('en-IN')}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// --- (Main Dashboard Component) ---
const Dashboard = ({
  onNavigateToHome,
  onLogout
}) => {
  const gmail = useGmail();
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentView, setCurrentView] = useState("dashboard");
  const [headerSearch, setHeaderSearch] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [financialData, setFinancialData] = useState(null);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState('');

  // (useEffect and other functions remain exactly the same)
  useEffect(() => {
    const fetchFinancialData = async () => {
      if (!gmail) {
        setDashboardError("User not logged in.");
        setIsDashboardLoading(false);
        return;
      }
      try {
        if (!financialData) {
           setIsDashboardLoading(true);
        }
        setDashboardError(''); 
        const financeResponse = await fetch(`http://localhost:3000/api/financial-summary?email=${encodeURIComponent(gmail)}`);
        if (!financeResponse.ok) {
          throw new Error('Could not fetch your financial data. Please add your financial details first.');
        }
        const data = await financeResponse.json();
        setFinancialData(data);
      } catch (err) {
        setDashboardError(err.message);
        setFinancialData(null); 
      } finally {
        setIsDashboardLoading(false);
      }
    };

    if (currentView === "dashboard") {
      fetchFinancialData();
    }
  }, [currentView, gmail]); 


  function cleanMarkdownForChat(text) {
    if (!text) return "";
    let formatted = text.trim();

    // 1. Replace any unicode bullet (•) with a markdown asterisk (*)
    //    We also add a newline BEFORE it to ensure it starts a list.
    //    This regex looks for optional space, then '•', then optional space.
    //    It replaces it with "newline, asterisk, space".
    formatted = formatted.replace(/\s?•\s?/g, '\n* '); 
    
    // 2. Ensure standard markdown lists (*) also have a newline before them
    //    if they are not already at the start of a line.
    formatted = formatted.replace(/([^\n])\*/g, '$1\n*');

    return formatted;
  }

  const handleSendMessage = async () => {
    const message = chatInput.trim();
    if (!message || !gmail) return;
    setChatMessages((prev) => [...prev, { text: message, sender: "user" }]);
    setChatInput("");
    setIsTyping(true);
    try {
      const response = await fetch("http://localhost:3000/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, gmail }),
      });
      const data = await response.json();
      setIsTyping(false);
      if (data.success && data.reply) {
        setChatMessages((prev) => [...prev, { text: data.reply, sender: "ai" }]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { text: "Error: " + (data.message || "Failed to get response from AI."), sender: "ai" },
        ]);
      }
    } catch (error) {
      setIsTyping(false);
      setChatMessages((prev) => [
        ...prev,
        { text: "Network error. Could not connect to the server (port 3000).", sender: "ai" },
      ]);
      console.error("Network Error:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredSidebarActions = sidebarActions.filter(action =>
    action.label.toLowerCase().includes(headerSearch.toLowerCase())
  );

  function handleSidebarAction(action) {
    setShowSearchDropdown(false);
    setHeaderSearch("");
    action.click(setCurrentView);
  }

  const renderDashboardView = () => {
    if (isDashboardLoading) {
      return <Spinner />;
    }
    if (dashboardError) {
      return (
        <div className="p-6 text-center text-red-600 bg-white-50 m-6 rounded-lg">
          {dashboardError.includes("financial details") && (
            <button
              onClick={() => setCurrentView("addFinancial")}
              className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
            >
              Add Financial Details
            </button>
          )}
        </div>
      );
    }
    if (!financialData) {
      return (
         <div className="p-6 text-center text-gray-600 bg-gray-50 m-6 rounded-lg">
           <p className="text-lg">No financial data found.</p>
         </div>
      );
    }

    const summary = financialData || {};
    const finance = summary.finance || {};
    const goals = Array.isArray(summary.goals) ? summary.goals : [];
    const latestLifestyle = summary.latestLifestyle || null;
    const transactions = Array.isArray(summary.expenses) ? summary.expenses : [];
    const activeGoals = goals.filter((goal) => (goal.remainingAmount || 0) > 0);
    const completedGoals = goals.filter((goal) => (goal.remainingAmount || 0) <= 0);

    const {
      totalEarnings = 0,
      rent = 0,
      food = 0,
      transportation = 0,
      entertainment = 0,
      healthcare = 0,
      otherExpenses = 0,
      savings: manualSavings = 0
    } = finance;

    const totalExpenses = summary.totalExpenses ?? (rent + food + transportation + entertainment + healthcare + otherExpenses);
    const calculatedSavings = summary.calculatedSavings ?? (totalEarnings - totalExpenses);
    const savings = manualSavings;
    const savingsProgress = savings > 0 ? (calculatedSavings / savings) * 100 : 0;
    const lifestyleTarget = Number(latestLifestyle?.plannedSavings || latestLifestyle?.totalSaved || 0);
    const lifestyleRemaining = Math.max(0, lifestyleTarget - calculatedSavings);

    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-5 shadow">
            <h2 className="text-gray-500 text-sm font-medium">Total Monthly Income</h2>
            <p className="text-3xl font-bold text-green-600 mt-1">
              ₹{totalEarnings.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="bg-white rounded-lg p-5 shadow">
            <h2 className="text-gray-500 text-sm font-medium">Total Monthly Expenses</h2>
            <p className="text-3xl font-bold text-red-600 mt-1">
              ₹{totalExpenses.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="bg-white rounded-lg p-5 shadow">
            <h2 className="text-gray-500 text-sm font-medium">Monthly Savings</h2>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              ₹{calculatedSavings.toLocaleString('en-IN')}
            </p>
            <span className={`text-sm ${calculatedSavings >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {calculatedSavings >= 0 ? 'Surplus' : 'Deficit'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => setCurrentView("financeOverview")}
            className="bg-white rounded-lg p-5 shadow text-left hover:shadow-md transition-shadow"
          >
            <h2 className="text-gray-500 text-sm font-medium">Transaction History</h2>
            <p className="text-3xl font-bold text-gray-800 mt-1">{transactions.length}</p>
            <span className="text-sm text-gray-500">categorized records tracked</span>
          </button>
          <button
            onClick={() => setCurrentView("financialTracker")}
            className="bg-white rounded-lg p-5 shadow text-left hover:shadow-md transition-shadow"
          >
            <h2 className="text-gray-500 text-sm font-medium">Goals</h2>
            <p className="text-3xl font-bold text-gray-800 mt-1">{activeGoals.length}</p>
            <span className="text-sm text-gray-500">{completedGoals.length} completed</span>
          </button>
          <button
            onClick={() => setCurrentView("lifestyleManager")}
            className="bg-white rounded-lg p-5 shadow text-left hover:shadow-md transition-shadow"
          >
            <h2 className="text-gray-500 text-sm font-medium">Lifestyle Budget</h2>
            <p className={`text-2xl font-bold mt-1 ${lifestyleRemaining <= 0 && latestLifestyle ? 'text-green-600' : 'text-amber-600'}`}>
              {latestLifestyle ? (lifestyleRemaining <= 0 ? 'Ready' : `â‚¹${lifestyleRemaining.toLocaleString('en-IN')} left`) : 'Not set'}
            </p>
            <span className="text-sm text-gray-500">based on current savings</span>
          </button>
        </div>

        <div className="hidden">
          <div className="lg:col-span-3 bg-white rounded-lg p-6 shadow">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Expense Breakdown</h2>
            <ExpenseBreakdownChart data={financialData} />
          </div>
          <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Savings Goal</h2>
            <p className="text-gray-500 text-sm">
              Your defined monthly savings target is <b>₹{savings.toLocaleString('en-IN')}</b>.
            </p>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              ₹{calculatedSavings.toLocaleString('en-IN')}
            </p>
            <span className="text-sm text-gray-500">
              saved this month (Calculated)
            </span>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
              <div 
                className="bg-green-500 h-2.5 rounded-full" 
                style={{ width: `${Math.min(savingsProgress, 100)}%` }}
              ></div>
            </div>
            <span className="text-sm text-gray-500 mt-1">
              {savingsProgress.toFixed(0)}% of goal reached
            </span>
          </div>
        </div>
      </div>
    );
  };
  
  // =================================================================
  // THIS IS THE MAIN CHANGE
  // =================================================================
  const renderCurrentView = () => {
    switch (currentView) {
      case "dashboard":
        return renderDashboardView();
      case "addFinancial":
        return (
          <div className="p-6">
            <FinancialDetails onNavigateBack={() => setCurrentView("dashboard")} />
          </div>
        );
      case "financeOverview":
        return (
          <div className="p-6">
            <FinanceOverview />
          </div>
        );
      case "investmentHub":
        return (
          <div className="p-6">
            <InvestmentHub gmail={gmail} onNavigateBack={() => setCurrentView("dashboard")} />
          </div>
        );
      case "financialTracker":
        return (
          <div className="p-6">
            <FinancialTracker gmail={gmail} />
          </div>
        );
      case "autoCat":
        return (
          <div className="p-6">
            <AutoCategorization gmail={gmail} />
          </div>
        );
      case "lifestyle":
        return (
          <div className="p-6">
            <LifestyleBudgeting gmail={gmail} />
          </div>
        );
      case "lifestyleManager":
        return (
          <div className="p-6">
            <LifestyleManager />
          </div>
        );
      case "peerComparison":
        return (
          <div className="p-6">
            <PeerComparison gmail={gmail} />
          </div>
        );
      case "profile":
        return (
          <div className="p-6">
            {/* The 'gmail' prop is removed, as Profile.jsx gets it from the hook */}
            <Profile onNavigateBack={() => setCurrentView("dashboard")} />
          </div>
        );
      case "chatbot":
        return (
          <div className="p-6">
            <div className="bg-white shadow-lg rounded-lg w-full h-[500px] flex flex-col">
              <div className="p-4 border-b font-bold text-lg bg-blue-100">AI Chatbot</div>
              <div className="flex-1 p-4 overflow-y-auto space-y-3 flex flex-col">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} w-full`}>
                    
                    {/* The prose classes are on the bubble div */}
                    <div className={`p-3 rounded-xl max-w-sm prose prose-sm ${
                      msg.sender === "user"
                        ? "bg-blue-500 text-white rounded-br-none prose-invert"
                        : "bg-gray-200 text-gray-800 rounded-tl-none"
                    }`}>
                      {/* We clean the AI's message before rendering */}
                      <ReactMarkdown>
                        {msg.sender === 'user' ? msg.text : cleanMarkdownForChat(msg.text)}
                      </ReactMarkdown>
                    </div>

                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start w-full">
                    <div className="p-3 text-sm text-gray-600 animate-pulse">FinSage is thinking...</div>
                  </div>
                )}
              </div>
              <div className="p-4 border-t flex">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 border rounded-l-lg px-3 py-2 outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-500 text-white px-4 rounded-r-lg hover:bg-blue-600"
                >Send</button>
              </div>
            </div>
          </div>
        );
      default:
        return renderDashboardView();
    }
  };
  // =================================================================
  // END OF MAIN CHANGE
  // =================================================================

  
  if (!gmail)
    return <div className="p-10 text-center text-lg">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar (Unchanged) */}
      <div className="group bg-gradient-to-b from-blue-400 to-blue-300 text-white min-h-screen shadow-lg p-4 flex flex-col transition-all duration-300 w-16 hover:w-72 hover:bg-[#155cfc]">
        
        <div className="flex items-center space-x-2 mb-8">
          <i className="lni lni-wallet text-3xl"></i>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xl font-bold whitespace-nowrap">
            FinSage
          </span>
        </div>
        
        <ul className="space-y-4 flex-1 text-sm">
          {sidebarActions.map(action => (
            <li
              key={action.key}
              className="cursor-pointer flex items-center space-x-2 p-2 rounded-md transition-colors duration-200 hover:bg-white/20"
              onClick={() => handleSidebarAction(action)}
            >
              <i className={`lni ${action.iconClass} text-xl`}></i>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                {action.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content (Unchanged) */}
      <div className="flex-1 flex flex-col">
        {/* Header (Unchanged) */}
        <div className="flex items-center justify-between bg-white shadow p-4 relative">
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 w-1/3 relative">
            <i className="lni lni-search-alt text-gray-500 mr-2"></i>
            <input
              type="text"
              placeholder="Search menu..."
              className="bg-transparent outline-none w-full text-sm"
              value={headerSearch}
              onChange={e => {
                setHeaderSearch(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              onBlur={() => setTimeout(() => setShowSearchDropdown(false), 100)}
            />
            {showSearchDropdown && headerSearch && (
              <ul
                className="absolute left-0 right-0 bg-white text-black rounded shadow-lg max-h-48 overflow-y-auto z-50"
                style={{ top: "2.8rem", minWidth: "100%" }}
              >
                {filteredSidebarActions.length === 0 && (
                  <li className="p-2 text-sm text-gray-400">No results found.</li>
                )}
                {filteredSidebarActions.map(action => (
                  <li
                    key={action.key}
                    className="p-2 hover:bg-blue-100 cursor-pointer flex items-center space-x-2"
                    onMouseDown={() => handleSidebarAction(action)}
                  >
                    <i className={`lni ${action.iconClass} text-lg`}></i>
                    <span>{action.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setCurrentView("profile")} 
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2"
            >
              <i className="lni lni-user text-sm"></i>
              <span>Edit Profile</span>
            </button>
            
            <button 
              onClick={onNavigateToHome} 
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded-lg flex items-center"
              title="Home"
            >
              <i className="lni lni-home text-xl"></i>
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {renderCurrentView()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
