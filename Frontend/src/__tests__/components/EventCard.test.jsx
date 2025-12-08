import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EventCard from '../../features/events/components/EventCard';
import * as userEventsApi from '../../features/events/api/userEventsApi';

// Mock the API
vi.mock('../../features/events/api/userEventsApi');

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('EventCard Component', () => {
  const mockEvent = {
    id: 'event-1',
    name: 'Summer Music Festival',
    date: '2024-07-15',
    venueName: 'Central Park',
    venueCity: 'New York',
    imageUrl: 'https://example.com/image.jpg',
    url: 'https://example.com/event',
    attendees: 150,
    friendsCount: 3,
    friendsAttending: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render event details correctly', () => {
    render(<EventCard event={mockEvent} />);

    expect(screen.getByText('Summer Music Festival')).toBeInTheDocument();
    expect(screen.getByText(/Central Park/)).toBeInTheDocument();
    expect(screen.getByText(/New York/)).toBeInTheDocument();
    expect(screen.getByText('150 attending')).toBeInTheDocument();
  });

  it('should display friends attending badge when friendsCount > 0', () => {
    render(<EventCard event={mockEvent} />);

    expect(screen.getByText('3 friends attending')).toBeInTheDocument();
  });

  it('should not display friends badge when friendsCount is 0', () => {
    const eventWithNoFriends = { ...mockEvent, friendsCount: 0 };
    render(<EventCard event={eventWithNoFriends} />);

    expect(screen.queryByText(/friends attending/)).not.toBeInTheDocument();
  });

  it('should render interested and going buttons', () => {
    render(<EventCard event={mockEvent} />);

    expect(screen.getByRole('button', { name: /interested/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /going/i })).toBeInTheDocument();
  });

  it('should call addUserEvent when clicking interested button', async () => {
    userEventsApi.addUserEvent.mockResolvedValue({ success: true });

    render(<EventCard event={mockEvent} />);

    const interestedButton = screen.getByRole('button', { name: /interested/i });
    fireEvent.click(interestedButton);

    await waitFor(() => {
      expect(userEventsApi.addUserEvent).toHaveBeenCalledWith({
        eventId: 'event-1',
        eventName: 'Summer Music Festival',
        eventDate: expect.any(String),
        venueName: 'Central Park',
        status: 'interested',
      });
    });
  });

  it('should call addUserEvent when clicking going button', async () => {
    userEventsApi.addUserEvent.mockResolvedValue({ success: true });

    render(<EventCard event={mockEvent} />);

    const goingButton = screen.getByRole('button', { name: /going/i });
    fireEvent.click(goingButton);

    await waitFor(() => {
      expect(userEventsApi.addUserEvent).toHaveBeenCalledWith({
        eventId: 'event-1',
        eventName: 'Summer Music Festival',
        eventDate: expect.any(String),
        venueName: 'Central Park',
        status: 'going',
      });
    });
  });

  it('should show active state when user is already interested', () => {
    const eventWithStatus = { ...mockEvent, userStatus: 'interested' };
    render(<EventCard event={eventWithStatus} />);

    const interestedButton = screen.getByRole('button', { name: /interested/i });
    expect(interestedButton).toHaveClass(/from-pink-500/);
  });

  it('should toggle status when clicking same button twice', async () => {
    userEventsApi.addUserEvent.mockResolvedValue({ success: true });
    userEventsApi.removeUserEvent.mockResolvedValue({ success: true });

    const eventWithStatus = { ...mockEvent, userStatus: 'interested' };
    render(<EventCard event={eventWithStatus} />);

    const interestedButton = screen.getByRole('button', { name: /interested/i });
    fireEvent.click(interestedButton);

    await waitFor(() => {
      expect(userEventsApi.removeUserEvent).toHaveBeenCalledWith('event-1');
    });
  });

  it('should render event link when url is provided', () => {
    render(<EventCard event={mockEvent} />);

    const link = screen.getByRole('link', { name: /view event/i });
    expect(link).toHaveAttribute('href', 'https://example.com/event');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('should render event image when imageUrl is provided', () => {
    render(<EventCard event={mockEvent} />);

    const image = screen.getByAltText('Summer Music Festival');
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });
});
