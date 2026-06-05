import { test as baseTest, expect } from '@playwright/test';

export { expect };

const API_BASE = 'http://localhost:8080';

export interface EventType {
  id: string;
  name: string;
  description: string;
}

export interface Booking {
  id: string;
  eventTypeId: string;
  startTime: string;
  endTime: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  notes?: string;
}

export interface Slot {
  startTime: string;
  endTime: string;
}

async function createEventType(name: string, description: string): Promise<EventType> {
  const response = await fetch(`${API_BASE}/admin/event-types`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
  });
  if (!response.ok) {
    throw new Error(`Failed to create event type: ${response.statusText}`);
  }
  return response.json();
}

async function getEventTypes(): Promise<EventType[]> {
  const response = await fetch(`${API_BASE}/event-types`);
  if (!response.ok) {
    throw new Error(`Failed to get event types: ${response.statusText}`);
  }
  return response.json();
}

async function getSlots(eventTypeId: string, from?: string, to?: string): Promise<Slot[]> {
  const params = new URLSearchParams({ eventTypeId });
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const response = await fetch(`${API_BASE}/slots?${params}`);
  if (!response.ok) {
    throw new Error(`Failed to get slots: ${response.statusText}`);
  }
  return response.json();
}

async function createBooking(request: {
  eventTypeId: string;
  startTime: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  notes?: string;
}): Promise<Booking> {
  const response = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ code: 'unknown', message: 'Unknown error' }));
    throw new ApiError(error.code, error.message);
  }
  return response.json();
}

async function cancelBooking(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/bookings/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok && response.status !== 204) {
    throw new Error(`Failed to cancel booking: ${response.statusText}`);
  }
}

async function deleteEventType(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/admin/event-types/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok && response.status !== 204) {
    const error = await response.json().catch(() => ({ code: 'unknown', message: 'Unknown error' }));
    throw new ApiError(error.code, error.message);
  }
}

async function getAdminBookings(): Promise<Booking[]> {
  const response = await fetch(`${API_BASE}/admin/bookings`);
  if (!response.ok) {
    throw new Error(`Failed to get bookings: ${response.statusText}`);
  }
  return response.json();
}

class ApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'ApiError';
  }
}

export class TestApi {
  createEventType = createEventType;
  getEventTypes = getEventTypes;
  getSlots = getSlots;
  createBooking = createBooking;
  cancelBooking = cancelBooking;
  deleteEventType = deleteEventType;
  getAdminBookings = getAdminBookings;
  ApiError = ApiError;
}

export const test = baseTest.extend<{ api: TestApi }>({
  api: async ({}, use) => {
    await use(new TestApi());
  },
});