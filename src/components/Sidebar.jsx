import React from 'react';
import { Link } from 'react-router-dom';

// We receive two functions as props from the Dashboard page
const Sidebar = ({ onChatbotToggle, onAutoCategorize }) => {
  return (
    // The styling for this sidebar is now in src/index.css
    <div className="sidebar bg-gradient-to-b from-green-600 to-green-500 text-white shadow-lg p-4 flex flex-col">
      <div className="flex items-center space-x-2 mb-8">
        <span className="text-2xl font-bold">💰</span>
        <span className="sidebar-text text-xl font-bold">FinSage</span>
      </div>
      <ul className="space-y-4 flex-1 text-sm">
        
        {/* Use <Link> for navigation */}
        <li className="cursor-pointer flex items-center space-x-2 hover:underline">
          <Link to="/finance" className="flex items-center space-x-2">
            <span>➕</span>
            <span className="sidebar-text">Add Financial Details</span>
          </Link>
        </li>

        <li className="flex items-center space-x-2"><span>📊</span><span className="sidebar-text">Spending Overview</span></li>
        <li className="flex items-center space-x-2"><span>🎯</span><span className="sidebar-text">Savings Goal Progress</span></li>
        <li className="flex items-center space-x-2"><span>📅</span><span className="sidebar-text">Upcoming Bills & Due Dates</span></li>
        <li className="flex items-center space-x-2"><span>📈</span><span className="sidebar-text">Spending Pattern Predictions</span></li>
        <li className="flex items-center space-x-2"><span>🏷️</span><span className="sidebar-text">Lifestyle-based Budgeting</span></li>

        {/* Use onClick prop for component-level actions */}
        <li onClick={onAutoCategorize} className="cursor-pointer flex items-center space-x-2 hover:underline">
          <span>🤖</span>
          <span className="sidebar-text">Automated Categorization</span>
        </li>

        <li className="flex items-center space-x-2"><span>🔥</span><span className="sidebar-text">Financial Streaks</span></li>
        <li className="flex items-center space-x-2"><span>🗓️</span><span className="sidebar-text">Heatmap of Spending</span></li>

        {/* Use onClick prop for component-level actions */}
        <li onClick={onChatbotToggle} className="cursor-pointer flex items-center space-x-2">
          <span>💬</span>
          <span className="sidebar-text hover:underline">AI Chatbot</span>
        </li>
        <li className="flex items-center space-x-2"><span>💡</span><span className="sidebar-text">Smart Saving</span></li>
        <li className="flex items-center space-x-2"><span>👥</span><span className="sidebar-text">Peer Comparison</span></li>
      </ul>
    </div>
  );
};

export default Sidebar;