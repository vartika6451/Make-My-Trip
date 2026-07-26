import { create } from 'zustand';
import api from '../utils/api';

export interface DynamicPricingDetails {
  originalPrice: number;
  adjustedPrice: number;
  demandSurcharge: number;
  seasonalitySurcharge: number;
  weekendSurcharge: number;
  lastMinuteSurcharge: number;
  explanation: string[];
}

export interface PriceHistory {
  id: number;
  itemType: 'FLIGHT' | 'HOTEL';
  itemId: number;
  price: number;
  recordedAt: string;
}

export interface Flight {
  id: number;
  flightNumber: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  basePrice?: number;
  pricingDetails?: DynamicPricingDetails;
}

export interface Hotel {
  id: number;
  name: string;
  location: string;
  description: string;
  pricePerNight: number;
  availableRooms: number;
  rating: number;
  imageUrl: string;
  basePrice?: number;
  pricingDetails?: DynamicPricingDetails;
}

export interface Booking {
  id: number;
  userEmail: string;
  bookingType: string;
  itemId: number;
  bookingDate: string;
  totalPrice: number;
  status: string;
  details: string;
  cancellationReason?: string;
  cancelledAt?: string;
  refundAmount?: number;
  reservationDate?: string;
}

export interface WishlistItem {
  id: number;
  userEmail: string;
  itemType: string;
  itemId: number;
  itemName: string;
  details: string;
  price: number;
}

interface BookingState {
  flights: Flight[];
  hotels: Hotel[];
  bookings: Booking[];
  wishlist: WishlistItem[];
  origins: string[];
  destinations: string[];
  locations: string[];
  loading: boolean;
  error: string | null;

  fetchOriginsDestinations: () => Promise<void>;
  fetchLocations: () => Promise<void>;
  searchFlights: (origin: string, destination: string, date: string) => Promise<void>;
  searchHotels: (location: string) => Promise<void>;
  fetchMyBookings: () => Promise<void>;
  createBooking: (bookingData: Partial<Booking>) => Promise<Booking | null>;
  cancelBooking: (bookingId: number, reason?: string) => Promise<boolean>;
  fetchWishlist: () => Promise<void>;
  addToWishlist: (item: Omit<WishlistItem, 'id' | 'userEmail'>) => Promise<void>;
  removeFromWishlist: (id: number) => Promise<void>;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  flights: [],
  hotels: [],
  bookings: [],
  wishlist: [],
  origins: [],
  destinations: [],
  locations: [],
  loading: false,
  error: null,

  fetchOriginsDestinations: async () => {
    try {
      const [origRes, destRes] = await Promise.all([
        api.get('/api/flights/origins'),
        api.get('/api/flights/destinations'),
      ]);
      set({ origins: origRes.data, destinations: destRes.data });
    } catch (err) {}
  },

  fetchLocations: async () => {
    try {
      const res = await api.get('/api/hotels/locations');
      set({ locations: res.data });
    } catch (err) {}
  },

  searchFlights: async (origin, destination, date) => {
    set({ loading: true, error: null, flights: [] });
    try {
      const res = await api.get(`/api/flights/search?origin=${origin}&destination=${destination}&date=${date}`);
      set({ flights: res.data, loading: false });
    } catch (err: any) {
      set({ error: 'Failed to find flights', loading: false });
    }
  },

  searchHotels: async (location) => {
    set({ loading: true, error: null, hotels: [] });
    try {
      const res = await api.get(`/api/hotels/search?location=${location}`);
      set({ hotels: res.data, loading: false });
    } catch (err: any) {
      set({ error: 'Failed to find hotels', loading: false });
    }
  },

  fetchMyBookings: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/api/bookings/my');
      set({ bookings: res.data, loading: false });
    } catch (err: any) {
      set({ loading: false });
    }
  },

  createBooking: async (bookingData) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/api/bookings', bookingData);
      set({ loading: false });
      return res.data;
    } catch (err: any) {
      set({
        error: err.response?.data?.error || 'Failed to create booking',
        loading: false,
      });
      return null;
    }
  },

  cancelBooking: async (bookingId, reason) => {
    set({ loading: true, error: null });
    try {
      const url = reason
        ? `/api/bookings/${bookingId}/cancel?reason=${encodeURIComponent(reason)}`
        : `/api/bookings/${bookingId}/cancel`;
      await api.post(url);
      // refresh bookings
      await get().fetchMyBookings();
      set({ loading: false });
      return true;
    } catch (err: any) {
      set({
        error: err.response?.data?.error || 'Failed to cancel booking',
        loading: false,
      });
      return false;
    }
  },

  fetchWishlist: async () => {
    try {
      const res = await api.get('/api/wishlist');
      set({ wishlist: res.data });
    } catch (err) {}
  },

  addToWishlist: async (item) => {
    try {
      const res = await api.post('/api/wishlist', item);
      set((state) => ({ wishlist: [...state.wishlist, res.data] }));
    } catch (err) {}
  },

  removeFromWishlist: async (id) => {
    try {
      await api.delete(`/api/wishlist/${id}`);
      set((state) => ({ wishlist: state.wishlist.filter((w) => w.id !== id) }));
    } catch (err) {}
  },
}));
