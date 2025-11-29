import { useState, useEffect } from "react";
import { Users, UserPlus, UserCheck, UserMinus, Check, X, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  getFriends,
  getPendingRequests,
  getSentRequests,
  respondToRequest,
  unfriend,
} from "../api/friendsApi";

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState("friends");
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Friends</h1>
          <p className="text-gray-600">Manage your connections and friend requests</p>
        </div>

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
                    className="bg-white/70 backdrop-blur-sm border-white/50 shadow-md hover:shadow-lg transition-all"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {friend.first_name?.[0]}{friend.last_name?.[0]}
                          </div>
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
                          onClick={() =>
                            handleUnfriend(friend.id, `${friend.first_name} ${friend.last_name}`)
                          }
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
                    key={request.id}
                    className="bg-white/70 backdrop-blur-sm border-white/50 shadow-md hover:shadow-lg transition-all"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {request.requester?.first_name?.[0]}{request.requester?.last_name?.[0]}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {request.requester?.first_name} {request.requester?.last_name}
                            </h3>
                            {request.requester?.username && (
                              <p className="text-sm text-gray-500">
                                @{request.requester.username}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAcceptRequest(request.id)}
                            size="sm"
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            onClick={() => handleRejectRequest(request.id)}
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
                    key={request.id}
                    className="bg-white/70 backdrop-blur-sm border-white/50 shadow-md"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {request.receiver?.first_name?.[0]}{request.receiver?.last_name?.[0]}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {request.receiver?.first_name} {request.receiver?.last_name}
                            </h3>
                            {request.receiver?.username && (
                              <p className="text-sm text-gray-500">@{request.receiver.username}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              Sent {new Date(request.created_at).toLocaleDateString()}
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
