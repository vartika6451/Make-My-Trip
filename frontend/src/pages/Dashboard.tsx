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

  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState('Change of plans');
  const [otherReason, setOtherReason] = useState('');

  const handleCancelClick = (booking: any) => {
    setSelectedBookingForCancel(booking);
    setCancelReason('Change of plans');
    setOtherReason('');
  };

  const confirmCancellation = async () => {
    if (!selectedBookingForCancel) return;

    const reasonToSend = cancelReason === 'Other'
      ? `Other: ${otherReason.trim() || 'Not specified'}`
      : cancelReason;

    const ok = await cancelBooking(selectedBookingForCancel.id, reasonToSend);
    if (ok) {
      setSelectedBookingForCancel(null);
      fetchProfile(); // reload wallet balance
    }
  };

  const getRefundEstimation = (booking: any) => {
    if (!booking.reservationDate) return { percentage: 100, amount: booking.totalPrice, details: '100% Refund (No reservation date specified)' };

    const resTime = new Date(booking.reservationDate).getTime();
    const nowTime = Date.now();

    if (nowTime > resTime) {
      return {
        percentage: 0,
        amount: 0,
        details: '0% Refund (Reservation starts/started in the past)'
      };
    }

    const hoursRemaining = (resTime - nowTime) / (1000 * 60 * 60);
    if (hoursRemaining < 24) {
      return {
        percentage: 50,
        amount: booking.totalPrice * 0.5,
        details: '50% Partial Refund (Cancelled within 24 hours of reservation)'
      };
    }

    return {
      percentage: 100,
      amount: booking.totalPrice,
      details: '100% Full Refund (Cancelled more than 24 hours before reservation)'
    };
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
                    {booking.reservationDate && (
                      <span className="text-[10px] text-brand-primary font-bold block mt-1">
                        Reservation Starts: {new Date(booking.reservationDate).toLocaleString()}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-bold block mt-2">Booked on: {new Date(booking.bookingDate).toLocaleString()}</span>
                    
                    {booking.status === 'CANCELLED' && (
                      <div className="mt-4 p-3 bg-red-50/50 dark:bg-red-950/10 rounded-2xl border border-red-100/50 dark:border-red-950/30 text-[11px] font-semibold space-y-1 text-red-700 dark:text-red-400 max-w-[400px]">
                        <div>Cancellation Reason: <span className="text-slate-700 dark:text-slate-300 font-bold">{booking.cancellationReason || 'Not specified'}</span></div>
                        <div>Refund Credited: <span className="text-slate-700 dark:text-slate-300 font-bold">₹{booking.refundAmount?.toLocaleString() || 0}</span></div>
                        {booking.cancelledAt && (
                          <div>Cancelled On: <span className="text-slate-700 dark:text-slate-300 font-bold">{new Date(booking.cancelledAt).toLocaleString()}</span></div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-2xl font-black text-brand-accent">₹{booking.totalPrice.toLocaleString()}</span>
                      <p className="text-[10px] text-slate-400 font-bold">Paid via Wallet</p>
                    </div>
                    {booking.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleCancelClick(booking)}
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

      {/* Cancellation Modal */}
      {selectedBookingForCancel && (() => {
        const est = getRefundEstimation(selectedBookingForCancel);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6">
              <div>
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">Cancel & Refund Request</h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  Please review the refund estimate and select your reason for cancellation.
                </p>
              </div>

              {/* Booking Info Summary */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs font-semibold space-y-1 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="text-slate-800 dark:text-slate-100 font-bold">{selectedBookingForCancel.bookingType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Details:</span>
                  <span className="text-slate-800 dark:text-slate-100 font-bold truncate max-w-[200px]">{selectedBookingForCancel.details}</span>
                </div>
                {selectedBookingForCancel.reservationDate && (
                  <div className="flex justify-between">
                    <span>Reservation Starts:</span>
                    <span className="text-brand-primary font-bold">{new Date(selectedBookingForCancel.reservationDate).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Predefined Policy Details */}
              <div className="bg-amber-50/60 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/30 p-3.5 rounded-2xl text-[11px] font-semibold text-amber-700 dark:text-amber-400 space-y-1">
                <p className="font-bold text-amber-800 dark:text-amber-300">Refund Policy Rules:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>More than 24 hours before reservation: 100% Refund.</li>
                  <li>Within 24 hours of reservation: 50% Refund.</li>
                  <li>After reservation date/time: 0% Refund.</li>
                </ul>
              </div>

              {/* Form Input for Reason */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 block">Reason for Cancellation</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold rounded-xl py-3 px-3 border border-slate-200 dark:border-slate-700 outline-none"
                >
                  <option value="Change of plans">Change of plans</option>
                  <option value="Medical emergency">Medical emergency</option>
                  <option value="Flight/Hotel reschedule">Flight/Hotel reschedule</option>
                  <option value="Personal reasons">Personal reasons</option>
                  <option value="Other">Other</option>
                </select>

                {cancelReason === 'Other' && (
                  <textarea
                    required
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    placeholder="Please specify your reason here..."
                    className="w-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold rounded-xl py-3 px-3 border border-slate-200 dark:border-slate-700 outline-none mt-2 h-20 resize-none"
                  />
                )}
              </div>

              {/* Refund Calculations Preview */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2.5">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-slate-500">Original Paid Fare:</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">₹{selectedBookingForCancel.totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-slate-500">Eligibility:</span>
                  <span className="text-xs font-bold text-brand-secondary">{est.details}</span>
                </div>
                <div className="flex justify-between items-baseline border-t border-dashed pt-2.5 font-black text-slate-800 dark:text-slate-100">
                  <span>Estimated Refund:</span>
                  <span className="text-xl text-brand-accent">₹{est.amount.toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSelectedBookingForCancel(null)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 px-4 rounded-xl text-xs transition-colors"
                >
                  Keep Booking
                </button>
                <button
                  onClick={confirmCancellation}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-md shadow-red-500/10 transition-colors"
                >
                  Confirm Cancel
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
