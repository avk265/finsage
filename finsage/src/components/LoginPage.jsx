import React, { useState } from 'react';
import loginImg from './static/login.jpeg'
const LoginPage = ({ onNavigateToRegister, onLoginSuccess }) => {
  // State for Login Form
  const [gmail, setGmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // State for Forgot Password Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [forgotGmail, setForgotGmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  // Helper to display login errors
  const showError = (msg) => {
    setErrorMsg(msg);
  };

  // Login Form Submission Handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!gmail || !password) {
      showError('Please fill in all fields.');
      return;
    }

    console.log('Attempting login for:', gmail);

    try {
      const res = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gmail, password }),
      });

      console.log('Response status:', res.status);

      const data = await res.json();
      console.log('Response data:', data);

      if (res.ok && data.success) {
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('loggedIngmail', gmail);
        
        console.log('Login successful, navigating to dashboard');
        
        // Navigate using the prop function
        if (onLoginSuccess) {
          if (res.ok && data.success) {
  localStorage.setItem('loggedIn', 'true');
  localStorage.setItem('loggedIngmail', gmail);
  // Pass gmail and archetype to App
  if (onLoginSuccess) {
    onLoginSuccess(gmail, data.archetype || "");
  }
}

        }
      } else {
        showError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      showError('Server error. Try again later.');
    }
  };

  // Modal handlers
  const openForgotPasswordModal = () => {
    setIsModalOpen(true);
    setForgotGmail('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotMsg('');
    setForgotError('');
    setIsEmailVerified(false);
  };

  const closeForgotPasswordModal = () => {
    setIsModalOpen(false);
  };

  // Forgot Password Button Handler (handles both 'Next' and 'Reset Password')
  const handleResetPassword = async () => {
    setForgotError('');
    setForgotMsg('');

    if (!forgotGmail) {
      setForgotError('Please enter your registered gmail.');
      return;
    }

    if (!isEmailVerified) {
      // 1. Verify email exists (handles 'Next' step)
      try {
        const res = await fetch('http://localhost:3000/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gmail: forgotGmail }),
        });
        const data = await res.json();
        if (data.exists) {
          setIsEmailVerified(true);
          setForgotMsg('Gmail verified! Enter new password.');
        } else {
          setForgotError('Gmail not found.');
        }
      } catch (err) {
        setForgotError('Server error. Try again later.');
      }
    } else {
      // 2. Reset password (handles 'Reset Password' step)
      if (!newPassword || !confirmPassword) {
        setForgotError('Fill both password fields');
        return;
      }
      if (newPassword !== confirmPassword) {
        setForgotError('Passwords do not match');
        return;
      }
      
      try {
        const res = await fetch('http://localhost:3000/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gmail: forgotGmail, newPassword }),
        });
        
        const data = await res.json(); 

        if (res.ok) {
          setForgotMsg('Password reset successfully! You can now login.');
          setTimeout(() => {
            closeForgotPasswordModal();
          }, 2000);
        } else {
          setForgotError(data.message || 'Failed to reset password.');
        }
      } catch (err) {
        setForgotError('Server error. Try again later.');
      }
    }
  };

  return (
    <>
      {/* Main container: flex-col on small screens, flex-row on medium+ screens */}
      <div className="flex flex-col md:flex-row h-screen font-sans bg-blue-50">
        
        {/* Left Panel: Login Form */}
        <div className="flex-1 flex justify-center items-center">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-80">
            <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>
            <form onSubmit={handleLoginSubmit}>
              {/* Gmail Input */}
              <label htmlFor="gmail" className="block mt-4 mb-1 text-sm font-medium">Gmail:</label>
              <input
                type="text"
                id="gmail"
                placeholder="Enter gmail"
                required
                value={gmail}
                onChange={(e) => setGmail(e.target.value)}
                className="w-full p-2.5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Password Input */}
              <label htmlFor="password" className="block mt-4 mb-1 text-sm font-medium">Password:</label>
              <input
                type="password"
                id="password"
                placeholder="Enter password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Login Button */}
              <button 
                type="submit"
                className="w-full mt-5 p-2.5 bg-blue-600 text-white border-none rounded-md cursor-pointer hover:bg-blue-700 transition duration-150 font-bold"
              >
                Login
              </button>

              {/* Forgot Password Link */}
              <p className="text-center mt-2.5">
                <button
                  type="button"
                  onClick={openForgotPasswordModal}
                  className="text-blue-600 text-sm hover:underline bg-transparent border-none cursor-pointer"
                >
                  Forgot Password?
                </button>
              </p>
            </form>

            {/* Social Login and Registration Link */}
            <div className="flex flex-col gap-2.5 mt-5 border-t pt-5 border-gray-200">
              <button 
                onClick={() => console.log('Redirect to Google Login')}
                className="bg-gray-100 text-gray-800 border border-gray-300 p-2.5 rounded-md hover:bg-gray-200 transition duration-150 flex items-center justify-center text-sm"
              >
                <img src="https://img.icons8.com/color/16/000000/google-logo.png" alt="Google" className="mr-2"/>
                Continue with Google
              </button>
              <button 
                onClick={() => console.log('Redirect to Apple Login')}
                className="bg-gray-100 text-gray-800 border border-gray-300 p-2.5 rounded-md hover:bg-gray-200 transition duration-150 flex items-center justify-center text-sm"
              >
                <img src="https://img.icons8.com/ios-filled/16/000000/mac-os.png" alt="Apple" className="mr-2"/>
                Continue with Apple
              </button>
              
              {/* Registration Link */}
              <button
                onClick={onNavigateToRegister}
                className="text-xs text-gray-600 text-right mt-1 hover:text-blue-600 bg-transparent border-none cursor-pointer p-0"
              >
                Not yet registered? Register Now
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="text-red-600 text-center mt-2.5 text-sm">
                {errorMsg}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Background Image */}
        <div
  className="hidden md:block w-1/2 bg-cover bg-center h-full"
  style={{ backgroundImage: `url(${loginImg})` }}
>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-xl relative shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Reset Password</h2>
            <form onSubmit={(e) => e.preventDefault()}> 
              <label htmlFor="forgotgmail" className="block mb-1 text-sm font-medium">Enter your registered gmail:</label>
              <input
                type="text"
                id="forgotgmail"
                required
                value={forgotGmail}
                onChange={(e) => setForgotGmail(e.target.value)}
                className="w-full p-2.5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="h-4"></div>

              {isEmailVerified && (
                <div className="mt-2">
                  <label htmlFor="newPassword" className="block mb-1 text-sm font-medium">New Password:</label>
                  <input
                    type="password"
                    id="newPassword"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2.5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="h-4"></div>
                  <label htmlFor="confirmPassword" className="block mb-1 text-sm font-medium">Confirm Password:</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2.5 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="h-4"></div>
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <button 
                  type="button" 
                  onClick={handleResetPassword}
                  className="p-2.5 px-4 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 transition duration-150 font-medium"
                >
                  {isEmailVerified ? 'Reset Password' : 'Next'}
                </button>
                <button 
                  type="button" 
                  onClick={closeForgotPasswordModal} 
                  className="ml-3 p-2.5 px-4 bg-gray-200 text-gray-800 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-300 transition duration-150 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>

            {forgotMsg && (
              <p className="text-green-600 text-sm mt-3">
                {forgotMsg}
              </p>
            )}
            {forgotError && (
              <p className="text-red-600 text-sm mt-3">
                {forgotError}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default LoginPage;