import { useState, useEffect } from "react";
import { User, Calendar, Heart, Users, MapPin, ExternalLink, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getUserEvents } from "../../events/api/userEventsApi";
import { getMe } from "../../events/api/eventsApi";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("going");
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [userEventsData, userData] = await Promise.all([
        getUserEvents(),
        getMe(),
      ]);
      setEvents(userEventsData);
      setUser(userData);
    } catch (error) {
      console.error("Error loading profile data:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const goingEvents = events.filter((e) => e.status === "going");
  const interestedEvents = events.filter((e) => e.status === "interested");

  const tabs = [
    {
      id: "going",
      label: "Going",
      icon: Users,
      count: goingEvents.length,
    },
    {
      id: "interested",
      label: "Interested",
      icon: Heart,
      count: interestedEvents.length,
    },
  ];

  const displayEvents = activeTab === "going" ? goingEvents : interestedEvents;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-lg mb-8">
          <CardContent className="p-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {user?.first_name} {user?.last_name}
                </h1>
                {user?.username && (
                  <p className="text-lg text-gray-600 mb-2">@{user.username}</p>
                )}
                <div className="flex gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{goingEvents.length} events</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    <span>{interestedEvents.length} interested</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
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

        {/* Events List */}
        <div className="space-y-4">
          {displayEvents.length === 0 ? (
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                {activeTab === "going" ? (
                  <>
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      No events yet
                    </h3>
                    <p className="text-gray-500">
                      Browse events and mark yourself as going!
                    </p>
                  </>
                ) : (
                  <>
                    <Heart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      No interested events
                    </h3>
                    <p className="text-gray-500">
                      Mark events you are interested in to see them here!
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            displayEvents.map((event) => (
              <Card
                key={event.event_id}
                className="bg-white/70 backdrop-blur-sm border-white/50 shadow-md hover:shadow-lg transition-all"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {event.event_name}
                      </h3>
                      <div className="space-y-2">
                        {event.event_date && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-indigo-500" />
                            <span>
                              {new Date(event.event_date).toLocaleDateString("en-US", {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        )}
                        {event.venue_name && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-indigo-500" />
                            <span>{event.venue_name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              event.status === "going"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-pink-100 text-pink-700"
                            }`}
                          >
                            {event.status === "going" ? "Going" : "Interested"}
                          </span>
                          <span className="text-xs text-gray-500">
                            Added {new Date(event.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
