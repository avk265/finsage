import React, { useState, useEffect } from 'react';
import registerImg from './static/register.png'; 
const RegisterPage = ({ onNavigateToLogin, onRegistrationSuccess }) => {
  // State for form fields
  const [formData, setFormData] = useState({
    full_name: '',
    gmail: '',
    mobile: '',
    password: '',
    confirm_password: '',
    country: '',
    state: '',
    pincode: '',
    address: '',
    terms: false,
  });
  
  // State for messages
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Handle form field changes
  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  // Form Submission Handler
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setErrorMsg('');

    if (formData.password !== formData.confirm_password) {
      setErrorMsg('Error: Passwords do not match.');
      return;
    }
    if (!formData.terms) {
      setErrorMsg('Error: You must agree to the terms and privacy policy.');
      return;
    }

    const { confirm_password, terms, ...dataToSend } = formData;

    console.log("Sending registration data:", dataToSend);

    try {
      const response = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend)
      });

      // 'data' should contain the server's response
      const data = await response.json(); 

      if (response.ok) {
        setMessage("Registration successful! Redirecting...");
        
        // We get the email from the form, and assume the server
        // sends back the 'archetype' in its response.
        const email = dataToSend.gmail;
        const ape = data.archetype; // Or data.ape, whatever key the server uses

        setTimeout(() => {
          if (onRegistrationSuccess) {
            // Pass the data back to App.js
            onRegistrationSuccess(email, ape); 
          } else if (onNavigateToLogin) {
            onNavigateToLogin();
          }
        }, 2000); 
        // --- END OF FIX ---

      } else {
        setErrorMsg("Error: " + (data.message || "Registration failed"));
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Server error. Please try again later.");
    }
  };
  return (
    <div className="flex flex-col md:flex-row h-screen font-inter bg-gray-50">
      
      {/* Left Panel: Register Form */}
      <div className="flex-1 flex justify-center items-center p-6 md:p-12">
        <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-2xl">
          <h2 className="text-3xl font-semibold mb-6 text-gray-800">Welcome</h2>
          
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {/* Full Name */}
            <input
              type="text"
              id="full_name"
              name="full_name"
              placeholder="Full Name"
              required
              value={formData.full_name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition"
            />
            
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Gmail Address */}
              <input
                type="email"
                id="gmail"
                name="gmail"
                placeholder="Gmail Address"
                required
                value={formData.gmail}
                onChange={handleChange}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition"
              />
              {/* Mobile Number */}
              <input
                type="text"
                id="mobile"
                name="mobile"
                placeholder="Mobile Number"
                required
                value={formData.mobile}
                onChange={handleChange}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Password */}
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Password"
                required
                value={formData.password}
                onChange={handleChange}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition"
              />
              {/* Confirm Password */}
              <input
                type="password"
                id="confirm_password"
                name="confirm_password"
                placeholder="Confirm Password"
                required
                value={formData.confirm_password}
                onChange={handleChange}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Country */}
              <input
                type="text"
                id="country"
                name="country"
                placeholder="Country"
                required
                value={formData.country}
                onChange={handleChange}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition"
              />
              {/* State */}
              <input
                type="text"
                id="state"
                name="state"
                placeholder="State"
                required
                value={formData.state}
                onChange={handleChange}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition"
              />
            </div>

            {/* Pincode */}
            <input
              type="text"
              id="pincode"
              name="pincode"
              placeholder="Pincode"
              required
              value={formData.pincode}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition"
            />
            
            {/* Address */}
            <input
              type="text"
              id="address"
              name="address"
              placeholder="Address"
              required
              value={formData.address}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition"
            />
            
            {/* Terms and Policy */}
            <label className="flex items-center text-sm text-gray-600 cursor-pointer">
              <input 
                type="checkbox" 
                id="terms" 
                checked={formData.terms}
                onChange={handleChange}
                className="mr-2 h-4 w-4 text-green-800 border-gray-300 rounded focus:ring-green-500" 
                required 
              /> 
              I agree to the <a href="#" className="text-green-800 font-medium ml-1 hover:underline">terms & privacy policy</a>
            </label>
            
            {/* Register Button */}
            <button 
              type="submit" 
              className="w-full p-3 bg-green-800 text-white font-bold rounded-lg hover:bg-green-900 transition duration-150 shadow-md hover:shadow-lg"
            >
              Register
            </button>

            {/* Success/Error Messages */}
            {message && <p className="text-green-600 text-center font-medium mt-3">{message}</p>}
            {errorMsg && <p className="text-red-600 text-center font-medium mt-3">{errorMsg}</p>}
          </form>
          
          {/* Sign In Link */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm">
            Already have an account? 
            <button 
                onClick={onNavigateToLogin} 
                className="text-green-800 font-semibold ml-1 hover:underline bg-transparent border-none cursor-pointer"
            >
                Login here
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel: Background Image */}
      <div
  className="hidden md:block w-1/2 bg-cover bg-center h-full"
  style={{ backgroundImage: `url(${registerImg})` }}
>

      </div>
    </div>
  );
};

export default RegisterPage;