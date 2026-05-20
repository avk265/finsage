import React, { useState, useEffect } from 'react';
import { useGmail } from "../GmailContext";

const PeerComparison = ({ onNavigateBack }) => {
  const gmail = useGmail();

  const [currentView, setCurrentView] = useState('discover');
  const [peers, setPeers] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [selectedPeer, setSelectedPeer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUserData, setCurrentUserData] = useState(null);

  useEffect(() => {
  if (!gmail) return;
  fetchCurrentUserData();
  fetchMatchingPeers();
  fetchFriendRequests();
  fetchFriends();
}, [gmail]);


  const fetchCurrentUserData = async () => {
    if (!gmail) return;
    try {
      const response = await fetch(
        `http://localhost:3000/api/current-user-full?email=${encodeURIComponent(gmail)}`
      );
      if (response.ok) {
        const data = await response.json();
        setCurrentUserData(data);
      }
    } catch (err) {
      console.error('Error fetching current user data:', err);
    }
  };

  const fetchMatchingPeers = async () => {
    if (!gmail) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/matching-peers/${encodeURIComponent(gmail)}`
      );
      if (response.ok) {
        const data = await response.json();
        setPeers(data.peers || []);
      } else {
        setError('Failed to load matching peers');
      }
    } catch (err) {
      console.error('Error fetching peers:', err);
      setError('Network error while loading peers');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFriendRequests = async () => {
    if (!gmail) return;
    try {
      const response = await fetch(
        `http://localhost:3000/api/friend-requests/${encodeURIComponent(gmail)}`
      );
      if (response.ok) {
        const data = await response.json();
        setFriendRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Error fetching friend requests:', err);
    }
  };

  const fetchFriends = async () => {
    if (!gmail) return;
    try {
      const response = await fetch(
        `http://localhost:3000/api/friends/${encodeURIComponent(gmail)}`
      );
      if (response.ok) {
        const data = await response.json();
        setFriends(data.friends || []);
      }
    } catch (err) {
      console.error('Error fetching friends:', err);
    }
  };

  const sendFriendRequest = async (recipientEmail) => {
    if (!gmail) return;
    try {
      const response = await fetch('http://localhost:3000/api/send-friend-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderEmail: gmail,
          recipientEmail,
        }),
      });
      const result = await response.json();
      if (result.success) {
        alert('Friend request sent successfully!');
        fetchMatchingPeers();
      } else {
        alert(result.message || 'Failed to send friend request');
      }
    } catch (err) {
      console.error('Error sending friend request:', err);
      alert('Network error while sending friend request');
    }
  };

  const respondToFriendRequest = async (requestId, action) => {
    if (!gmail) return;
    try {
      const response = await fetch('http://localhost:3000/api/respond-friend-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          action,
          userEmail: gmail,
        }),
      });
      const result = await response.json();
      if (result.success) {
        alert(`Friend request ${action}ed!`);
        fetchFriendRequests();
        fetchFriends();
        fetchMatchingPeers();
      } else {
        alert(result.message || 'Failed to respond to request');
      }
    } catch (err) {
      console.error('Error responding to friend request:', err);
      alert('Network error');
    }
  };

  if (!gmail)
    return <div>Loading...</div>;
  const viewPeerDetails = (peer) => {
    setSelectedPeer(peer);
  };

  const closePeerDetails = () => {
    setSelectedPeer(null);
  };

  const getMatchPercentage = (peer) => {
    if (!peer.matchScore) return 0;
    return Math.round(peer.matchScore * 100);
  };

  const calculateComparison = (myValue, peerValue) => {
    const diff = myValue - peerValue;
    const percentage = peerValue > 0 ? ((diff / peerValue) * 100) : 0;
    return { diff, percentage };
  };

  const getComparisonColor = (diff) => {
    if (diff > 0) return 'text-red-600';
    if (diff < 0) return 'text-emerald-600';
    return 'text-slate-600';
  };

  const getComparisonIcon = (diff) => {
    if (diff > 0) return '↑';
    if (diff < 0) return '↓';
    return '=';
  };

  const archetypeIcons = {
    'The Explorer': '🗺️',
    'The Homebody': '🏡',
    'The Socialite': '🥂',
    'The Creator': '🎨'
  };

  const categories = [
    { key: 'rent', label: 'Rent', color: 'from-sky-400 to-blue-500', textColor: 'text-sky-700', bgColor: 'bg-sky-50', borderColor: 'border-sky-200' },
    { key: 'food', label: 'Food', color: 'from-amber-400 to-orange-500', textColor: 'text-orange-700', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
    { key: 'transportation', label: 'Transportation', color: 'from-purple-400 to-purple-600', textColor: 'text-purple-700', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
    { key: 'entertainment', label: 'Entertainment', color: 'from-pink-400 to-rose-500', textColor: 'text-pink-700', bgColor: 'bg-pink-50', borderColor: 'border-pink-200' },
    { key: 'healthcare', label: 'Healthcare', color: 'from-red-400 to-red-600', textColor: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
    { key: 'savings', label: 'Savings', color: 'from-emerald-400 to-green-600', textColor: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
    { key: 'otherExpenses', label: 'Other', color: 'from-slate-400 to-gray-500', textColor: 'text-slate-700', bgColor: 'bg-slate-50', borderColor: 'border-slate-200' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 mb-6 border border-blue-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Peer Comparison
              </h1>
              <p className="text-slate-600 mt-2 text-sm md:text-base">Connect with users who have similar financial patterns</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mt-6 border-b-2 border-blue-100">
            <button
              onClick={() => setCurrentView('discover')}
              className={`px-6 py-3 font-semibold transition-all rounded-t-lg ${
                currentView === 'discover'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                  : 'text-slate-600 hover:bg-blue-50'
              }`}
            >
              🔍 Discover ({peers.length})
            </button>
            <button
              onClick={() => setCurrentView('requests')}
              className={`px-6 py-3 font-semibold transition-all rounded-t-lg relative ${
                currentView === 'requests'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                  : 'text-slate-600 hover:bg-blue-50'
              }`}
            >
              📬 Requests ({friendRequests.length})
              {friendRequests.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
                  {friendRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setCurrentView('friends')}
              className={`px-6 py-3 font-semibold transition-all rounded-t-lg ${
                currentView === 'friends'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                  : 'text-slate-600 hover:bg-blue-50'
              }`}
            >
              👥 Friends ({friends.length})
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-6 shadow-md">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <p className="font-semibold">{error}</p>
            </div>
          </div>
        )}

        {/* Discover Peers View */}
        {currentView === 'discover' && (
          <div>
            {isLoading ? (
              <div className="text-center py-20">
                <div className="relative w-16 h-16 mx-auto mb-6">
                  <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-slate-600 font-semibold text-lg">Finding matching peers...</p>
              </div>
            ) : peers.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-blue-100">
                <div className="text-7xl mb-6">🔍</div>
                <h3 className="text-2xl font-bold text-slate-700 mb-3">No Matching Peers Found</h3>
                <p className="text-slate-600">Complete your lifestyle budget to find peers with similar patterns!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {peers.map((peer) => (
                  <div key={peer.gmail} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-blue-100 hover:border-blue-300 transform hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                          {peer.full_name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg">{peer.full_name || 'Anonymous User'}</h3>
                          <p className="text-sm text-slate-500">{peer.state || 'Unknown'}, {peer.country || 'Unknown'}</p>
                        </div>
                      </div>
                      <div className="text-3xl">
                        {archetypeIcons[peer.archetype] || '💼'}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-700">Match Score</span>
                        <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                          {getMatchPercentage(peer)}%
                        </span>
                      </div>
                      <div className="w-full bg-blue-100 rounded-full h-3 shadow-inner">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500 shadow-md"
                          style={{ width: `${getMatchPercentage(peer)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 mb-4 border border-blue-200">
                      <p className="text-xs font-semibold text-slate-600 mb-2">Lifestyle Archetype</p>
                      <p className="text-sm font-bold text-slate-800">{peer.archetype || 'Not Set'}</p>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => viewPeerDetails(peer)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all"
                      >
                        View Details
                      </button>
                      {peer.friendshipStatus === 'none' && (
                        <button
                          onClick={() => sendFriendRequest(peer.gmail)}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all"
                        >
                          Add Friend
                        </button>
                      )}
                      {peer.friendshipStatus === 'pending' && (
                        <button
                          disabled
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 rounded-lg font-semibold text-sm cursor-not-allowed"
                        >
                          ⏳ Pending
                        </button>
                      )}
                      {peer.friendshipStatus === 'friends' && (
                        <button
                          disabled
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 rounded-lg font-semibold text-sm cursor-not-allowed"
                        >
                          ✓ Friends
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Friend Requests View */}
        {currentView === 'requests' && (
          <div>
            {friendRequests.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-blue-100">
                <div className="text-7xl mb-6">📬</div>
                <h3 className="text-2xl font-bold text-slate-700 mb-3">No Friend Requests</h3>
                <p className="text-slate-600">You don't have any pending friend requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {friendRequests.map((request) => (
                  <div key={request._id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-blue-100 hover:border-blue-300 transition-all">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-400 via-pink-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                        {request.senderName?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-xl">{request.senderName}</h3>
                        <p className="text-sm text-slate-600">{request.senderEmail}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          📅 Sent {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-3 w-full md:w-auto">
                      <button
                        onClick={() => respondToFriendRequest(request._id, 'accept')}
                        className="flex-1 md:flex-none px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
                      >
                        ✓ Accept
                      </button>
                      <button
                        onClick={() => respondToFriendRequest(request._id, 'reject')}
                        className="flex-1 md:flex-none px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Friends View */}
        {currentView === 'friends' && (
          <div>
            {friends.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-blue-100">
                <div className="text-7xl mb-6">👥</div>
                <h3 className="text-2xl font-bold text-slate-700 mb-3">No Friends Yet</h3>
                <p className="text-slate-600">Start connecting with peers to build your network!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {friends.map((friend) => (
                  <div key={friend.gmail} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-blue-100 hover:border-emerald-300 transform hover:-translate-y-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 via-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                        {friend.full_name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-xl">{friend.full_name}</h3>
                        <p className="text-sm text-slate-600">{friend.archetype || 'No archetype'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => viewPeerDetails(friend)}
                      className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
                    >
                      📊 View Comparison
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Peer Details Modal */}
      {selectedPeer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full my-8 border-2 border-blue-200">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 text-white p-8 rounded-t-3xl z-10 shadow-xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold mb-2">{selectedPeer.full_name || 'Anonymous User'}</h2>
                  <p className="text-blue-100">{selectedPeer.gmail}</p>
                </div>
                <button
                  onClick={closePeerDetails}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-all w-10 h-10 flex items-center justify-center font-bold text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-8 max-h-[calc(90vh-140px)] overflow-y-auto">
              {/* Profile Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-200 shadow-md">
                  <p className="text-sm text-slate-600 mb-2 font-semibold">Location</p>
                  <p className="font-bold text-slate-800 text-lg">{selectedPeer.state}, {selectedPeer.country}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200 shadow-md">
                  <p className="text-sm text-slate-600 mb-2 font-semibold">Lifestyle Archetype</p>
                  <p className="font-bold text-slate-800 text-lg">{archetypeIcons[selectedPeer.archetype]} {selectedPeer.archetype}</p>
                </div>
              </div>

              {/* Financial Comparison - Only for Friends */}
              {selectedPeer.isFriend && selectedPeer.financeData && currentUserData?.finance ? (
                <div className="space-y-8">
                  <h3 className="text-3xl font-bold text-slate-800 flex items-center">
                    Financial Comparison
                  </h3>

                  {/* Earnings Comparison */}
                  <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-cyan-50 p-8 rounded-2xl border-2 border-emerald-300 shadow-lg">
                    <h4 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                      <span className="mr-2">💰</span>
                      Total Earnings
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/70 p-6 rounded-xl shadow-md">
                        <p className="text-sm text-slate-600 mb-2 font-semibold">Your Earnings</p>
                        <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                          ₹{currentUserData.finance.totalEarnings?.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="bg-white/70 p-6 rounded-xl shadow-md">
                        <p className="text-sm text-slate-600 mb-2 font-semibold">{selectedPeer.full_name}'s Earnings</p>
                        <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                          ₹{selectedPeer.financeData.totalEarnings?.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <div className="mt-6 pt-6 border-t-2 border-emerald-200">
                      {(() => {
                        const { diff, percentage } = calculateComparison(
                          currentUserData.finance.totalEarnings,
                          selectedPeer.financeData.totalEarnings
                        );
                        return (
                          <p className={`text-base font-bold ${getComparisonColor(diff)}`}>
                            {diff > 0 ? (
                              <>↑ You earn ₹{Math.abs(diff).toLocaleString('en-IN')} ({Math.abs(percentage).toFixed(1)}%) more</>
                            ) : diff < 0 ? (
                              <>↓ You earn ₹{Math.abs(diff).toLocaleString('en-IN')} ({Math.abs(percentage).toFixed(1)}%) less</>
                            ) : (
                              <>= You both earn the same amount</>
                            )}
                          </p>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Category-wise Comparison */}
                  <div className="bg-white rounded-2xl p-8 border-2 border-blue-200 shadow-lg">
                    <h4 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                      <span className="mr-2">🔍</span>
                      Expense Categories Comparison
                    </h4>
                    <div className="space-y-5">
                      {categories.map((category) => {
                        const myValue = currentUserData.finance[category.key] || 0;
                        const peerValue = selectedPeer.financeData[category.key] || 0;
                        const { diff, percentage } = calculateComparison(myValue, peerValue);

                        return (
                          <div key={category.key} className={`${category.bgColor} p-6 rounded-2xl border-2 ${category.borderColor} shadow-md hover:shadow-lg transition-all`}>
                            <div className="flex justify-between items-center mb-4">
                              <h5 className="font-bold text-slate-800 text-lg">{category.label}</h5>
                              <span className={`text-2xl font-bold ${getComparisonColor(diff)}`}>
                                {getComparisonIcon(diff)}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="bg-white/70 p-4 rounded-xl">
                                <p className="text-xs text-slate-600 mb-1 font-semibold">You</p>
                                <p className={`text-2xl font-bold ${category.textColor}`}>
                                  ₹{myValue.toLocaleString('en-IN')}
                                </p>
                              </div>
                              <div className="bg-white/70 p-4 rounded-xl">
                                <p className="text-xs text-slate-600 mb-1 font-semibold">{selectedPeer.full_name}</p>
                                <p className={`text-2xl font-bold ${category.textColor}`}>
                                  ₹{peerValue.toLocaleString('en-IN')}
                                </p>
                              </div>
                            </div>
                            <div className="pt-4 border-t-2 border-white/50">
                              <p className={`text-sm font-bold ${getComparisonColor(diff)}`}>
                                {diff > 0 ? (
                                  <>↑ You spend ₹{Math.abs(diff).toLocaleString('en-IN')} more ({Math.abs(percentage).toFixed(1)}%)</>
                                ) : diff < 0 ? (
                                  <>↓ You spend ₹{Math.abs(diff).toLocaleString('en-IN')} less ({Math.abs(percentage).toFixed(1)}%)</>
                                ) : (
                                  <>= Same spending</>
                                )}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Insights Section */}
                  <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 p-8 rounded-2xl border-2 border-purple-300 shadow-lg">
                    <h4 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                      <span className="mr-3 text-2xl">💡</span>
                      Key Insights
                    </h4>
                    <div className="space-y-4">
                      {(() => {
                        const savingsDiff = calculateComparison(
                          currentUserData.finance.savings,
                          selectedPeer.financeData.savings
                        ).diff;
                        
                        const totalExpensesYou = categories.reduce((sum, cat) => 
                          cat.key !== 'savings' ? sum + (currentUserData.finance[cat.key] || 0) : sum, 0
                        );
                        
                        const totalExpensesPeer = categories.reduce((sum, cat) => 
                          cat.key !== 'savings' ? sum + (selectedPeer.financeData[cat.key] || 0) : sum, 0
                        );

                        return (
                          <>
                            {savingsDiff > 0 && (
                              <div className="bg-white/80 p-5 rounded-xl shadow-md border-l-4 border-emerald-500">
                                <p className="text-base text-emerald-700 font-bold flex items-center">
                                  <span className="mr-2 text-xl">✓</span>
                                  You're saving ₹{Math.abs(savingsDiff).toLocaleString('en-IN')} more than {selectedPeer.full_name}
                                </p>
                              </div>
                            )}
                            {savingsDiff < 0 && (
                              <div className="bg-white/80 p-5 rounded-xl shadow-md border-l-4 border-orange-500">
                                <p className="text-base text-orange-700 font-bold flex items-center">
                                  <span className="mr-2 text-xl">⚠</span>
                                  {selectedPeer.full_name} saves ₹{Math.abs(savingsDiff).toLocaleString('en-IN')} more than you
                                </p>
                              </div>
                            )}
                            <div className="bg-white/80 p-5 rounded-xl shadow-md border-l-4 border-blue-500">
                              <p className="text-sm text-slate-700">
                                <span className="font-bold text-base block mb-2">📈 Total Expenses Comparison</span>
                                <span className="block">You: <span className="font-bold text-blue-600">₹{totalExpensesYou.toLocaleString('en-IN')}</span></span>
                                <span className="block mt-1">{selectedPeer.full_name}: <span className="font-bold text-cyan-600">₹{totalExpensesPeer.toLocaleString('en-IN')}</span></span>
                              </p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Lifestyle Preferences */}
                  {selectedPeer.lifestyleData && (
                    <div className="bg-gradient-to-br from-sky-50 to-blue-50 p-8 rounded-2xl border-2 border-sky-300 shadow-lg">
                      <h4 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                        <span className="mr-3 text-2xl">🌟</span>
                        Lifestyle Preferences
                      </h4>
                      <div className="space-y-4">
                        <div className="bg-white/80 p-5 rounded-xl shadow-md">
                          <p className="text-sm text-slate-600 font-semibold mb-2">🎉 Weekend Preference</p>
                          <p className="font-bold text-slate-800 text-lg">{selectedPeer.lifestyleData.weekendPreference}</p>
                        </div>
                        <div className="bg-white/80 p-5 rounded-xl shadow-md">
                          <p className="text-sm text-slate-600 font-semibold mb-2">🎨 Hobbies</p>
                          <p className="font-bold text-slate-800 text-lg">{selectedPeer.lifestyleData.hobbies?.join(', ') || 'None specified'}</p>
                        </div>
                        <div className="bg-white/80 p-5 rounded-xl shadow-md">
                          <p className="text-sm text-slate-600 font-semibold mb-2">🎯 Savings Goal</p>
                          <p className="font-bold text-slate-800 text-lg">{selectedPeer.lifestyleData.savingsGoal}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl p-12 text-center shadow-lg">
                  <div className="text-6xl mb-4">🔒</div>
                  <p className="text-slate-700 font-bold text-2xl mb-3">Financial Details are Private</p>
                  <p className="text-slate-600 text-base">
                    Send a friend request to view detailed financial comparison
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeerComparison;