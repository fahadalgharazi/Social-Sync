import { describe, it, expect, jest, beforeAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import groupsRouter from '../../routes/groups.routes.js';
import errorHandler from '../../middlewares/errorHandler.js';

// Mock auth middleware
jest.mock('../../middlewares/auth.js', () => ({
  __esModule: true,
  default: (req, res, next) => {
    req.user = { id: 'test-user-id' };
    next();
  },
}));

// Mock the groups service
jest.mock('../../services/groups.service.js', () => ({
  createGroup: jest.fn(),
  getUserGroups: jest.fn(),
  getGroup: jest.fn(),
  updateGroup: jest.fn(),
  deleteGroup: jest.fn(),
  getGroupMembers: jest.fn(),
  addMember: jest.fn(),
  removeMember: jest.fn(),
  getGroupEvents: jest.fn(),
  addGroupEvent: jest.fn(),
  removeGroupEvent: jest.fn(),
}));

import * as GroupsService from '../../services/groups.service.js';

describe('Groups API Integration Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/groups', groupsRouter);
    app.use(errorHandler);
  });

  describe('POST /groups', () => {
    it('should create a new group', async () => {
      const mockGroup = {
        id: 'group-1',
        name: 'Test Group',
        description: 'A test group',
        is_private: false,
        created_by: 'test-user-id',
      };

      GroupsService.createGroup.mockResolvedValue(mockGroup);

      const response = await request(app)
        .post('/groups')
        .send({
          name: 'Test Group',
          description: 'A test group',
          is_private: false,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockGroup);
    });

    it('should return 400 for invalid group name', async () => {
      const response = await request(app)
        .post('/groups')
        .send({
          name: 'AB', // Too short
          is_private: false,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /groups', () => {
    it('should return user groups', async () => {
      const mockGroups = [
        { id: 'group-1', name: 'Group 1', role: 'admin' },
        { id: 'group-2', name: 'Group 2', role: 'member' },
      ];

      GroupsService.getUserGroups.mockResolvedValue(mockGroups);

      const response = await request(app).get('/groups').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockGroups);
    });
  });

  describe('GET /groups/:groupId', () => {
    it('should return group details', async () => {
      const mockGroup = {
        id: 'group-1',
        name: 'Test Group',
        description: 'A test group',
      };

      GroupsService.getGroup.mockResolvedValue(mockGroup);

      const response = await request(app).get('/groups/group-1').expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockGroup);
    });
  });

  describe('PATCH /groups/:groupId', () => {
    it('should update group details', async () => {
      const updatedGroup = {
        id: 'group-1',
        name: 'Updated Group',
        description: 'Updated description',
      };

      GroupsService.updateGroup.mockResolvedValue(updatedGroup);

      const response = await request(app)
        .patch('/groups/group-1')
        .send({
          name: 'Updated Group',
          description: 'Updated description',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(updatedGroup);
    });
  });

  describe('DELETE /groups/:groupId', () => {
    it('should delete a group', async () => {
      GroupsService.deleteGroup.mockResolvedValue(true);

      const response = await request(app).delete('/groups/group-1').expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /groups/:groupId/members', () => {
    it('should return group members', async () => {
      const mockMembers = [
        {
          user_id: 'user-1',
          role: 'admin',
          profile: { first_name: 'John', last_name: 'Doe' },
        },
        {
          user_id: 'user-2',
          role: 'member',
          profile: { first_name: 'Jane', last_name: 'Smith' },
        },
      ];

      GroupsService.getGroupMembers.mockResolvedValue(mockMembers);

      const response = await request(app)
        .get('/groups/group-1/members')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockMembers);
    });
  });

  describe('POST /groups/:groupId/members', () => {
    it('should add a member to the group', async () => {
      GroupsService.addMember.mockResolvedValue({
        group_id: 'group-1',
        user_id: 'user-2',
        role: 'member',
      });

      const response = await request(app)
        .post('/groups/group-1/members')
        .send({ user_id: 'user-2', role: 'member' })
        .expect(201);

      expect(response.body.success).toBe(true);
    });
  });

  describe('DELETE /groups/:groupId/members/:userId', () => {
    it('should remove a member from the group', async () => {
      GroupsService.removeMember.mockResolvedValue(true);

      const response = await request(app)
        .delete('/groups/group-1/members/user-2')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /groups/:groupId/events', () => {
    it('should add an event to the group', async () => {
      GroupsService.addGroupEvent.mockResolvedValue({
        group_id: 'group-1',
        event_id: 'event-1',
      });

      const response = await request(app)
        .post('/groups/group-1/events')
        .send({ event_id: 'event-1' })
        .expect(201);

      expect(response.body.success).toBe(true);
    });
  });
});
