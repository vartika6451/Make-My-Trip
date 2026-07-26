import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useBookingStore } from '../store/bookingStore';
import api from '../utils/api';
import { ShieldCheck, CreditCard, QrCode, Wallet, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, fetchProfile } = useAuthStore();
  const { createBooking } = useBookingStore();

  const bookingState = location.state as {
    type: string;
    itemId: number;
    itemName: string;
    details: string;
    totalPrice: number;
    reservationDate?: string;
  } | null;

  const [method, setMethod] = useState<'wallet' | 'card' | 'upi'>('wallet');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [invoiceNo, setInvoiceNo] = useState('');

  if (!bookingState) {
    return <div className="max-w-md mx-auto py-20 text-center font-bold text-red-500">No booking state found.</div>;
  }

  const handlePayment = async () => {
    if (method === 'wallet' && user && user.walletBalance < bookingState.totalPrice) {
      alert('Insufficient wallet balance. Please go to your dashboard to add funds.');
      return;
    }

    setLoading(true);
    setTimeout(async () => {
      try {
        const res = await createBooking({
          bookingType: bookingState.type,
          itemId: bookingState.itemId,
          totalPrice: bookingState.totalPrice,
          details: bookingState.details,
          reservationDate: bookingState.reservationDate,
        });

        if (res) {
          // Success
          await fetchProfile(); // refresh wallet balance
          setInvoiceNo(`INV-${Math.floor(100000 + Math.random() * 900000)}`);
          setSuccess(true);
        } else {
          alert('Booking transaction failed. Please try again.');
        }
      } catch (err) {
        alert('Payment processing error');
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto py-16 px-4">
        <div className="glass rounded-3xl p-8 border border-white/20 shadow-2xl text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle2 size={72} className="text-brand-secondary animate-bounce" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Booking Confirmed!</h2>
            <p className="text-xs text-slate-500 font-semibold mt-1">Your ticket has been generated successfully.</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border text-left text-xs font-semibold space-y-2 text-slate-600 dark:text-slate-300">
            <div className="flex justify-between border-b pb-2">
              <span>Invoice No:</span>
              <span className="text-slate-900 dark:text-slate-100">{invoiceNo}</span>
            </div>
            <div className="flex justify-between">
              <span>Service:</span>
              <span className="text-slate-900 dark:text-slate-100">{bookingState.itemName}</span>
            </div>
            <div className="flex justify-between">
              <span>Details:</span>
              <span className="text-slate-900 dark:text-slate-100 truncate max-w-[180px]">{bookingState.details}</span>
            </div>
            <div className="flex justify-between text-brand-accent text-sm pt-2 border-t font-black">
              <span>Amount Paid:</span>
              <span>₹{bookingState.totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handlePrint}
              className="bg-brand-secondary hover:bg-teal-600 text-white font-bold py-3.5 px-6 rounded-2xl text-xs shadow-md transition-all animate-pulse"
            >
              Download Ticket (Print)
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 px-6 rounded-2xl text-xs transition-all"
            >
              Go to My Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-slate-500 font-bold text-xs hover:underline mb-6">
        <ArrowLeft size={14} /> Back
      </button>

      <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-8">Secure Checkout</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Payment Methods */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass rounded-3xl p-6 border border-white/20 shadow-lg">
            <h3 className="text-base font-bold mb-6 flex items-center gap-2">
              <ShieldCheck className="text-brand-secondary" />
              Select Payment Method
            </h3>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <button
                type="button"
                onClick={() => setMethod('wallet')}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 font-bold text-xs transition-all ${
                  method === 'wallet'
                    ? 'bg-brand-primary/10 border-brand-primary text-brand-primary'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Wallet size={20} />
                VayuWallet
              </button>
              <button
                type="button"
                onClick={() => setMethod('card')}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 font-bold text-xs transition-all ${
                  method === 'card'
                    ? 'bg-brand-primary/10 border-brand-primary text-brand-primary'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <CreditCard size={20} />
                Credit/Debit
              </button>
              <button
                type="button"
                onClick={() => setMethod('upi')}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 font-bold text-xs transition-all ${
                  method === 'upi'
                    ? 'bg-brand-primary/10 border-brand-primary text-brand-primary'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <QrCode size={20} />
                UPI Scanner
              </button>
            </div>

            {/* Wallet Details */}
            {method === 'wallet' && user && (
              <div className="space-y-4 font-semibold text-sm">
                <div className="bg-slate-50 dark:bg-slate-800/40 border p-4 rounded-2xl flex justify-between items-center border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-xs text-slate-500 block">AVAILABLE BALANCE</span>
                    <span className="text-xl font-black text-slate-800 dark:text-slate-100">₹{user.walletBalance.toLocaleString('en-IN')}</span>
                  </div>
                  {user.walletBalance < bookingState.totalPrice && (
                    <span className="text-xs font-black text-red-500 bg-red-50 dark:bg-red-950/20 py-1 px-3 rounded-full border border-red-200 dark:border-red-800">
                      Insufficient Balance
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Mock Card Form */}
            {method === 'card' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Card Number</label>
                    <input
                      type="text"
                      placeholder="4111 2222 3333 4444"
                      className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl py-2.5 px-3 text-xs outline-none focus:ring-1 focus:ring-brand-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl py-2.5 px-3 text-xs outline-none focus:ring-1 focus:ring-brand-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl py-2.5 px-3 text-xs outline-none focus:ring-1 focus:ring-brand-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">CVV</label>
                    <input
                      type="password"
                      placeholder="•••"
                      className="w-full bg-slate-50 dark:bg-slate-800 border rounded-xl py-2.5 px-3 text-xs outline-none focus:ring-1 focus:ring-brand-primary"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Mock UPI QR Code */}
            {method === 'upi' && (
              <div className="flex flex-col items-center justify-center p-4 space-y-4 text-center">
                <span className="text-xs text-slate-500 font-bold">SCAN WITH ANY BHIM UPI APP</span>
                <div className="bg-white border p-3.5 rounded-2xl shadow-md">
                  {/* Mock QR Representation */}
                  <div className="w-36 h-36 bg-slate-900 flex items-center justify-center text-white text-xs font-bold uppercase rounded-xl">
                    [ UPI QR Code ]
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Scanning pays to vayu@upi safely</p>
              </div>
            )}

          </div>
        </div>

        {/* Amount Summary */}
        <div className="lg:col-span-1">
          <div className="glass rounded-3xl p-6 border border-white/20 shadow-lg space-y-6">
            <h3 className="text-base font-bold border-b border-slate-200 dark:border-slate-700 pb-3">Review Price</h3>
            <div className="space-y-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Item:</span>
                <span className="text-slate-800 dark:text-slate-100 truncate max-w-[120px]">{bookingState.itemName}</span>
              </div>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 flex justify-between items-baseline font-black text-slate-800 dark:text-slate-100">
              <span>Total Price:</span>
              <span className="text-2xl text-brand-accent">₹{bookingState.totalPrice.toLocaleString()}</span>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-brand-primary hover:bg-blue-700 disabled:bg-slate-400 text-white font-bold py-3.5 px-4 rounded-xl text-xs shadow-lg transition-all duration-300 hover:scale-102 flex items-center justify-center gap-1.5"
            >
              {loading ? 'Processing Secure Payment...' : 'Pay Securely'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
