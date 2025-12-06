import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addUserEvent, updateUserEventStatus, removeUserEvent } from '../api/userEventsApi';

/**
 * Custom hook for event mutations with automatic cache invalidation
 * Keeps the events list fresh when users interact with events
 */
export function useEventMutations() {
  const queryClient = useQueryClient();

  // Add event mutation
  const addEventMutation = useMutation({
    mutationFn: addUserEvent,
    onSuccess: () => {
      // Invalidate events cache to refetch with updated status
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  // Update event status mutation
  const updateEventMutation = useMutation({
    mutationFn: ({ eventId, status }) => updateUserEventStatus(eventId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  // Remove event mutation
  const removeEventMutation = useMutation({
    mutationFn: removeUserEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  return {
    addEvent: addEventMutation.mutateAsync,
    updateEvent: updateEventMutation.mutateAsync,
    removeEvent: removeEventMutation.mutateAsync,
  };
}
