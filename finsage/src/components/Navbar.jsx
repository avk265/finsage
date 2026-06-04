import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // This effect checks login status when the component loads
  useEffect(() => {
    const loggedInStatus = localStorage.getItem('loggedIn') === 'true';
    setIsLoggedIn(loggedInStatus);

    // This listener syncs login state across multiple tabs
    const handleStorageChange = () => {
      setIsLoggedIn(localStorage.getItem('loggedIn') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup the listener when component unmounts
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.setItem('loggedIn', 'false');
    localStorage.removeItem('loggedIngmail'); // Also clear the user's email
    setIsLoggedIn(false);
    alert('You have been logged out.');
    navigate('/'); // Redirect to home page
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-700">
          {/* Link logo to dashboard if logged in, else to home */}
          <Link to={isLoggedIn ? "/dashboard" : "/"}>FinSage</Link>
        </h1>
        <nav className="space-x-6" id="navbar">
          {isLoggedIn ? (
            <>
              <Link to="/" className="text-gray-700 hover:text-blue-600">Home</Link>
              <a href="#features" className="text-gray-700 hover:text-blue-600">Features</a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600">Pricing</a>
              <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
              <a href="#" onClick={handleLogout} className="text-gray-700 hover:text-blue-600">Logout</a>
            </>
          ) : (
            <>
              <Link to="/" className="text-gray-700 hover:text-blue-600">Home</Link>
              <a href="#features" className="text-gray-700 hover:text-blue-600">Features</a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600">Pricing</a>
              <Link to="/login" className="text-gray-700 hover:text-blue-600">Login</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;