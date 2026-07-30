import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';
import { User, Plane, Hotel as HotelIcon, Sparkles, Check, Zap, Wifi, Tv, Coffee, ShieldAlert, AlertCircle } from 'lucide-react';

export default function BookingFlow() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  const id = searchParams.get('id');

  const { isAuthenticated, user, updatePreferences } = useAuthStore();
  const navigate = useNavigate();

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Guest/Passenger Inputs
  const [passengerName, setPassengerName] = useState('');
  const [passengerAge, setPassengerAge] = useState('');
  const [checkInDate, setCheckInDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  
  // Seat selection states for flight
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [seatUpgradeCost, setSeatUpgradeCost] = useState(0);
  const [savePreferences, setSavePreferences] = useState(false);
  const [bookedSeats, setBookedSeats] = useState<string[]>(['2B', '2C', '4E', '5A']);
  const [pulseSeat, setPulseSeat] = useState<string | null>(null);

  // Coupon promo states
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // H2 Console verification
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchItem = async () => {
      try {
        const res = await api.get(`/api/${type === 'flight' ? 'flights' : 'hotels'}/${id}`);
        setItem(res.data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };

    fetchItem();
  }, [type, id, isAuthenticated, navigate]);

  // Real-time seat occupancy simulation
  useEffect(() => {
    if (type !== 'flight') return;
    const interval = setInterval(() => {
      const allPossibleSeats: string[] = [];
      for (let r = 1; r <= 6; r++) {
        for (const c of ['A', 'B', 'C', 'D', 'E', 'F']) {
          const s = `${r}${c}`;
          if (s !== selectedSeat) {
            allPossibleSeats.push(s);
          }
        }
      }
      
      const randomSeat = allPossibleSeats[Math.floor(Math.random() * allPossibleSeats.length)];
      setBookedSeats((prev) => {
        const isBooked = prev.includes(randomSeat);
        if (isBooked) {
          return prev.filter((s) => s !== randomSeat);
        } else {
          return [...prev, randomSeat];
        }
      });
      
      setPulseSeat(randomSeat);
      setTimeout(() => setPulseSeat(null), 2500);
    }, 6000);

    return () => clearInterval(interval);
  }, [type, selectedSeat]);

  const getSeatClassName = (row: number) => {
    if (row === 1) return 'First Class';
    if (row === 2) return 'Business Class';
    if (row === 3) return 'Premium Economy';
    return 'Economy Class';
  };

  const getSeatUpgradeCost = (row: number) => {
    if (row === 1) return 5999;
    if (row === 2) return 2999;
    if (row === 3) return 499;
    return 0;
  };

  const getSeatAmenities = (row: number) => {
    if (row === 1) return ['Private Cabin Suite', 'Luxury Lie-Flat Bed', 'Personal Minibar', 'Gourmet Dine-on-Demand', 'Priority VIP Lounge Access'];
    if (row === 2) return ['Premium Recliner Flat-bed', 'Noise-Canceling Headsets', 'Premium Gourmet Meals', 'Priority Check-in & Boarding'];
    if (row === 3) return ['4" Extra Legroom Space', 'Personal USB Port', 'Complimentary Hot Beverages & Snacks'];
    return ['Standard Ergonomic Recliner', 'Complimentary Water Bottle', 'In-seat Power Outlet (shared)'];
  };

  const isRecommendedSeat = (seatNo: string) => {
    if (!user) return false;
    const row = parseInt(seatNo[0]);
    const col = seatNo[1];
    
    const seatClass = row === 1 ? 'FIRST' : row === 2 ? 'BUSINESS' : row === 3 ? 'PREMIUM_ECONOMY' : 'ECONOMY';
    const seatPosition = (col === 'A' || col === 'F') ? 'WINDOW' : (col === 'C' || col === 'D') ? 'AISLE' : 'MIDDLE';

    const matchesClass = user.preferredSeatClass === seatClass;
    const matchesPosition = user.preferredSeatPosition === seatPosition;
    
    return matchesClass || matchesPosition;
  };

  // Pre-select seat based on user preferences
  useEffect(() => {
    if (type === 'flight' && user && !selectedSeat && !loading && item) {
      for (let r = 1; r <= 6; r++) {
        for (const c of ['A', 'B', 'C', 'D', 'E', 'F']) {
          const seatNo = `${r}${c}`;
          const isBooked = bookedSeats.includes(seatNo);
          if (!isBooked && isRecommendedSeat(seatNo)) {
            // First check if it matches class and position
            const row = r;
            const col = c;
            const seatClass = row === 1 ? 'FIRST' : row === 2 ? 'BUSINESS' : row === 3 ? 'PREMIUM_ECONOMY' : 'ECONOMY';
            const seatPosition = (col === 'A' || col === 'F') ? 'WINDOW' : (col === 'C' || col === 'D') ? 'AISLE' : 'MIDDLE';
            const matchesClass = user.preferredSeatClass === seatClass;
            const matchesPosition = user.preferredSeatPosition === seatPosition;
            if (matchesClass && matchesPosition) {
              setSelectedSeat(seatNo);
              setSeatUpgradeCost(getSeatUpgradeCost(r));
              return;
            }
          }
        }
      }
      
      // Fallback to just position matches
      for (let r = 1; r <= 6; r++) {
        for (const c of ['A', 'B', 'C', 'D', 'E', 'F']) {
          const seatNo = `${r}${c}`;
          const isBooked = bookedSeats.includes(seatNo);
          if (!isBooked && isRecommendedSeat(seatNo)) {
            setSelectedSeat(seatNo);
            setSeatUpgradeCost(getSeatUpgradeCost(r));
            return;
          }
        }
      }
    }
  }, [user, type, loading, item]);

  const handleApplyCoupon = async () => {
    setCouponError('');
    setCouponSuccess('');
    setDiscountAmount(0);
    try {
      const res = await api.get(`/api/coupons/validate/${couponCode}`);
      const coupon = res.data;
      const basePrice = type === 'flight' ? item.price : item.pricePerNight;
      const discount = (basePrice * coupon.discountPercentage) / 100;
      const finalDiscount = Math.min(discount, coupon.maxDiscount);
      setDiscountAmount(finalDiscount);
      setCouponSuccess(`Coupon ${coupon.code} applied successfully! Discount: ₹${finalDiscount.toFixed(2)}`);
    } catch (err) {
      setCouponError('Invalid or expired coupon code');
    }
  };

  const handleProceed = async () => {
    if (!passengerName.trim()) {
      alert('Please fill out the passenger/guest name');
      return;
    }
    if (type === 'flight' && !selectedSeat) {
      alert('Please select a seat from the flight map');
      return;
    }

    const basePrice = type === 'flight' ? item.price : item.pricePerNight;
    const finalPrice = Math.max(basePrice + (type === 'flight' ? seatUpgradeCost : 0) - discountAmount, 0);

    // Save preferences if toggle checked
    if (type === 'flight' && selectedSeat && savePreferences) {
      const row = parseInt(selectedSeat[0]);
      const col = selectedSeat[1];
      const seatClass = row === 1 ? 'FIRST' : row === 2 ? 'BUSINESS' : row === 3 ? 'PREMIUM_ECONOMY' : 'ECONOMY';
      const seatPosition = (col === 'A' || col === 'F') ? 'WINDOW' : (col === 'C' || col === 'D') ? 'AISLE' : 'MIDDLE';
      
      try {
        await updatePreferences({
          preferredSeatClass: seatClass,
          preferredSeatPosition: seatPosition
        });
      } catch (err) {
        console.error('Failed to save travel preferences', err);
      }
    }

    const seatDetails = type === 'flight' && selectedSeat 
      ? `, Seat: ${selectedSeat} (${getSeatClassName(parseInt(selectedSeat[0]))})`
      : '';
    const details = type === 'flight' 
      ? `Passenger: ${passengerName} (Age: ${passengerAge})${seatDetails}`
      : `Guest: ${passengerName} (Age: ${passengerAge})`;

    const reservationDate = type === 'flight' ? item.departureTime : `${checkInDate}T12:00:00`;

    navigate('/payment', {
      state: {
        type: type === 'flight' ? 'FLIGHT' : 'HOTEL',
        itemId: item.id,
        itemName: type === 'flight' ? `${item.airline} ${item.flightNumber}` : item.name,
        details,
        totalPrice: finalPrice,
        reservationDate,
      }
    });
  };

  if (loading) {
    return <div className="max-w-md mx-auto py-20 text-center font-bold">Loading selection details...</div>;
  }

  if (!item) {
    return <div className="max-w-md mx-auto py-20 text-center font-bold text-red-500">Item not found.</div>;
  }

  const basePrice = type === 'flight' ? item.price : item.pricePerNight;
  const finalPrice = Math.max(basePrice + (type === 'flight' ? seatUpgradeCost : 0) - discountAmount, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-8">Review and Book</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Info & Inputs */}
        <div className="md:col-span-2 space-y-6">
          {/* Card Details */}
          <div className="glass rounded-3xl p-6 border border-white/20 shadow-lg">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              {type === 'flight' ? <Plane className="text-brand-primary" /> : <HotelIcon className="text-brand-primary" />}
              Booking Summary
            </h3>
            <div className="space-y-2 text-sm font-semibold">
              <p className="text-slate-800 dark:text-slate-100 text-lg">{type === 'flight' ? `${item.airline} • ${item.flightNumber}` : item.name}</p>
              <p className="text-xs text-slate-500">{type === 'flight' ? `${item.origin} → ${item.destination}` : item.location}</p>
              {type === 'flight' && (
                <p className="text-xs text-slate-500">Departure: {item.departureTime.replace('T', ' ').substring(0, 16)}</p>
              )}
            </div>
          </div>

          {/* Passenger Input Fields */}
          <div className="glass rounded-3xl p-6 border border-white/20 shadow-lg space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2 mb-2">
              <User className="text-brand-secondary" /> Traveller Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  placeholder="Enter passenger name"
                  className="w-full bg-slate-100 dark:bg-slate-800 text-sm font-semibold rounded-2xl py-3 px-4 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1.5">Age</label>
                <input
                  type="number"
                  required
                  value={passengerAge}
                  onChange={(e) => setPassengerAge(e.target.value)}
                  placeholder="Enter age"
                  className="w-full bg-slate-100 dark:bg-slate-800 text-sm font-semibold rounded-2xl py-3 px-4 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
              {type === 'hotel' && (
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-500 block mb-1.5">Check-in Date</label>
                  <input
                    type="date"
                    required
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-slate-100 dark:bg-slate-800 text-sm font-semibold rounded-2xl py-3 px-4 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-brand-primary"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Interactive Seat Map for Flights */}
          {type === 'flight' && (
            <div className="glass rounded-3xl p-6 border border-white/20 shadow-lg">
              <h3 className="text-base font-bold flex items-center gap-2 mb-4">
                Select Your Seat
              </h3>
              <div className="grid grid-cols-6 gap-3 max-w-[320px] mx-auto text-center font-bold text-xs">
                {['A', 'B', 'C', 'D', 'E', 'F'].map((col) => (
                  <div key={col} className="text-slate-400">{col}</div>
                ))}
                {[1, 2, 3, 4, 5].map((row) => (
                  <React.Fragment key={row}>
                    {['A', 'B', 'C', 'D', 'E', 'F'].map((col) => {
                      const seatNo = `${row}${col}`;
                      const isBooked = row === 2 && (col === 'B' || col === 'C');
                      return (
                        <button
                          key={seatNo}
                          type="button"
                          disabled={isBooked}
                          onClick={() => setSelectedSeat(seatNo)}
                          className={`p-2.5 rounded-lg border text-[10px] font-black transition-all ${
                            isBooked 
                              ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed border-none' 
                              : selectedSeat === seatNo
                                ? 'bg-brand-primary text-white border-brand-primary shadow shadow-blue-500/25'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:border-brand-primary'
                          }`}
                        >
                          {seatNo}
                        </button>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Pricing & Coupons */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass rounded-3xl p-6 border border-white/20 shadow-lg space-y-6">
            <h3 className="text-base font-bold border-b border-slate-200 dark:border-slate-700 pb-3">Price Breakup</h3>
            
            <div className="space-y-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              {item.pricingDetails ? (
                <>
                  <div className="flex justify-between">
                    <span>Base Ticket Fare:</span>
                    <span className="text-slate-800 dark:text-slate-200">₹{item.pricingDetails.originalPrice.toLocaleString()}</span>
                  </div>
                  {item.pricingDetails.demandSurcharge > 0 && (
                    <div className="flex justify-between text-amber-600 dark:text-amber-400">
                      <span>Demand Surcharge:</span>
                      <span>+ ₹{item.pricingDetails.demandSurcharge.toLocaleString()}</span>
                    </div>
                  )}
                  {item.pricingDetails.seasonalitySurcharge > 0 && (
                    <div className="flex justify-between text-amber-600 dark:text-amber-400">
                      <span>Seasonality Surcharge:</span>
                      <span>+ ₹{item.pricingDetails.seasonalitySurcharge.toLocaleString()}</span>
                    </div>
                  )}
                  {item.pricingDetails.weekendSurcharge > 0 && (
                    <div className="flex justify-between text-amber-600 dark:text-amber-400">
                      <span>Weekend Surcharge:</span>
                      <span>+ ₹{item.pricingDetails.weekendSurcharge.toLocaleString()}</span>
                    </div>
                  )}
                  {item.pricingDetails.lastMinuteSurcharge > 0 && (
                    <div className="flex justify-between text-amber-600 dark:text-amber-400">
                      <span>Last-Minute Surcharge:</span>
                      <span>+ ₹{item.pricingDetails.lastMinuteSurcharge.toLocaleString()}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex justify-between">
                  <span>Base Price:</span>
                  <span>₹{basePrice.toLocaleString()}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between text-brand-secondary">
                  <span>Promo Discount:</span>
                  <span>- ₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 flex justify-between items-baseline font-black text-slate-800 dark:text-slate-100">
              <span>Total Price:</span>
              <span className="text-2xl text-brand-accent">₹{finalPrice.toLocaleString()}</span>
            </div>

            {/* Coupon Entry */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
              <label className="text-[10px] font-bold text-slate-500 block uppercase">Have a Promo Code?</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="TRIP20, FLYHIGH"
                  className="flex-1 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-xl py-2 px-3 border outline-none uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="bg-slate-200 dark:bg-slate-700 hover:bg-brand-primary hover:text-white text-xs font-bold py-2 px-4 rounded-xl transition-all"
                >
                  Apply
                </button>
              </div>
              {couponError && <p className="text-[10px] text-red-500 font-bold">{couponError}</p>}
              {couponSuccess && <p className="text-[10px] text-brand-secondary font-bold leading-normal">{couponSuccess}</p>}
            </div>

            <button
              onClick={handleProceed}
              className="w-full bg-brand-primary hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-102 mt-4"
            >
              Proceed to Payment
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
