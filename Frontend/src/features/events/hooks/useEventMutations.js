import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addUserEvent, updateUserEventStatus, removeUserEvent } from '../api/userEventsApi';

export function useEventMutations() {
  const queryClient = useQueryClient();

  const addEventMutation = useMutation({
    mutationFn: addUserEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ eventId, status }) => updateUserEventStatus(eventId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

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
