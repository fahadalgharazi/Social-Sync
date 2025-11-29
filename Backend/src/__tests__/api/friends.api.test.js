import { describe, it, expect, jest, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import friendsRouter from '../../routes/friends.routes.js';
import errorHandler from '../../middlewares/errorHandler.js';

// Mock auth middleware to always authenticate
jest.mock('../../middlewares/auth.js', () => ({
  __esModule: true,
  default: (req, res, next) => {
    req.user = { id: 'test-user-id' };
    next();
  },
}));

// Mock the friends service
jest.mock('../../services/friends.service.js', () => ({
  sendFriendRequest: jest.fn(),
  getFriends: jest.fn(),
  getPendingRequests: jest.fn(),
  getSentRequests: jest.fn(),
  acceptFriendRequest: jest.fn(),
  rejectFriendRequest: jest.fn(),
  unfriend: jest.fn(),
}));

import * as FriendsService from '../../services/friends.service.js';

describe('Friends API Integration Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/friends', friendsRouter);
    app.use(errorHandler);
  });

  describe('POST /friends/request', () => {
    it('should send a friend request successfully', async () => {
      FriendsService.sendFriendRequest.mockResolvedValue({
        id: 'request-1',
        user_id: 'test-user-id',
        friend_id: 'friend-id',
        status: 'pending',
      });

      const response = await request(app)
        .post('/friends/request')
        .send({ friendId: 'friend-id' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(FriendsService.sendFriendRequest).toHaveBeenCalledWith(
        'test-user-id',
        'friend-id'
      );
    });

    it('should return 400 for invalid friendId', async () => {
      const response = await request(app)
        .post('/friends/request')
        .send({ friendId: 'invalid-id' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /friends', () => {
    it('should return list of friends', async () => {
      const mockFriends = [
        { id: 'friend-1', first_name: 'John', last_name: 'Doe' },
        { id: 'friend-2', first_name: 'Jane', last_name: 'Smith' },
      ];

      FriendsService.getFriends.mockResolvedValue(mockFriends);

      const response = await request(app).get('/friends').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockFriends);
      expect(FriendsService.getFriends).toHaveBeenCalledWith('test-user-id');
    });
  });

  describe('GET /friends/requests/pending', () => {
    it('should return pending friend requests', async () => {
      const mockRequests = [
        {
          id: 'request-1',
          requester: { first_name: 'John', last_name: 'Doe' },
        },
      ];

      FriendsService.getPendingRequests.mockResolvedValue(mockRequests);

      const response = await request(app)
        .get('/friends/requests/pending')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockRequests);
    });
  });

  describe('POST /friends/requests/:requestId/respond', () => {
    it('should accept a friend request', async () => {
      FriendsService.acceptFriendRequest.mockResolvedValue({
        id: 'request-1',
        status: 'accepted',
      });

      const response = await request(app)
        .post('/friends/requests/request-1/respond')
        .send({ action: 'accept' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(FriendsService.acceptFriendRequest).toHaveBeenCalledWith(
        'test-user-id',
        'request-1'
      );
    });

    it('should reject a friend request', async () => {
      FriendsService.rejectFriendRequest.mockResolvedValue({
        id: 'request-1',
        status: 'rejected',
      });

      const response = await request(app)
        .post('/friends/requests/request-1/respond')
        .send({ action: 'reject' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(FriendsService.rejectFriendRequest).toHaveBeenCalledWith(
        'test-user-id',
        'request-1'
      );
    });
  });

  describe('DELETE /friends/:friendId', () => {
    it('should unfriend a user', async () => {
      FriendsService.unfriend.mockResolvedValue(true);

      const response = await request(app)
        .delete('/friends/friend-id')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(FriendsService.unfriend).toHaveBeenCalledWith(
        'test-user-id',
        'friend-id'
      );
    });
  });
});
