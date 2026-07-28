import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ShieldCheck, BarChart3, PlusCircle, Trash2 } from 'lucide-react';

interface SummaryData {
  totalRevenue: number;
  totalUsers: number;
  totalBookings: number;
  totalFlights: number;
  totalHotels: number;
  recentBookings: any[];
}

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [activeTab, setActiveTab] = useState<'analytics' | 'flights' | 'hotels' | 'refunds'>('analytics');
  
  // resource lists
  const [flights, setFlights] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [cancelledBookings, setCancelledBookings] = useState<any[]>([]);

  // Add flight states
  const [flightNo, setFlightNo] = useState('');
  const [airline, setAirline] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [price, setPrice] = useState('');

  // Add hotel states
  const [hotelName, setHotelName] = useState('');
  const [hotelLoc, setHotelLoc] = useState('');
  const [hotelPrice, setHotelPrice] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ROLE_ADMIN') {
      navigate('/login');
      return;
    }

    fetchAnalytics();
    fetchFlights();
    fetchHotels();
    fetchCancelledBookings();
  }, [isAuthenticated, user, navigate]);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/api/admin/analytics');
      setSummary(res.data);
    } catch (err) {}
  };

  const fetchFlights = async () => {
    try {
      const res = await api.get('/api/flights');
      setFlights(res.data);
    } catch (err) {}
  };

  const fetchHotels = async () => {
    try {
      const res = await api.get('/api/hotels');
      setHotels(res.data);
    } catch (err) {}
  };

  const fetchCancelledBookings = async () => {
    try {
      const res = await api.get('/api/admin/bookings');
      const cancelled = res.data.filter((b: any) => b.status === 'CANCELLED');
      setCancelledBookings(cancelled);
    } catch (err) {}
  };

  const handleUpdateRefundStatus = async (bookingId: number, status: 'PROCESSED' | 'COMPLETED') => {
    try {
      await api.put(`/api/admin/bookings/${bookingId}/refund-status?status=${status}`);
      fetchCancelledBookings();
      fetchAnalytics();
      alert(`Refund status updated to ${status}!`);
    } catch (err) {
      alert('Failed to update refund status');
    }
  };

  const handleAddFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/flights', {
        flightNumber: flightNo,
        airline,
        origin,
        destination,
        price: Number(price),
        totalSeats: 180,
        availableSeats: 180,
        departureTime: new Date(Date.now() + 86400000).toISOString(),
        arrivalTime: new Date(Date.now() + 90000000).toISOString(),
      });
      setFlightNo('');
      setAirline('');
      setOrigin('');
      setDestination('');
      setPrice('');
      fetchFlights();
      fetchAnalytics();
      alert('Flight schedule created successfully!');
    } catch (err) {
      alert('Failed to create flight');
    }
  };

  const handleAddHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/hotels', {
        name: hotelName,
        location: hotelLoc,
        pricePerNight: Number(hotelPrice),
        description: 'Premium accommodation added by administration panel.',
        availableRooms: 50,
        rating: 4.5,
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600',
      });
      setHotelName('');
      setHotelLoc('');
      setHotelPrice('');
      fetchHotels();
      fetchAnalytics();
      alert('Hotel details registered successfully!');
    } catch (err) {
      alert('Failed to create hotel');
    }
  };

  const handleDeleteFlight = async (id: number) => {
    if (window.confirm('Delete this flight schedule?')) {
      await api.delete(`/api/flights/${id}`);
      fetchFlights();
      fetchAnalytics();
    }
  };

  const handleDeleteHotel = async (id: number) => {
    if (window.confirm('Delete this hotel details?')) {
      await api.delete(`/api/hotels/${id}`);
      fetchHotels();
      fetchAnalytics();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between border-b pb-6 border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="text-brand-accent animate-pulse" /> Administration Panel
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">Real-time counts, metrics summaries, and lists CRUD manager</p>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="glass rounded-3xl p-5 border shadow flex flex-col justify-between h-[120px]">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Revenue</span>
            <span className="text-2xl font-black text-brand-secondary">₹{summary.totalRevenue.toLocaleString()}</span>
          </div>
          <div className="glass rounded-3xl p-5 border shadow flex flex-col justify-between h-[120px]">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Users</span>
            <span className="text-2xl font-black">{summary.totalUsers}</span>
          </div>
          <div className="glass rounded-3xl p-5 border shadow flex flex-col justify-between h-[120px]">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bookings</span>
            <span className="text-2xl font-black text-brand-accent">{summary.totalBookings}</span>
          </div>
          <div className="glass rounded-3xl p-5 border shadow flex flex-col justify-between h-[120px]">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Flights</span>
            <span className="text-2xl font-black">{summary.totalFlights}</span>
          </div>
          <div className="glass rounded-3xl p-5 border shadow flex flex-col justify-between h-[120px]">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Hotels</span>
            <span className="text-2xl font-black">{summary.totalHotels}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700/50 pb-4 mb-6">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 font-bold py-2.5 px-5 rounded-full text-sm transition-all ${
            activeTab === 'analytics' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 size={16} /> Analytics & Orders
        </button>
        <button
          onClick={() => setActiveTab('flights')}
          className={`flex items-center gap-2 font-bold.5 py-2.5 px-5 rounded-full text-sm transition-all ${
            activeTab === 'flights' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Manage Flights
        </button>
        <button
          onClick={() => setActiveTab('hotels')}
          className={`flex items-center gap-2 font-bold py-2.5 px-5 rounded-full text-sm transition-all ${
            activeTab === 'hotels' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Manage Hotels
        </button>
        <button
          onClick={() => setActiveTab('refunds')}
          className={`flex items-center gap-2 font-bold py-2.5 px-5 rounded-full text-sm transition-all ${
            activeTab === 'refunds' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Manage Refunds
        </button>
      </div>

      {/* Tab Contents */}
      <div className="space-y-8">
        
        {/* Analytics Tab */}
        {activeTab === 'analytics' && summary && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Visual Bar Chart */}
            <div className="lg:col-span-2 glass rounded-3xl p-6 border shadow-lg space-y-6">
              <h3 className="text-base font-bold">Revenue Breakdown (Simulated Bar Graph)</h3>
              <div className="flex items-end justify-between h-[200px] pt-4 px-6 border-b border-slate-200 dark:border-slate-700">
                {[
                  { label: 'Jan', val: 12000 },
                  { label: 'Feb', val: 19000 },
                  { label: 'Mar', val: 32000 },
                  { label: 'Apr', val: 45000 },
                  { label: 'May', val: 28000 },
                  { label: 'Jun', val: 60000 },
                ].map((bar) => {
                  const pct = (bar.val / 60000) * 100;
                  return (
                    <div key={bar.label} className="flex flex-col items-center gap-2 w-1/8 group">
                      <span className="text-[9px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">₹{bar.val.toLocaleString()}</span>
                      <div
                        className="w-8 bg-brand-primary group-hover:bg-brand-accent rounded-t-lg transition-all duration-500"
                        style={{ height: `${pct * 1.5}px` }}
                      ></div>
                      <span className="text-[10px] font-bold text-slate-400 mt-1">{bar.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Orders List */}
            <div className="lg:col-span-1 glass rounded-3xl p-6 border shadow-lg space-y-4">
              <h3 className="text-base font-bold">Recent Bookings</h3>
              <div className="space-y-3">
                {summary.recentBookings.map((b) => (
                  <div key={b.id} className="p-3 border rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-brand-primary">{b.bookingType}</span>
                      <span className="text-brand-accent">₹{b.totalPrice.toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 truncate">{b.userEmail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Manage Flights Tab */}
        {activeTab === 'flights' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* List */}
            <div className="lg:col-span-2 glass rounded-3xl p-6 border shadow-lg space-y-4 max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
              <h3 className="text-base font-bold">Active Flight Schedules</h3>
              {flights.map((flight) => (
                <div key={flight.id} className="p-4 border rounded-2xl flex justify-between items-center text-xs font-semibold">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{flight.airline} • {flight.flightNumber}</h4>
                    <p className="text-slate-500 mt-1">{flight.origin} → {flight.destination}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-base font-black text-brand-accent">₹{flight.price.toLocaleString()}</span>
                    <button
                      onClick={() => handleDeleteFlight(flight.id)}
                      className="text-red-500 p-2 hover:bg-red-50 rounded-xl"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add form */}
            <div className="lg:col-span-1 glass rounded-3xl p-6 border shadow-lg">
              <h3 className="text-base font-bold flex items-center gap-1.5 mb-4">
                <PlusCircle className="text-brand-secondary" /> Add Flight Schedule
              </h3>
              <form onSubmit={handleAddFlight} className="space-y-3.5">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Airline Name</label>
                  <input
                    type="text"
                    required
                    value={airline}
                    onChange={(e) => setAirline(e.target.value)}
                    placeholder="Air India"
                    className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl py-2 px-3 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Flight Number</label>
                  <input
                    type="text"
                    required
                    value={flightNo}
                    onChange={(e) => setFlightNo(e.target.value)}
                    placeholder="AI-204"
                    className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl py-2 px-3 text-xs outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Origin</label>
                    <input
                      type="text"
                      required
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      placeholder="Delhi"
                      className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl py-2 px-3 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Destination</label>
                    <input
                      type="text"
                      required
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="Mumbai"
                      className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl py-2 px-3 text-xs outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="4500"
                    className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl py-2 px-3 text-xs outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-brand-primary text-white font-bold py-2.5 rounded-xl text-xs transition-transform"
                >
                  Create Schedule
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Manage Hotels Tab */}
        {activeTab === 'hotels' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* List */}
            <div className="lg:col-span-2 glass rounded-3xl p-6 border shadow-lg space-y-4 max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
              <h3 className="text-base font-bold">Registered Hotels</h3>
              {hotels.map((hotel) => (
                <div key={hotel.id} className="p-4 border rounded-2xl flex justify-between items-center text-xs font-semibold">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{hotel.name}</h4>
                    <p className="text-slate-500 mt-1">{hotel.location}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-base font-black text-brand-accent">₹{hotel.pricePerNight.toLocaleString()}</span>
                    <button
                      onClick={() => handleDeleteHotel(hotel.id)}
                      className="text-red-500 p-2 hover:bg-red-50 rounded-xl"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add form */}
            <div className="lg:col-span-1 glass rounded-3xl p-6 border shadow-lg">
              <h3 className="text-base font-bold flex items-center gap-1.5 mb-4">
                <PlusCircle className="text-brand-secondary" /> Add Hotel Details
              </h3>
              <form onSubmit={handleAddHotel} className="space-y-3.5">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Hotel Name</label>
                  <input
                    type="text"
                    required
                    value={hotelName}
                    onChange={(e) => setHotelName(e.target.value)}
                    placeholder="Grand Palace"
                    className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl py-2.5 px-3 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Location City</label>
                  <input
                    type="text"
                    required
                    value={hotelLoc}
                    onChange={(e) => setHotelLoc(e.target.value)}
                    placeholder="Goa"
                    className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl py-2.5 px-3 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Price Per Night (₹)</label>
                  <input
                    type="number"
                    required
                    value={hotelPrice}
                    onChange={(e) => setHotelPrice(e.target.value)}
                    placeholder="9000"
                    className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl py-2.5 px-3 text-xs outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-brand-primary text-white font-bold py-2.5 rounded-xl text-xs transition-transform"
                >
                  Register Hotel
                </button>
              </form>
            </div>
          </div>
        )}
        {activeTab === 'refunds' && (
          <div className="glass rounded-3xl p-6 border shadow-lg space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">Cancelled Bookings & Refunds</h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">Review user cancellation requests and process refund states.</p>
            </div>

            {cancelledBookings.length === 0 ? (
              <div className="text-center py-12 text-slate-500 font-bold bg-slate-50 dark:bg-slate-800/20 border rounded-2xl">
                No cancelled bookings found.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
                <table className="w-full text-left border-collapse text-xs font-semibold">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                      <th className="p-4">User</th>
                      <th className="p-4">Type & Details</th>
                      <th className="p-4">Price / Refund</th>
                      <th className="p-4">Date Cancelled</th>
                      <th className="p-4">Reason</th>
                      <th className="p-4">Refund Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {cancelledBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 text-slate-700 dark:text-slate-300">
                        <td className="p-4 font-bold">{b.userEmail}</td>
                        <td className="p-4">
                          <span className="text-[10px] font-black uppercase tracking-wider text-brand-primary block">{b.bookingType}</span>
                          <span className="text-slate-500 text-[11px] mt-0.5 block truncate max-w-[200px]">{b.details}</span>
                        </td>
                        <td className="p-4">
                          <div>Paid: ₹{b.totalPrice.toLocaleString()}</div>
                          <div className="text-brand-accent font-bold mt-0.5">Refund: ₹{b.refundAmount.toLocaleString()}</div>
                        </td>
                        <td className="p-4 text-slate-500">
                          {b.cancelledAt ? new Date(b.cancelledAt).toLocaleString() : 'N/A'}
                        </td>
                        <td className="p-4 max-w-[150px] truncate" title={b.cancellationReason}>
                          {b.cancellationReason || 'N/A'}
                        </td>
                        <td className="p-4">
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                            b.refundStatus === 'COMPLETED'
                              ? 'bg-emerald-100/70 dark:bg-emerald-950/30 text-emerald-600'
                              : b.refundStatus === 'PROCESSED'
                              ? 'bg-blue-100/70 dark:bg-blue-950/30 text-blue-600'
                              : 'bg-amber-100/70 dark:bg-amber-950/30 text-amber-600'
                          }`}>
                            {b.refundStatus || 'PENDING'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {(!b.refundStatus || b.refundStatus === 'PENDING') && (
                            <button
                              onClick={() => handleUpdateRefundStatus(b.id, 'PROCESSED')}
                              className="bg-brand-primary hover:bg-blue-600 text-white font-bold text-[10px] py-1.5 px-3 rounded-lg shadow-md transition-colors cursor-pointer"
                            >
                              Mark Processed
                            </button>
                          )}
                          {b.refundStatus === 'PROCESSED' && (
                            <button
                              onClick={() => handleUpdateRefundStatus(b.id, 'COMPLETED')}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] py-1.5 px-3 rounded-lg shadow-md transition-colors cursor-pointer"
                            >
                              Mark Completed
                            </button>
                          )}
                          {b.refundStatus === 'COMPLETED' && (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 italic">No Action</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
