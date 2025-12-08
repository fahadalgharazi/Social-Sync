import { describe, it, expect, jest, beforeAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import userEventsRouter from '../../routes/userEvents.routes.js';
import errorHandler from '../../middlewares/errorHandler.js';

// Mock auth middleware
jest.mock('../../middlewares/auth.js', () => ({
  __esModule: true,
  default: (req, res, next) => {
    req.user = { id: 'test-user-id' };
    next();
  },
}));

// Mock the user events service
jest.mock('../../services/userEvents.service.js', () => ({
  addUserEvent: jest.fn(),
  getUserEvents: jest.fn(),
  updateUserEventStatus: jest.fn(),
  removeUserEvent: jest.fn(),
  getFriendsAttendingEvent: jest.fn(),
  getFriendEvents: jest.fn(),
}));

import * as UserEventsService from '../../services/userEvents.service.js';

describe('User Events API Integration Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/user-events', userEventsRouter);
    app.use(errorHandler);
  });

  describe('POST /user-events', () => {
    it('should add an event to user events', async () => {
      const mockEvent = {
        event_id: 'event-1',
        event_name: 'Concert',
        event_date: new Date().toISOString(),
        venue_name: 'Arena',
        status: 'going',
      };

      UserEventsService.addUserEvent.mockResolvedValue({
        id: 'user-event-1',
        ...mockEvent,
        user_id: 'test-user-id',
      });

      const response = await request(app)
        .post('/user-events')
        .send(mockEvent)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(UserEventsService.addUserEvent).toHaveBeenCalledWith(
        'test-user-id',
        mockEvent
      );
    });

    it('should return 400 for invalid status', async () => {
      const response = await request(app)
        .post('/user-events')
        .send({
          event_id: 'event-1',
          event_name: 'Concert',
          event_date: new Date().toISOString(),
          status: 'invalid-status',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /user-events', () => {
    it('should return user events', async () => {
      const mockEvents = [
        {
          event_id: 'event-1',
          event_name: 'Concert',
          status: 'going',
        },
        {
          event_id: 'event-2',
          event_name: 'Festival',
          status: 'interested',
        },
      ];

      UserEventsService.getUserEvents.mockResolvedValue(mockEvents);

      const response = await request(app).get('/user-events').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockEvents);
    });
  });

  describe('PATCH /user-events/:eventId', () => {
    it('should update event status', async () => {
      UserEventsService.updateUserEventStatus.mockResolvedValue({
        event_id: 'event-1',
        status: 'interested',
      });

      const response = await request(app)
        .patch('/user-events/event-1')
        .send({ status: 'interested' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(UserEventsService.updateUserEventStatus).toHaveBeenCalledWith(
        'test-user-id',
        'event-1',
        'interested'
      );
    });
  });

  describe('DELETE /user-events/:eventId', () => {
    it('should remove event from user events', async () => {
      UserEventsService.removeUserEvent.mockResolvedValue(true);

      const response = await request(app)
        .delete('/user-events/event-1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(UserEventsService.removeUserEvent).toHaveBeenCalledWith(
        'test-user-id',
        'event-1'
      );
    });
  });

  describe('GET /user-events/event/:eventId/friends', () => {
    it('should return friends attending an event', async () => {
      const mockFriends = [
        { id: 'friend-1', first_name: 'John', last_name: 'Doe' },
      ];

      UserEventsService.getFriendsAttendingEvent.mockResolvedValue(mockFriends);

      const response = await request(app)
        .get('/user-events/event/event-1/friends')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockFriends);
    });
  });
});
