import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  MapPin,
  Users,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Heart,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { searchEvents, getMe } from "../features/events/api/eventsApi";
import EventCard from "../features/events/components/EventCard";

export default function EventsPage() {
  const [page, setPage] = useState(0);

  // Fetch user data with caching (refetch only when stale)
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => getMe().catch(() => null),
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  // Fetch events with caching and automatic refetching
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['events', page],
    queryFn: async () => {
      const result = await searchEvents({
        page,
        limit: 20,
      });
      return result;
    },
    staleTime: 3 * 60 * 1000, // Consider data fresh for 3 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });

  const items = data?.items || [];
  const pagination = data?.pagination || { page: 0, totalPages: 0, total: 0, limit: 20 };
  const personality = data?.meta?.personalityType || null;

  const canPrev = pagination.page > 0;
  const canNext = pagination.page + 1 < pagination.totalPages;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading events...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <Card className="bg-white/70 backdrop-blur-xl border-white/50 shadow-xl max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Events</h2>
            <p className="text-gray-600 mb-4">
              {error?.response?.data?.message || error?.message || "Failed to load events"}
            </p>
            <Button
              onClick={() => setPage(0)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative bg-white/90 backdrop-blur-xl border-b border-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Events Near You
                </h1>
                <p className="text-gray-600 mt-1">
                  Discover experiences tailored to your personality
                </p>
              </div>
            </div>

            {/* Personality Badge */}
            {personality && (
              <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
                <CardContent className="p-4 flex items-center space-x-3">
                  <Brain className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="text-xs text-indigo-600 font-medium">Your Personality Match</p>
                    <p className="text-sm font-semibold text-indigo-800">{personality}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Stats and Pagination Controls */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{pagination.total} events found</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>
                  Page {pagination.page + 1} of {Math.max(pagination.totalPages, 1)}
                </span>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(prev => prev - 1)}
                disabled={!canPrev}
                className="bg-white/50 backdrop-blur-sm"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(prev => prev + 1)}
                disabled={!canNext}
                className="bg-white/50 backdrop-blur-sm"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {items.length === 0 ? (
          <Card className="bg-white/70 backdrop-blur-xl border-white/50 shadow-xl">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">No Events Found</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                We're widening the search radius and including virtual events. Check back soon for
                personalized recommendations!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {/* Bottom Pagination */}
        {items.length > 0 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center space-x-2 bg-white/70 backdrop-blur-xl border border-white/50 rounded-xl p-2 shadow-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(prev => prev - 1)}
                disabled={!canPrev}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="px-4 text-sm font-medium text-gray-700">
                Page {pagination.page + 1} of {Math.max(pagination.totalPages, 1)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(prev => prev + 1)}
                disabled={!canNext}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
