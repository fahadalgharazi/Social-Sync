import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, UserPlus, UserCheck, UserMinus, Check, X, Loader2, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  getFriends,
  getPendingRequests,
  getSentRequests,
  respondToRequest,
  unfriend,
  sendFriendRequest,
} from "../api/friendsApi";
import { searchUsers } from "../../users/api/usersApi";

export default function FriendsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("friends");
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [friendsData, pendingData, sentData] = await Promise.all([
        getFriends(),
        getPendingRequests(),
        getSentRequests(),
      ]);
      setFriends(friendsData);
      setPendingRequests(pendingData);
      setSentRequests(sentData);
    } catch (error) {
      console.error("Error loading friends data:", error);
      toast.error("Failed to load friends data");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await respondToRequest(requestId, "accept");
      toast.success("Friend request accepted!");
      await loadData();
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error(error.response?.data?.message || "Failed to accept request");
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await respondToRequest(requestId, "reject");
      toast.success("Friend request rejected");
      await loadData();
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error(error.response?.data?.message || "Failed to reject request");
    }
  };

  const handleUnfriend = async (friendId, friendName) => {
    if (!confirm(`Are you sure you want to unfriend ${friendName}?`)) {
      return;
    }

    try {
      await unfriend(friendId);
      toast.success(`Unfriended ${friendName}`);
      await loadData();
    } catch (error) {
      console.error("Error unfriending:", error);
      toast.error(error.response?.data?.message || "Failed to unfriend");
    }
  };

  const handleSearch = async (query) => {
    if (!query || query.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const results = await searchUsers(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Failed to search users");
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (userId, userName) => {
    // Optimistically update UI
    setSearchResults(searchResults.map(user =>
      user.id === userId ? { ...user, friendshipStatus: 'request_sent' } : user
    ));

    try {
      await sendFriendRequest(userId);
      toast.success(`Friend request sent to ${userName}!`);
      // Reload friend data to keep sent requests list in sync
      await loadData();
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast.error(error.response?.data?.message || "Failed to send friend request");
      // Revert optimistic update on error
      setSearchResults(searchResults.map(user =>
        user.id === userId ? { ...user, friendshipStatus: 'none' } : user
      ));
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery && showSearch) {
        handleSearch(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, showSearch]);

  const tabs = [
    {
      id: "friends",
      label: "Friends",
      icon: Users,
      count: friends.length,
    },
    {
      id: "pending",
      label: "Requests",
      icon: UserPlus,
      count: pendingRequests.length,
    },
    {
      id: "sent",
      label: "Sent",
      icon: UserCheck,
      count: sentRequests.length,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Friends</h1>
          <p className="text-gray-600">Manage your connections and friend requests</p>
        </div>

        {/* Search Section */}
        <Card className="mb-6 bg-white/70 backdrop-blur-sm border-white/50 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for users by name or username..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearch(true);
                  }}
                  onFocus={() => setShowSearch(true)}
                  className="pl-10 bg-white"
                />
              </div>
              {searchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                    setShowSearch(false);
                  }}
                >
                  Clear
                </Button>
              )}
            </div>

            {/* Search Results */}
            {showSearch && searchQuery && (
              <div className="mt-4 space-y-2">
                {searching ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  </div>
                ) : searchResults.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No users found</p>
                ) : (
                  searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={user.profile_picture_url}
                          firstName={user.first_name}
                          lastName={user.last_name}
                          size="sm"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {user.first_name} {user.last_name}
                          </h4>
                          {user.username && (
                            <p className="text-sm text-gray-500">@{user.username}</p>
                          )}
                          {user.bio && (
                            <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{user.bio}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        {user.friendshipStatus === 'friends' && (
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                            Friends
                          </span>
                        )}
                        {user.friendshipStatus === 'request_sent' && (
                          <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                            Request Sent
                          </span>
                        )}
                        {user.friendshipStatus === 'request_received' && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            Request Received
                          </span>
                        )}
                        {user.friendshipStatus === 'none' && (
                          <Button
                            onClick={() => handleSendRequest(user.id, `${user.first_name} ${user.last_name}`)}
                            size="sm"
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                          >
                            <UserPlus className="w-4 h-4 mr-1" />
                            Add Friend
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-white shadow-md text-indigo-600"
                    : "bg-white/50 text-gray-600 hover:bg-white/80"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      activeTab === tab.id
                        ? "bg-indigo-100 text-indigo-600"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="space-y-4">
          {activeTab === "friends" && (
            <>
              {friends.length === 0 ? (
                <Card className="bg-white/70 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No friends yet</h3>
                    <p className="text-gray-500">
                      Start adding friends to see events they are interested in!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                friends.map((friend) => (
                  <Card
                    key={friend.id}
                    className="bg-white/70 backdrop-blur-sm border-white/50 shadow-md hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => navigate(`/friends/${friend.id}`)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar
                            src={friend.profile_picture_url}
                            firstName={friend.first_name}
                            lastName={friend.last_name}
                            size="md"
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {friend.first_name} {friend.last_name}
                            </h3>
                            {friend.username && (
                              <p className="text-sm text-gray-500">@{friend.username}</p>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnfriend(friend.id, `${friend.first_name} ${friend.last_name}`);
                          }}
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <UserMinus className="w-4 h-4 mr-1" />
                          Unfriend
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </>
          )}

          {activeTab === "pending" && (
            <>
              {pendingRequests.length === 0 ? (
                <Card className="bg-white/70 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <UserPlus className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      No pending requests
                    </h3>
                    <p className="text-gray-500">You are all caught up!</p>
                  </CardContent>
                </Card>
              ) : (
                pendingRequests.map((request) => (
                  <Card
                    key={request.requestId}
                    className="bg-white/70 backdrop-blur-sm border-white/50 shadow-md hover:shadow-lg transition-all"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar
                            src={request.profile_picture_url}
                            firstName={request.first_name}
                            lastName={request.last_name}
                            size="md"
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {request.first_name} {request.last_name}
                            </h3>
                            {request.username && (
                              <p className="text-sm text-gray-500">
                                @{request.username}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(request.requestedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAcceptRequest(request.requestId)}
                            size="sm"
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            onClick={() => handleRejectRequest(request.requestId)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </>
          )}

          {activeTab === "sent" && (
            <>
              {sentRequests.length === 0 ? (
                <Card className="bg-white/70 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <UserCheck className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      No sent requests
                    </h3>
                    <p className="text-gray-500">Send friend requests to connect with others!</p>
                  </CardContent>
                </Card>
              ) : (
                sentRequests.map((request) => (
                  <Card
                    key={request.requestId}
                    className="bg-white/70 backdrop-blur-sm border-white/50 shadow-md"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar
                            src={request.profile_picture_url}
                            firstName={request.first_name}
                            lastName={request.last_name}
                            size="md"
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {request.first_name} {request.last_name}
                            </h3>
                            {request.username && (
                              <p className="text-sm text-gray-500">@{request.username}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              Sent {new Date(request.requestedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                          Pending
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
