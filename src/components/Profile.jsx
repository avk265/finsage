import React, { useState, useEffect } from "react";
import { useGmail } from "../GmailContext";

const Profile = ({ onNavigateBack }) => {
  const gmail = useGmail();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: '',
    gmail: '',
    mobile: '',
    address: '',
    country: '',
    state: '',
    pincode: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  if (!gmail) return;
  loadProfile();
}, [gmail]);


  const loadProfile = async () => {
    if (!gmail) {
      alert("Please log in again.");
      onNavigateBack();
      return;
    }
    try {
      const res = await fetch("http://localhost:3000/user-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gmail })
      });
      if (res.ok) {
        const data = await res.json();
        setProfileData({
  full_name: data.fullname || data.full_name || "",
  gmail: gmail || "",
  mobile: data.mobile || "",
  address: data.address || "",
  country: data.country || "",
  state: data.state || "",
  pincode: data.pincode || ""
});
        setLoading(false);
      } else {
        alert(await res.text());
        onNavigateBack();
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      alert("Failed to load profile data.");
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    const formData = {
      gmail,
      fullname: profileData.full_name,
      mobile: profileData.mobile,
      address: profileData.address,
      country: profileData.country,
      state: profileData.state,
      pincode: profileData.pincode
    };
    try {
      const res = await fetch("http://localhost:3000/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert("Profile saved successfully!");
        setIsEditing(false);
      } else {
        alert("Failed to save profile.");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Network error. Could not save profile.");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    loadProfile();
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen flex items-center justify-center font-sans p-4">
      <div className="w-full max-w-2xl bg-white shadow-2xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">My Profile</h1>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              name="full_name"
              value={profileData.full_name}
              onChange={handleInputChange}
              className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Gmail</label>
            <input
              type="email"
              name="gmail"
              value={profileData.gmail}
              className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:outline-none bg-gray-100 cursor-not-allowed"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
            <input
              type="tel"
              name="mobile"
              value={profileData.mobile}
              onChange={handleInputChange}
              className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              name="address"
              rows="2"
              value={profileData.address}
              onChange={handleInputChange}
              className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
              disabled={!isEditing}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Country</label>
              <input
                type="text"
                name="country"
                value={profileData.country}
                onChange={handleInputChange}
                className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">State</label>
              <input
                type="text"
                name="state"
                value={profileData.state}
                onChange={handleInputChange}
                className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={!isEditing}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Pincode</label>
            <input
              type="text"
              name="pincode"
              value={profileData.pincode}
              onChange={handleInputChange}
              className="border rounded-lg px-4 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={!isEditing}
            />
          </div>
          <div className="flex justify-center space-x-4 pt-4">
            {!isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleEdit}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg shadow transition"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={onNavigateBack}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-5 py-2 rounded-lg shadow transition"
                >
                  Back
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg shadow transition"
                >
                  Save & Return
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg shadow transition"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
