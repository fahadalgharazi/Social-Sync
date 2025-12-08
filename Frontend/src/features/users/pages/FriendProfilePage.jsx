import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, Heart, Users, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { toast } from "sonner";
import { getUserProfile } from "../api/usersApi";
import { getFriendEvents } from "../api/friendEventsApi";

export default function FriendProfilePage() {
  const { friendId } = useParams();
  const navigate = useNavigate();
  const [friend, setFriend] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [friendId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [friendData, eventsData] = await Promise.all([
        getUserProfile(friendId),
        getFriendEvents(friendId),
      ]);
      setFriend(friendData);
      setEvents(eventsData);
    } catch (error) {
      console.error("Error loading friend profile:", error);
      toast.error("Failed to load friend profile");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!friend) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User not found</h2>
          <Button onClick={() => navigate("/friends")}>Back to Friends</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => navigate("/friends")}
          className="mb-6 bg-white/70 backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Friends
        </Button>

        {/* Friend Profile Header */}
        <Card className="mb-8 bg-white/70 backdrop-blur-sm border-white/50 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center gap-6">
              <Avatar
                src={friend.profile_picture_url}
                firstName={friend.first_name}
                lastName={friend.last_name}
                size="xl"
              />
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {friend.first_name} {friend.last_name}
                </h1>
                {friend.username && (
                  <p className="text-lg text-gray-600 mb-2">@{friend.username}</p>
                )}
                {friend.bio && (
                  <p className="text-gray-700 mb-2">{friend.bio}</p>
                )}
                {(friend.city || friend.state) && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {friend.city}
                      {friend.city && friend.state && ", "}
                      {friend.state}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Friend's Events */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Events {friend.first_name} is attending
          </h2>

          {events.length === 0 ? (
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No events yet</h3>
                <p className="text-gray-500">
                  {friend.first_name} hasn't added any events yet
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((event) => (
                <Card
                  key={event.id}
                  className="bg-white/70 backdrop-blur-sm border-white/50 shadow-md hover:shadow-lg transition-all"
                >
                  <CardContent className="p-5">
                    {event.image_url && (
                      <div className="relative h-40 -mx-5 -mt-5 mb-4 overflow-hidden rounded-t-lg">
                        <img
                          src={event.image_url}
                          alt={event.event_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 text-lg line-clamp-2">
                        {event.event_name}
                      </h3>

                      {event.event_date && (
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0 text-indigo-500" />
                          <span>{formatDate(event.event_date)}</span>
                        </div>
                      )}

                      {(event.venue_name || event.venue_city) && (
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-indigo-500" />
                          <span className="line-clamp-1">
                            {event.venue_name}
                            {event.venue_name && event.venue_city && " • "}
                            {event.venue_city}
                          </span>
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="pt-2">
                        {event.status === 'interested' && (
                          <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 rounded-full text-sm font-medium">
                            <Heart className="w-3 h-3 mr-1" />
                            Interested
                          </span>
                        )}
                        {event.status === 'going' && (
                          <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-full text-sm font-medium">
                            <Users className="w-3 h-3 mr-1" />
                            Going
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
