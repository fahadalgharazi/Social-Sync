import { MapPin, Calendar, ExternalLink, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EventCard({ event }) {
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
