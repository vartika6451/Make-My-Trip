import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Hotel as HotelIcon, Bus, Train, Calendar, MapPin, ArrowRightLeft, Sparkles, Star, Gift, Shield } from 'lucide-react';
import { useBookingStore } from '../store/bookingStore';
import WeatherWidget from '../components/WeatherWidget';
import CurrencyConverter from '../components/CurrencyConverter';
import InteractiveMap from '../components/InteractiveMap';
import AiTripPlanner from '../components/AiTripPlanner';

const popularCities = ['Delhi', 'Mumbai', 'Bangalore', 'Goa', 'London', 'New York'];

const offers = [
  { id: 1, title: 'Flight Discount', code: 'FLYHIGH', desc: 'Get 15% discount up to ₹1,000 on domestic flights.', bg: 'from-blue-500 to-indigo-600' },
  { id: 2, title: 'Mega Hotel Deal', code: 'TRIP20', desc: 'Get flat 20% off up to ₹500 on premium stays.', bg: 'from-teal-500 to-emerald-600' },
  { id: 3, title: 'First Booking Offer', code: 'WELCOME', desc: '25% discount for your very first booking on Vayubook.', bg: 'from-orange-500 to-rose-600' },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<'flights' | 'hotels'>('flights');
  
  // Flight search states
  const [origin, setOrigin] = useState('Delhi');
  const [destination, setDestination] = useState('Mumbai');
  const [flightDate, setFlightDate] = useState(new Date().toISOString().split('T')[0]);

  // Hotel search states
  const [location, setLocation] = useState('Mumbai');

  const { searchFlights, searchHotels, fetchOriginsDestinations, fetchLocations, origins, destinations, locations } = useBookingStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOriginsDestinations();
    fetchLocations();
  }, [fetchOriginsDestinations, fetchLocations]);

  const handleFlightSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await searchFlights(origin, destination, flightDate);
    navigate(`/search?type=flight&origin=${origin}&destination=${destination}&date=${flightDate}`);
  };

  const handleHotelSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await searchHotels(location);
    navigate(`/search?type=hotel&location=${location}`);
  };

  const swapCities = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[420px] bg-gradient-to-br from-indigo-900 via-blue-900 to-teal-800 text-white flex flex-col justify-center px-8 md:px-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none"></div>
        <div className="max-w-2xl relative z-10 space-y-4">
          <span className="bg-brand-secondary/20 border border-brand-secondary/30 text-brand-secondary text-xs font-bold py-1.5 px-3 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 animate-pulse">
            <Sparkles size={12} /> Flight & Hotel Deals
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight text-white m-0">
            Let's Discover <br />
            Your Next <span className="text-brand-secondary">Adventure</span>
          </h1>
          <p className="text-sm md:text-base text-slate-300 font-semibold max-w-lg leading-relaxed">
            Find and compare cheapest flights, top-rated hotels, and holiday packages. Your premium travel helper awaits.
          </p>
        </div>
      </div>

      {/* Floating Search Console */}
      <div className="relative -mt-20 z-20 max-w-5xl mx-auto">
        <div className="glass rounded-3xl p-6 md:p-8 shadow-2xl border border-white/20">
          {/* Tab buttons */}
          <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700/50 pb-4 mb-6">
            <button
              onClick={() => setActiveTab('flights')}
              className={`flex items-center gap-2 font-bold py-2.5 px-5 rounded-full text-sm transition-all duration-300 ${
                activeTab === 'flights'
                  ? 'bg-brand-primary text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Plane size={16} /> Flights
            </button>
            <button
              onClick={() => setActiveTab('hotels')}
              className={`flex items-center gap-2 font-bold py-2.5 px-5 rounded-full text-sm transition-all duration-300 ${
                activeTab === 'hotels'
                  ? 'bg-brand-primary text-white shadow-lg shadow-blue-500/20'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <HotelIcon size={16} /> Hotels
            </button>
          </div>

          {/* Search Form content */}
          {activeTab === 'flights' ? (
            <form onSubmit={handleFlightSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1.5">From</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <select
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 text-sm font-semibold rounded-2xl py-3 pl-11 pr-4 border border-slate-200 dark:border-slate-700 outline-none appearance-none"
                  >
                    {popularCities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Swap button */}
              <div className="flex justify-center md:pb-2">
                <button
                  type="button"
                  onClick={swapCities}
                  className="bg-slate-200 dark:bg-slate-700 hover:bg-brand-primary hover:text-white p-3 rounded-full transition-all duration-300 hover:rotate-180 shadow-md"
                  title="Swap locations"
                >
                  <ArrowRightLeft size={16} />
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1.5">To</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 text-sm font-semibold rounded-2xl py-3 pl-11 pr-4 border border-slate-200 dark:border-slate-700 outline-none appearance-none"
                  >
                    {popularCities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1.5">Departure Date</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="date"
                    required
                    value={flightDate}
                    onChange={(e) => setFlightDate(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 text-sm font-semibold rounded-2xl py-3 pl-11 pr-4 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>
              </div>

              <div className="md:col-span-4 flex justify-end mt-2">
                <button
                  type="submit"
                  className="bg-brand-primary hover:bg-blue-700 text-white font-bold py-3.5 px-10 rounded-2xl shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-102 flex items-center gap-1.5"
                >
                  Search Flights
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleHotelSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-500 block mb-1.5">Where are you staying?</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 text-sm font-semibold rounded-2xl py-3 pl-11 pr-4 border border-slate-200 dark:border-slate-700 outline-none appearance-none"
                  >
                    {popularCities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full bg-brand-primary hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-102"
                >
                  Search Hotels
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Special Offers Section */}
      <div id="offers">
        <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-6">
          <Gift className="text-brand-accent" /> Special Discount Offers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <div key={offer.id} className={`bg-gradient-to-r ${offer.bg} text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between h-[200px] transition-transform duration-300 hover:scale-103`}>
              <div>
                <span className="bg-white/20 border border-white/30 text-[10px] font-black tracking-widest uppercase py-1 px-2.5 rounded-full inline-block mb-3">
                  PROMO CODE: {offer.code}
                </span>
                <h3 className="text-xl font-bold">{offer.title}</h3>
                <p className="text-xs text-slate-100/90 font-medium mt-1 leading-relaxed">{offer.desc}</p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(offer.code);
                  alert(`Copied code: ${offer.code}`);
                }}
                className="self-start text-xs font-bold bg-white text-slate-900 rounded-full py-1.5 px-4 shadow hover:bg-slate-100 transition-colors"
              >
                Copy Code
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Premium SVG Widgets Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <InteractiveMap />
        <AiTripPlanner />
      </div>

      {/* Weather & Currency Widgets Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <WeatherWidget />
        <CurrencyConverter />
        {/* Additional security guarantees card */}
        <div className="glass rounded-3xl p-6 shadow-lg border border-white/20 flex flex-col justify-between h-[320px]">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-brand-primary">
              <Shield className="text-brand-accent animate-pulse" size={20} />
              Booking Guarantees
            </h3>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Vayubook provides real-time ticket delivery and immediate refunds on cancellations.
            </p>
          </div>
          <div className="space-y-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-brand-secondary">✔</span>
              <span>100% Refund on eligible cancellations</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-brand-secondary">✔</span>
              <span>Secure mock transactions</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-brand-secondary">✔</span>
              <span>24/7 dedicated support desk</span>
            </div>
          </div>
          <div className="text-center font-bold text-[10px] text-slate-400">
            SECURE MOCK SSL ENCRYPTED
          </div>
        </div>
      </div>

    </div>
  );
}
