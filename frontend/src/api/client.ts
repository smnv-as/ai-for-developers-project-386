import axios, { type AxiosError } from 'axios'
import type {
  EventType,
  Booking,
  Slot,
  CreateBookingRequest,
  CreateEventTypeRequest,
  UpdateEventTypeRequest,
  NotFoundError,
  SlotAlreadyBookedError,
  ValidationError,
  EventTypeHasBookingsError,
  ListAdminBookingsParams,
  ListSlotsParams,
} from './types'

const client = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export class ApiError extends Error {
  code: string
  constructor(code: string, message: string) {
    super(message)
    this.code = code
    this.name = 'ApiError'
  }
}

client.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const data = error.response?.data as
      | NotFoundError
      | SlotAlreadyBookedError
      | ValidationError
      | EventTypeHasBookingsError
      | { code?: string; message?: string }
    if (data && typeof data === 'object' && 'code' in data && 'message' in data) {
      return Promise.reject(new ApiError(data.code, data.message))
    }
    return Promise.reject(error)
  },
)

export const eventTypesApi = {
  list: async (): Promise<EventType[]> => {
    const { data } = await client.get<EventType[]>('/event-types')
    return data
  },
}

export const slotsApi = {
  list: async (params: ListSlotsParams): Promise<Slot[]> => {
    const { data } = await client.get<Slot[]>('/slots', { params })
    return data
  },
}

export const bookingsApi = {
  create: async (
    request: CreateBookingRequest,
  ): Promise<Booking> => {
    const { data } = await client.post<Booking>('/bookings', request)
    return data
  },
  cancel: async (id: string): Promise<void> => {
    await client.delete(`/bookings/${id}`)
  },
}

export const adminEventTypesApi = {
  list: async (): Promise<EventType[]> => {
    const { data } = await client.get<EventType[]>('/admin/event-types')
    return data
  },
  create: async (request: CreateEventTypeRequest): Promise<EventType> => {
    const { data } = await client.post<EventType>('/admin/event-types', request)
    return data
  },
  update: async (
    id: string,
    request: UpdateEventTypeRequest,
  ): Promise<EventType> => {
    const { data } = await client.put<EventType>(
      `/admin/event-types/${id}`,
      request,
    )
    return data
  },
  delete: async (id: string): Promise<void> => {
    await client.delete(`/admin/event-types/${id}`)
  },
}

export const adminBookingsApi = {
  list: async (params?: ListAdminBookingsParams): Promise<Booking[]> => {
    const { data } = await client.get<Booking[]>('/admin/bookings', { params })
    return data
  },
}

export { client }
