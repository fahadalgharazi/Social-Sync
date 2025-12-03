import { useState, useEffect, useRef } from "react";
import { MapPin, Calendar, ExternalLink, Users, UserCheck, Heart, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { addUserEvent, updateUserEventStatus, removeUserEvent } from "../api/userEventsApi";
import { toast } from "sonner";

/**
 * Format event date and time into a valid ISO datetime string
 * Handles various date formats from Ticketmaster API
 */
function formatEventDateTime(date, time) {
  if (!date) {
    // Fallback to current time if no date provided
    return new Date().toISOString();
  }

  try {
    // If date already includes time info (ISO 8601 format), use it directly
    if (date.includes('T')) {
      return new Date(date).toISOString();
    }

    // Combine date and time
    // date format: "2024-12-15"
    // time format: "19:00:00" or empty
    const dateTimeString = time ? `${date}T${time}` : `${date}T00:00:00`;
    return new Date(dateTimeString).toISOString();
  } catch (error) {
    console.error('Error formatting event datetime:', error);
    return new Date().toISOString();
  }
}

export default function EventCard({ event }) {
  const [userStatus, setUserStatus] = useState(event.userStatus || null);
  const [isLoading, setIsLoading] = useState(false);
  const isMountedRef = useRef(true);

  // Sync userStatus when event.userStatus changes
  useEffect(() => {
    setUserStatus(event.userStatus || null);
  }, [event.userStatus]);

  // Cleanup on unmount to prevent state updates
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleStatusChange = async (newStatus) => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      // If clicking the same status, remove the event
      if (userStatus === newStatus) {
        await removeUserEvent(event.id);
        if (isMountedRef.current) {
          setUserStatus(null);
          toast.success("Event removed from your list");
        }
        return;
      }

      // If user already has a status, update it
      if (userStatus) {
        await updateUserEventStatus(event.id, newStatus);
        if (isMountedRef.current) {
          setUserStatus(newStatus);
          toast.success(`Status updated to ${newStatus}`);
        }
      } else {
        // Otherwise, add new event
        await addUserEvent({
          eventId: event.id,
          eventName: event.name,
          eventDate: formatEventDateTime(event.date, event.time),
          venueName: event.venueName,
          status: newStatus,
        });
        if (isMountedRef.current) {
          setUserStatus(newStatus);
          toast.success(`Added to ${newStatus} list`);
        }
      }
    } catch (error) {
      console.error("Error updating event status:", error);
      if (isMountedRef.current) {
        toast.error(error.response?.data?.message || "Failed to update status");
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };
  return (
    <Card className="group bg-white/70 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
      {/* Event Image */}
      {event.imageUrl && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}

      <CardContent className="p-5 space-y-3">
        {/* Event Title */}
        <h3 className="font-semibold text-gray-800 text-lg leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {event.name}
        </h3>

        {/* Event Details */}
        <div className="space-y-2">
          {event.date && (
            <div className="flex items-start space-x-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0 text-indigo-500" />
              <span className="line-clamp-1">{event.date}</span>
            </div>
          )}

          {(event.venueName || event.venueCity) && (
            <div className="flex items-start space-x-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-indigo-500" />
              <span className="line-clamp-1">
                {event.venueName}
                {event.venueName && event.venueCity && " • "}
                {event.venueCity}
              </span>
            </div>
          )}

          {event.attendees && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="w-4 h-4 text-indigo-500" />
              <span>{event.attendees} attending</span>
            </div>
          )}

          {/* Friends Attending Badge */}
          {event.friendsCount > 0 && (
            <div className="flex items-center space-x-2 text-sm">
              <UserCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-emerald-600 font-medium">
                {event.friendsCount} {event.friendsCount === 1 ? 'friend' : 'friends'} attending
              </span>
            </div>
          )}
        </div>

        {/* Status Buttons */}
        <div className="flex gap-2 mt-4">
          <Button
            onClick={() => handleStatusChange('interested')}
            disabled={isLoading}
            variant={userStatus === 'interested' ? 'default' : 'outline'}
            className={`flex-1 transition-all duration-200 ${
              userStatus === 'interested'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white'
                : 'border-pink-300 text-pink-600 hover:bg-pink-50'
            }`}
            size="sm"
          >
            {userStatus === 'interested' ? (
              <>
                <Check className="w-4 h-4 mr-1" />
                Interested
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 mr-1" />
                Interested
              </>
            )}
          </Button>

          <Button
            onClick={() => handleStatusChange('going')}
            disabled={isLoading}
            variant={userStatus === 'going' ? 'default' : 'outline'}
            className={`flex-1 transition-all duration-200 ${
              userStatus === 'going'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white'
                : 'border-emerald-300 text-emerald-600 hover:bg-emerald-50'
            }`}
            size="sm"
          >
            {userStatus === 'going' ? (
              <>
                <Check className="w-4 h-4 mr-1" />
                Going
              </>
            ) : (
              <>
                <Users className="w-4 h-4 mr-1" />
                Going
              </>
            )}
          </Button>
        </div>

        {/* Event Link */}
        {event.url && (
          <a href={event.url} target="_blank" rel="noreferrer" className="block mt-4">
            <Button
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
              size="sm"
            >
              View Event
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </a>
        )}
      </CardContent>

      {/* Optional: Event Category Badge */}
      {event.category && (
        <div className="absolute top-3 right-3">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold text-indigo-600 rounded-full shadow-md">
            {event.category}
          </span>
        </div>
      )}
    </Card>
  );
}
