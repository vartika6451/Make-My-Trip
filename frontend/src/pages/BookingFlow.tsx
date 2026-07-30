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
  const renderSeatButton = (seatNo: string, row: number, col: string) => {
    const isBooked = bookedSeats.includes(seatNo);
    const isSelected = selectedSeat === seatNo;
    const isRecommended = isRecommendedSeat(seatNo);
    const isPulsing = pulseSeat === seatNo;
    
    // Determine class styling
    let seatColorClass = '';
    if (isBooked) {
      seatColorClass = 'bg-slate-200 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700 cursor-not-allowed opacity-50';
    } else if (isSelected) {
      seatColorClass = 'bg-blue-600 text-white border-blue-700 shadow-md shadow-blue-500/50 scale-105 ring-2 ring-blue-400 ring-offset-1 dark:ring-offset-slate-900';
    } else {
      if (row === 1) { // First Class
        seatColorClass = 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/80 hover:bg-purple-100 dark:hover:bg-purple-950/40 hover:border-purple-400';
      } else if (row === 2) { // Business Class
        seatColorClass = 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/80 hover:bg-indigo-100 dark:hover:bg-indigo-950/40 hover:border-indigo-400';
      } else if (row === 3) { // Premium Economy
        seatColorClass = 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/80 hover:bg-sky-100 dark:hover:bg-sky-950/40 hover:border-sky-400';
      } else { // Economy
        seatColorClass = 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-200/50';
      }
    }

    return (
      <button
        key={seatNo}
        type="button"
        disabled={isBooked}
        onClick={() => {
          setSelectedSeat(seatNo);
          setSeatUpgradeCost(getSeatUpgradeCost(row));
        }}
        className={`relative aspect-square rounded-t-xl rounded-b-md border font-black text-[10px] transition-all duration-300 flex flex-col items-center justify-center cursor-pointer ${seatColorClass} ${
          isPulsing ? 'animate-pulse scale-105 border-amber-500 ring-2 ring-amber-400 shadow-lg' : ''
        } ${isRecommended && !isBooked && !isSelected ? 'ring-1 ring-emerald-500/80 border-emerald-400' : ''}`}
      >
        <span className="text-[10px]">{seatNo}</span>
        
        {isRecommended && !isBooked && !isSelected && (
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        )}
      </button>
    );
  };

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
            <div className="glass rounded-3xl p-6 border border-white/20 shadow-lg space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 dark:border-slate-700/60 pb-4">
                <div>
                  <h3 className="text-lg font-black flex items-center gap-2">
                    <Plane className="text-brand-primary" /> Select Your Seat
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Choose your preferred seat from the cabin layout.</p>
                </div>
                
                <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 py-1 px-3 rounded-full text-[10px] font-bold border border-emerald-500/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-50"></span>
                  </span>
                  Real-time Sync Active
                </div>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-purple-50 dark:bg-purple-900/30 border border-purple-300"></div>
                  <span>First (+₹5,999)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-300"></div>
                  <span>Business (+₹2,999)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-sky-50 dark:bg-sky-900/30 border border-sky-300"></div>
                  <span>Premium Eco (+₹499)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded bg-slate-100 dark:bg-slate-700 border border-slate-300"></div>
                  <span>Economy (+₹0)</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2 sm:col-span-1">
                  <div className="w-3.5 h-3.5 rounded bg-emerald-50 border border-emerald-400"></div>
                  <span>Recommended</span>
                </div>
              </div>

              {/* Fuselage Container */}
              <div className="bg-slate-50 dark:bg-slate-900/80 rounded-t-[140px] rounded-b-[40px] border-x border-t-4 border-slate-300 dark:border-slate-700 max-w-[340px] mx-auto p-6 pt-16 relative shadow-inner">
                {/* Cockpit Indicator */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-30">
                  <Plane className="rotate-180 text-slate-400" size={24} />
                  <span className="text-[8px] tracking-widest font-black text-slate-400 uppercase mt-1">Cockpit</span>
                </div>

                {/* Seat Map Grid */}
                <div className="grid grid-cols-7 gap-2 max-w-[280px] mx-auto">
                  {/* Column Headers */}
                  {['A', 'B', 'C', '', 'D', 'E', 'F'].map((col, idx) => (
                    <div key={idx} className="text-slate-400 font-bold text-center text-[10px] pb-2">
                      {col}
                    </div>
                  ))}

                  {/* Rows */}
                  {[1, 2, 3, 4, 5, 6].map((row) => (
                    <React.Fragment key={row}>
                      {/* Left seats */}
                      {['A', 'B', 'C'].map((col) => {
                        const seatNo = `${row}${col}`;
                        return renderSeatButton(seatNo, row, col);
                      })}

                      {/* Middle row index (Aisle) */}
                      <div className="flex items-center justify-center text-[10px] text-slate-400 font-bold dark:text-slate-600">
                        {row}
                      </div>

                      {/* Right seats */}
                      {['D', 'E', 'F'].map((col) => {
                        const seatNo = `${row}${col}`;
                        return renderSeatButton(seatNo, row, col);
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Selected Seat Details Panel */}
              <div className="mt-6">
                {selectedSeat ? (
                  <div className="bg-blue-50/50 dark:bg-slate-800/40 rounded-3xl p-5 border border-blue-500/20 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="bg-blue-600 text-white font-black text-sm px-2.5 py-1 rounded-xl">
                            Seat {selectedSeat}
                          </span>
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            ({getSeatClassName(parseInt(selectedSeat[0]))})
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium mt-1">Pre-flight details and features.</p>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-sm font-black text-brand-accent block">
                          {seatUpgradeCost > 0 ? `+ ₹${seatUpgradeCost.toLocaleString()}` : 'No Upgrade Fee'}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold">UPSELL OPTION</span>
                      </div>
                    </div>

                    {/* Amenities Checklist */}
                    <div className="space-y-1.5 border-t border-slate-200 dark:border-slate-700/60 pt-3">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Included Perks:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {getSeatAmenities(parseInt(selectedSeat[0])).map((amenity, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold">
                            <Check size={12} className="text-emerald-500" />
                            <span>{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Save Default Preference Option */}
                    <div className="border-t border-slate-200 dark:border-slate-700/60 pt-3">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={savePreferences}
                          onChange={(e) => setSavePreferences(e.target.checked)}
                          className="rounded text-brand-primary focus:ring-brand-primary h-4 w-4 bg-slate-100 dark:bg-slate-700 border-slate-300"
                        />
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                          Save as my default seat preference for future bookings
                        </span>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-3xl p-5 border border-amber-500/20 flex gap-3 items-start">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black">No Seat Selected</h4>
                      <p className="text-[11px] font-semibold leading-relaxed mt-0.5 opacity-90">
                        Please pick a seat from the airplane seating map to proceed. Business and First class seats offer recliners, gourmet dining, and priority perks.
                      </p>
                    </div>
                  </div>
                )}
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
              {type === 'flight' && seatUpgradeCost > 0 && (
                <div className="flex justify-between text-brand-primary font-bold">
                  <span>Seat Upgrade ({selectedSeat}):</span>
                  <span>+ ₹{seatUpgradeCost.toLocaleString()}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between text-brand-secondary font-bold">
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
