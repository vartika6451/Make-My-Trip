import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useBookingStore } from '../store/bookingStore';
import { Plane, Star, Filter, ArrowRight, Heart, TrendingUp } from 'lucide-react';
import PriceTrendsAndBreakdown from '../components/PriceTrendsAndBreakdown';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  const origin = searchParams.get('origin') || '';
  const destination = searchParams.get('destination') || '';
  const date = searchParams.get('date') || '';
  const location = searchParams.get('location') || '';

  const { flights, hotels, loading, searchFlights, searchHotels, wishlist, addToWishlist, removeFromWishlist } = useBookingStore();
  const navigate = useNavigate();

  const [sortBy, setSortBy] = useState<'price' | 'rating'>('price');
  const [priceLimit, setPriceLimit] = useState(50000);
  
  const [expandedFlightId, setExpandedFlightId] = useState<number | null>(null);
  const [expandedHotelId, setExpandedHotelId] = useState<number | null>(null);

  useEffect(() => {
    if (type === 'flight') {
      searchFlights(origin, destination, date);
    } else if (type === 'hotel') {
      searchHotels(location);
    }
  }, [type, origin, destination, date, location]);

  const handleWishlistToggle = (item: any) => {
    const isFlight = type === 'flight';
    const existing = wishlist.find(
      (w) => w.itemId === item.id && w.itemType === (isFlight ? 'FLIGHT' : 'HOTEL')
    );

    if (existing) {
      removeFromWishlist(existing.id);
    } else {
      addToWishlist({
        itemId: item.id,
        itemType: isFlight ? 'FLIGHT' : 'HOTEL',
        itemName: isFlight ? `${item.airline} ${item.flightNumber}` : item.name,
        details: isFlight ? `${item.origin} → ${item.destination}` : item.location,
        price: isFlight ? item.price : item.pricePerNight,
      });
    }
  };

  const isItemInWishlist = (itemId: number) => {
    const itemType = type === 'flight' ? 'FLIGHT' : 'HOTEL';
    return wishlist.some((w) => w.itemId === itemId && w.itemType === itemType);
  };

  const getSortedFlights = () => {
    const filtered = flights.filter((f) => f.price <= priceLimit);
    if (sortBy === 'price') {
      return [...filtered].sort((a, b) => a.price - b.price);
    }
    return filtered;
  };

  const getSortedHotels = () => {
    const filtered = hotels.filter((h) => h.pricePerNight <= priceLimit);
    if (sortBy === 'price') {
      return [...filtered].sort((a, b) => a.pricePerNight - b.pricePerNight);
    }
    if (sortBy === 'rating') {
      return [...filtered].sort((a, b) => b.rating - a.rating);
    }
    return filtered;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass rounded-3xl p-6 border border-white/20 shadow-lg space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/50 pb-3">
              <h3 className="font-bold flex items-center gap-2">
                <Filter size={18} className="text-brand-accent" /> Filters
              </h3>
              <button
                onClick={() => setPriceLimit(50000)}
                className="text-xs text-brand-primary font-bold hover:underline"
              >
                Reset
              </button>
            </div>

            {/* Price Filter */}
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-2">Max Price: ₹{priceLimit.toLocaleString()}</label>
              <input
                type="range"
                min="1000"
                max="50000"
                step="500"
                value={priceLimit}
                onChange={(e) => setPriceLimit(Number(e.target.value))}
                className="w-full accent-brand-primary cursor-pointer"
              />
            </div>

            {/* Sort Options */}
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-2">Sort By</label>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setSortBy('price')}
                  className={`text-left text-xs font-bold p-2.5 rounded-xl border transition-all ${
                    sortBy === 'price'
                      ? 'bg-brand-primary/10 border-brand-primary text-brand-primary'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  Price: Low to High
                </button>
                {type === 'hotel' && (
                  <button
                    onClick={() => setSortBy('rating')}
                    className={`text-left text-xs font-bold p-2.5 rounded-xl border transition-all ${
                      sortBy === 'rating'
                        ? 'bg-brand-primary/10 border-brand-primary text-brand-primary'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    Rating: High to Low
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Search Results Main */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
              {type === 'flight'
                ? `Flights from ${origin} to ${destination} on ${date}`
                : `Hotels in ${location}`}
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              {type === 'flight' ? `${getSortedFlights().length} found` : `${getSortedHotels().length} found`}
            </span>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Flight List */}
              {type === 'flight' &&
                getSortedFlights().map((flight) => (
                  <div
                    key={flight.id}
                    className="glass rounded-3xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col gap-6"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 w-full">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-3 bg-blue-50 dark:bg-slate-800 rounded-full text-brand-primary">
                          <Plane size={24} />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-brand-primary">{flight.airline}</span>
                          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">{flight.flightNumber}</h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-8 text-center">
                        <div>
                          <span className="text-base font-black">{flight.departureTime.split('T')[1].substring(0, 5)}</span>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">{flight.origin}</p>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-bold text-slate-400">Non-stop</span>
                          <ArrowRight size={14} className="text-slate-300 my-1" />
                          <span className="text-[10px] font-bold text-brand-secondary">Premium Class</span>
                        </div>
                        <div>
                          <span className="text-base font-black">{flight.arrivalTime.split('T')[1].substring(0, 5)}</span>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">{flight.destination}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <div className="md:text-right">
                          <span className="text-2xl font-black text-brand-accent">₹{flight.price.toLocaleString()}</span>
                          <p className="text-[10px] text-slate-500 font-bold">Includes bags & meals</p>
                          <button
                            onClick={() => setExpandedFlightId(expandedFlightId === flight.id ? null : flight.id)}
                            className="text-[10px] text-brand-primary hover:text-blue-700 dark:hover:text-blue-400 font-black flex items-center gap-1 cursor-pointer mt-1 justify-end md:ml-auto w-full"
                          >
                            <TrendingUp size={11} className="text-brand-secondary animate-pulse" />
                            {expandedFlightId === flight.id ? 'Hide Price Info' : 'Price Trends & Surcharges'}
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleWishlistToggle(flight)}
                            className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 border hover:scale-105 transition-transform"
                          >
                            <Heart
                              size={18}
                              className={isItemInWishlist(flight.id) ? 'fill-red-500 text-red-500' : 'text-slate-400'}
                            />
                          </button>
                          <button
                            onClick={() => navigate(`/booking-flow?type=flight&id=${flight.id}`)}
                            className="bg-brand-primary hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-6 rounded-xl shadow transition-all duration-300"
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Pricing Breakdown and Chart */}
                    {expandedFlightId === flight.id && (
                      <PriceTrendsAndBreakdown
                        itemId={flight.id}
                        itemType="FLIGHT"
                        pricingDetails={flight.pricingDetails}
                      />
                    )}
                  </div>
                ))}

              {/* Hotel List */}
              {type === 'hotel' &&
                getSortedHotels().map((hotel) => (
                  <div
                    key={hotel.id}
                    className="glass rounded-3xl overflow-hidden border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col"
                  >
                    <div className="flex flex-col md:flex-row">
                      <img
                        src={hotel.imageUrl}
                        alt={hotel.name}
                        className="w-full md:w-48 h-48 md:h-auto object-cover"
                      />
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-brand-primary">{hotel.location}</span>
                            <span className="flex items-center gap-1 text-xs font-black text-amber-500">
                              <Star size={14} className="fill-amber-500" /> {hotel.rating}
                            </span>
                          </div>
                          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">{hotel.name}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-relaxed">
                            {hotel.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                          <div>
                            <span className="text-2xl font-black text-brand-accent">₹{hotel.pricePerNight.toLocaleString()}</span>
                            <span className="text-[10px] text-slate-500 font-bold block">per night (excl. taxes)</span>
                            <button
                              onClick={() => setExpandedHotelId(expandedHotelId === hotel.id ? null : hotel.id)}
                              className="text-[10px] text-brand-primary hover:text-blue-700 dark:hover:text-blue-400 font-black flex items-center gap-1 cursor-pointer mt-1 text-left"
                            >
                              <TrendingUp size={11} className="text-brand-secondary animate-pulse" />
                              {expandedHotelId === hotel.id ? 'Hide Price Info' : 'Price Trends & Surcharges'}
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleWishlistToggle(hotel)}
                              className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 border hover:scale-105 transition-transform"
                            >
                              <Heart
                                size={18}
                                className={isItemInWishlist(hotel.id) ? 'fill-red-500 text-red-500' : 'text-slate-400'}
                              />
                            </button>
                            <button
                              onClick={() => navigate(`/booking-flow?type=hotel&id=${hotel.id}`)}
                              className="bg-brand-primary hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-6 rounded-xl shadow transition-all duration-300"
                            >
                              Book Stay
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Pricing Breakdown and Chart */}
                    {expandedHotelId === hotel.id && (
                      <div className="px-6 pb-6 border-t border-slate-100 dark:border-slate-800/80">
                        <PriceTrendsAndBreakdown
                          itemId={hotel.id}
                          itemType="HOTEL"
                          pricingDetails={hotel.pricingDetails}
                        />
                      </div>
                    )}
                  </div>
                ))}

              {((type === 'flight' && getSortedFlights().length === 0) ||
                (type === 'hotel' && getSortedHotels().length === 0)) && (
                <div className="text-center py-12 bg-white dark:bg-slate-900 border rounded-3xl p-6">
                  <p className="text-slate-500 font-bold text-sm">No items found matching the selected filters.</p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
