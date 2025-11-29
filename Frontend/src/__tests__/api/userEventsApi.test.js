import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  addUserEvent,
  getUserEvents,
  updateUserEventStatus,
  removeUserEvent,
  getFriendsAttendingEvent,
} from '../../features/events/api/userEventsApi';

// Mock axios
vi.mock('axios');

describe('User Events API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addUserEvent', () => {
    it('should add a user event successfully', async () => {
      const mockEventData = {
        eventId: 'event-1',
        eventName: 'Concert',
        eventDate: '2024-07-15',
        venueName: 'Arena',
        status: 'going',
      };

      const mockResponse = {
        data: {
          success: true,
          data: { id: 'user-event-1', ...mockEventData },
        },
      };

      axios.post = vi.fn().mockResolvedValue(mockResponse);

      const result = await addUserEvent(mockEventData);

      expect(axios.post).toHaveBeenCalledWith('/user-events', {
        event_id: 'event-1',
        event_name: 'Concert',
        event_date: '2024-07-15',
        venue_name: 'Arena',
        status: 'going',
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getUserEvents', () => {
    it('should fetch user events successfully', async () => {
      const mockEvents = [
        { event_id: 'event-1', event_name: 'Concert', status: 'going' },
        { event_id: 'event-2', event_name: 'Festival', status: 'interested' },
      ];

      const mockResponse = {
        data: {
          success: true,
          data: mockEvents,
        },
      };

      axios.get = vi.fn().mockResolvedValue(mockResponse);

      const result = await getUserEvents();

      expect(axios.get).toHaveBeenCalledWith('/user-events');
      expect(result).toEqual(mockEvents);
    });

    it('should return empty array when no data', async () => {
      const mockResponse = {
        data: {
          success: true,
        },
      };

      axios.get = vi.fn().mockResolvedValue(mockResponse);

      const result = await getUserEvents();

      expect(result).toEqual([]);
    });
  });

  describe('updateUserEventStatus', () => {
    it('should update event status successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { event_id: 'event-1', status: 'interested' },
        },
      };

      axios.patch = vi.fn().mockResolvedValue(mockResponse);

      const result = await updateUserEventStatus('event-1', 'interested');

      expect(axios.patch).toHaveBeenCalledWith('/user-events/event-1', {
        status: 'interested',
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('removeUserEvent', () => {
    it('should remove event successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
        },
      };

      axios.delete = vi.fn().mockResolvedValue(mockResponse);

      const result = await removeUserEvent('event-1');

      expect(axios.delete).toHaveBeenCalledWith('/user-events/event-1');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getFriendsAttendingEvent', () => {
    it('should fetch friends attending an event', async () => {
      const mockFriends = [
        { id: 'friend-1', first_name: 'John', last_name: 'Doe' },
        { id: 'friend-2', first_name: 'Jane', last_name: 'Smith' },
      ];

      const mockResponse = {
        data: {
          success: true,
          data: mockFriends,
        },
      };

      axios.get = vi.fn().mockResolvedValue(mockResponse);

      const result = await getFriendsAttendingEvent('event-1');

      expect(axios.get).toHaveBeenCalledWith('/user-events/event/event-1/friends');
      expect(result).toEqual(mockFriends);
    });
  });
});
