import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  getFriends,
  getPendingRequests,
  sendFriendRequest,
  respondToRequest,
  unfriend,
} from '../../features/friends/api/friendsApi';

// Mock axios
vi.mock('axios');

describe('Friends API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getFriends', () => {
    it('should fetch friends list successfully', async () => {
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

      const result = await getFriends();

      expect(axios.get).toHaveBeenCalledWith('/friends');
      expect(result).toEqual(mockFriends);
    });
  });

  describe('getPendingRequests', () => {
    it('should fetch pending requests successfully', async () => {
      const mockRequests = [
        {
          id: 'request-1',
          requester: { first_name: 'John', last_name: 'Doe' },
        },
      ];

      const mockResponse = {
        data: {
          success: true,
          data: mockRequests,
        },
      };

      axios.get = vi.fn().mockResolvedValue(mockResponse);

      const result = await getPendingRequests();

      expect(axios.get).toHaveBeenCalledWith('/friends/requests/pending');
      expect(result).toEqual(mockRequests);
    });
  });

  describe('sendFriendRequest', () => {
    it('should send friend request successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { id: 'request-1', status: 'pending' },
        },
      };

      axios.post = vi.fn().mockResolvedValue(mockResponse);

      const result = await sendFriendRequest('friend-id');

      expect(axios.post).toHaveBeenCalledWith('/friends/request', {
        friendId: 'friend-id',
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('respondToRequest', () => {
    it('should accept friend request', async () => {
      const mockResponse = {
        data: {
          success: true,
        },
      };

      axios.post = vi.fn().mockResolvedValue(mockResponse);

      const result = await respondToRequest('request-1', 'accept');

      expect(axios.post).toHaveBeenCalledWith('/friends/requests/request-1/respond', {
        action: 'accept',
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should reject friend request', async () => {
      const mockResponse = {
        data: {
          success: true,
        },
      };

      axios.post = vi.fn().mockResolvedValue(mockResponse);

      const result = await respondToRequest('request-1', 'reject');

      expect(axios.post).toHaveBeenCalledWith('/friends/requests/request-1/respond', {
        action: 'reject',
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('unfriend', () => {
    it('should unfriend a user successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
        },
      };

      axios.delete = vi.fn().mockResolvedValue(mockResponse);

      const result = await unfriend('friend-id');

      expect(axios.delete).toHaveBeenCalledWith('/friends/friend-id');
      expect(result).toEqual(mockResponse.data);
    });
  });
});
