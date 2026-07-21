import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useBookingStore } from '../store/bookingStore';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, Heart, PlusCircle, Trash2 } from 'lucide-react';

export default function Dashboard() {
  const { user, fetchProfile, addWalletFunds, isAuthenticated } = useAuthStore();
  const { bookings, wishlist, fetchMyBookings, fetchWishlist, cancelBooking, removeFromWishlist } = useBookingStore();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'wishlist'>('bookings');
  const [addAmount, setAddAmount] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchProfile();
    fetchMyBookings();
    fetchWishlist();
  }, [isAuthenticated, fetchProfile, fetchMyBookings, fetchWishlist, navigate]);

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(addAmount);
    if (isNaN(val) || val <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    await addWalletFunds(val);
    setAddAmount('');
    alert(`Successfully added ₹${val} to your VayuWallet!`);
  };

  const handleCancel = async (id: number) => {
    if (window.confirm('Are you sure you want to cancel this booking? A 100% refund will be credited back to your VayuWallet immediately.')) {
      const ok = await cancelBooking(id);
      if (ok) {
        alert('Booking cancelled successfully and funds refunded!');
        fetchProfile(); // reload wallet balance
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Profile Header Card */}
      {user && (
        <div className="bg-gradient-to-r from-brand-primary to-indigo-700 text-white rounded-3xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
          <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
            <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-full flex items-center justify-center font-black text-2xl">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-black">{user.name}</h2>
              <p className="text-xs text-slate-200 font-semibold">{user.email} • Role: {user.role.replace('ROLE_', '')}</p>
            </div>
          </div>
          <div className="bg-white/10 border border-white/25 py-4 px-6 rounded-2xl text-center min-w-[200px]">
            <span className="text-xs text-slate-100 font-bold uppercase tracking-wider">VayuWallet Balance</span>
            <span className="text-3xl font-black block mt-1 text-white">₹{user.walletBalance.toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700/50 pb-4 mb-8">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 font-bold py-2.5 px-5 rounded-full text-sm transition-all ${
            activeTab === 'bookings'
              ? 'bg-brand-primary text-white shadow-lg'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Briefcase size={16} /> My Bookings
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`flex items-center gap-2 font-bold py-2.5 px-5 rounded-full text-sm transition-all ${
            activeTab === 'wishlist'
              ? 'bg-brand-primary text-white shadow-lg'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Heart size={16} /> Saved Wishlist
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 font-bold py-2.5 px-5 rounded-full text-sm transition-all ${
            activeTab === 'profile'
              ? 'bg-brand-primary text-white shadow-lg'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <User size={16} /> Manage Wallet
        </button>
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">
        
        {/* Bookings */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 border rounded-3xl p-6 text-slate-500 font-bold">
                You have not booked any trips yet.
              </div>
            ) : (
              bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="glass rounded-3xl p-6 border border-white/20 shadow-lg flex flex-col sm:flex-row justify-between items-center gap-6"
                >
                  <div>
                    <span className={`text-[10px] font-black uppercase tracking-wider py-1 px-2.5 rounded-full inline-block mb-3 ${
                      booking.status === 'CONFIRMED'
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 text-brand-secondary border border-brand-secondary/20'
                        : 'bg-red-50 dark:bg-red-950/20 text-red-500 border border-red-500/20'
                    }`}>
                      {booking.status}
                    </span>
                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">{booking.bookingType} Selection</h4>
                    <p className="text-xs text-slate-500 font-semibold mt-1 leading-normal">{booking.details}</p>
                    <span className="text-[10px] text-slate-400 font-bold block mt-2">Booked on: {new Date(booking.bookingDate).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-2xl font-black text-brand-accent">₹{booking.totalPrice.toLocaleString()}</span>
                      <p className="text-[10px] text-slate-400 font-bold">Paid via Wallet</p>
                    </div>
                    {booking.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold text-xs py-2 px-4 rounded-xl shadow transition-colors"
                      >
                        Cancel & Refund
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Wishlist */}
        {activeTab === 'wishlist' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white dark:bg-slate-900 border rounded-3xl p-6 text-slate-500 font-bold">
                Your wishlist is empty.
              </div>
            ) : (
              wishlist.map((item) => (
                <div
                  key={item.id}
                  className="glass rounded-3xl p-6 border border-white/20 shadow-lg flex flex-col justify-between h-[200px]"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black uppercase tracking-wider text-brand-primary">{item.itemType}</span>
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="text-red-500 p-1 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-2 truncate">{item.itemName}</h4>
                    <p className="text-xs text-slate-500 font-semibold mt-1 truncate">{item.details}</p>
                  </div>
                  <div className="flex justify-between items-center border-t pt-4">
                    <span className="text-xl font-black text-brand-accent">₹{item.price.toLocaleString()}</span>
                    <button
                      onClick={() => navigate(`/booking-flow?type=${item.itemType.toLowerCase()}&id=${item.itemId}`)}
                      className="bg-brand-primary text-white font-bold text-[10px] py-1.5 px-4 rounded-lg shadow hover:bg-blue-700"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Profile / Wallet Top-up */}
        {activeTab === 'profile' && (
          <div className="max-w-md glass rounded-3xl p-6 border border-white/20 shadow-lg">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
              <PlusCircle className="text-brand-secondary" /> Add Wallet Funds
            </h3>
            <form onSubmit={handleAddFunds} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1.5">Enter Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full bg-slate-100 dark:bg-slate-800 text-sm font-semibold rounded-2xl py-3 px-4 border outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-brand-primary hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-2xl text-xs shadow-md transition-all duration-300"
              >
                Add Funds
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
