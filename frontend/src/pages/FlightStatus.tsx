import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plane, Bell, Search, AlertTriangle, Clock, MapPin, RefreshCw } from 'lucide-react';

interface FlightStatusInfo {
  flightNumber: string;
  status: 'ON_TIME' | 'DELAYED' | 'BOARDING';
  statusText: string;
  delayReason: string;
  gate: string;
  revisedDeparture: string;
  estimatedArrival: string;
}

export default function FlightStatus() {
  const [flightNo, setFlightNo] = useState('');
  const [currentStatus, setCurrentStatus] = useState<FlightStatusInfo | null>(null);
  const [trackedFlights, setTrackedFlights] = useState<FlightStatusInfo[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [error, setError] = useState('');

  // Request browser push notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    // Load previously tracked flights
    const saved = localStorage.getItem('tracked_flights');
    if (saved) {
      setTrackedFlights(JSON.parse(saved));
    }
  }, []);

  const triggerPushNotification = (title: string, body: string) => {
    // Local alert state
    setNotifications((prev) => [`[${new Date().toLocaleTimeString()}] ${title}: ${body}`, ...prev]);

    // System push notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new window.Notification(title, { body, icon: '/favicon.ico' });
    }
  };

  const handleSearchStatus = async (numberToSearch: string) => {
    if (!numberToSearch.trim()) return;
    setError('');
    try {
      const res = await api.get(`/api/flights/status/${numberToSearch.trim().toUpperCase()}`);
      setCurrentStatus(res.data);
    } catch (err) {
      setError('Flight number not found in dynamic tracking system.');
    }
  };

  const handleTrackFlight = () => {
    if (!currentStatus) return;
    if (trackedFlights.some((f) => f.flightNumber === currentStatus.flightNumber)) {
      alert('Flight is already in your tracking list.');
      return;
    }
    const updated = [...trackedFlights, currentStatus];
    setTrackedFlights(updated);
    localStorage.setItem('tracked_flights', JSON.stringify(updated));
    triggerPushNotification('Tracking Registered', `Now tracking real-time status updates for Flight ${currentStatus.flightNumber}`);
  };

  const handleRemoveTracked = (number: string) => {
    const updated = trackedFlights.filter((f) => f.flightNumber !== number);
    setTrackedFlights(updated);
    localStorage.setItem('tracked_flights', JSON.stringify(updated));
  };

  // Simulating random status updates for tracked flights to show push notifications
  useEffect(() => {
    const interval = setInterval(() => {
      if (trackedFlights.length === 0) return;

      // Select random tracked flight and simulate status change
      const randomIndex = Math.floor(Math.random() * trackedFlights.length);
      const target = trackedFlights[randomIndex];
      
      const states: ('ON_TIME' | 'DELAYED' | 'BOARDING')[] = ['ON_TIME', 'DELAYED', 'BOARDING'];
      const nextState = states[Math.floor(Math.random() * states.length)];
      
      if (nextState !== target.status) {
        const updatedFlights = trackedFlights.map((f, idx) => {
          if (idx === randomIndex) {
            const revisedTime = nextState === 'DELAYED' 
              ? new Date(Date.now() + 5400000).toISOString() 
              : new Date(Date.now() + 1800000).toISOString();
            
            const delayReasons = {
              'DELAYED': 'Heavy air traffic control delays at the destination airport.',
              'BOARDING': 'On-time boarding started at gate.',
              'ON_TIME': 'Flight operates on regular schedule.'
            };

            const updatedInfo: FlightStatusInfo = {
              ...f,
              status: nextState,
              statusText: nextState === 'DELAYED' ? 'Delayed by 1h 30m' : nextState === 'BOARDING' ? 'Boarding in progress' : 'On Time',
              delayReason: delayReasons[nextState],
              revisedDeparture: revisedTime,
            };

            // Trigger notification
            triggerPushNotification(
              `Flight Status Update: ${target.flightNumber}`,
              `Status changed to ${updatedInfo.statusText}. Reason: ${updatedInfo.delayReason}`
            );

            return updatedInfo;
          }
          return f;
        });

        setTrackedFlights(updatedFlights);
        localStorage.setItem('tracked_flights', JSON.stringify(updatedFlights));
      }
    }, 15000); // Check and simulate changes every 15s

    return () => clearInterval(interval);
  }, [trackedFlights]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-6 border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Plane className="text-brand-accent animate-bounce" /> Live Flight Status & Tracking
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">Get real-time schedules, estimated arrivals, gates, and push updates</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Tracker Search Console */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-3xl p-6 border shadow-lg space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Search className="text-brand-primary" size={18} /> Search Flight Number
            </h3>
            
            <div className="flex gap-3">
              <input
                type="text"
                value={flightNo}
                onChange={(e) => setFlightNo(e.target.value)}
                placeholder="e.g. AI-101, 6E-203"
                className="flex-1 bg-slate-50 dark:bg-slate-800 border rounded-2xl py-3 px-4 text-xs font-semibold outline-none focus:border-brand-primary"
              />
              <button
                onClick={() => handleSearchStatus(flightNo)}
                className="bg-brand-primary text-white font-bold px-6 py-3 rounded-2xl text-xs flex items-center gap-1.5 hover:bg-brand-secondary transition-all"
              >
                Check Status
              </button>
            </div>
            {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}
            <p className="text-[10px] text-slate-400 font-semibold">Tip: Try searching AI-101 (Delayed example) or 6E-203 (Boarding example) for simulation demo.</p>
          </div>

          {/* Searched Flight Info */}
          {currentStatus && (
            <div className="glass rounded-3xl p-6 border shadow-lg space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b pb-4 dark:border-slate-800">
                <div>
                  <span className="text-2xl font-black">{currentStatus.flightNumber}</span>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Operating Carrier Details</span>
                </div>
                <span className={`py-1.5 px-4 rounded-full text-xs font-black uppercase tracking-wider ${
                  currentStatus.status === 'DELAYED' 
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                    : currentStatus.status === 'BOARDING' 
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                }`}>
                  {currentStatus.statusText}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex items-start gap-2.5">
                  <MapPin className="text-slate-400 mt-1" size={16} />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Departing Gate</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{currentStatus.gate}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock className="text-slate-400 mt-1" size={16} />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Revised Departure</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {new Date(currentStatus.revisedDeparture).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock className="text-slate-400 mt-1" size={16} />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Estimated Arrival</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {new Date(currentStatus.estimatedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>

              {currentStatus.status === 'DELAYED' && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl p-4 flex gap-3 text-xs text-red-600 dark:text-red-400 font-semibold">
                  <AlertTriangle className="flex-shrink-0" size={18} />
                  <div>
                    <p className="font-bold">Delay Advisory Details</p>
                    <p className="text-[11px] text-red-500/90 mt-1">{currentStatus.delayReason}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleTrackFlight}
                  className="bg-brand-secondary text-white font-bold py-2.5 px-6 rounded-2xl text-xs flex items-center gap-1.5 hover:opacity-90"
                >
                  <Bell size={14} /> Add to Tracked List
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tracked List & Notifications Simulator */}
        <div className="space-y-6">
          
          {/* Active Tracked List */}
          <div className="glass rounded-3xl p-6 border shadow-lg space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <RefreshCw className="text-brand-secondary animate-spin-slow" size={18} /> Active Tracked List
            </h3>
            
            {trackedFlights.length === 0 ? (
              <p className="text-xs text-slate-400 font-semibold py-4 text-center">No flights tracked yet. Add one to see real-time updates.</p>
            ) : (
              <div className="space-y-3.5">
                {trackedFlights.map((flight) => (
                  <div key={flight.flightNumber} className="p-3.5 border rounded-2xl space-y-2 text-xs font-semibold">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-sm">{flight.flightNumber}</span>
                      <span className={`text-[10px] py-0.5 px-2.5 rounded-full font-bold ${
                        flight.status === 'DELAYED' ? 'bg-red-50 text-red-500' : flight.status === 'BOARDING' ? 'bg-amber-50 text-amber-500' : 'bg-green-50 text-green-500'
                      }`}>{flight.statusText}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                      <span>Gate: {flight.gate}</span>
                      <span>Est Arr: {new Date(flight.estimatedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => handleRemoveTracked(flight.flightNumber)}
                        className="text-[10px] font-bold text-red-500 hover:underline"
                      >
                        Stop Tracking
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Simulated System Log */}
          <div className="glass rounded-3xl p-6 border shadow-lg space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Bell className="text-brand-accent" size={18} /> Push Alerts Logs
            </h3>
            <div className="h-[200px] overflow-y-auto space-y-2 pr-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 no-scrollbar">
              {notifications.length === 0 ? (
                <p className="text-center py-8 text-slate-400">Push status alerts will print here.</p>
              ) : (
                notifications.map((n, i) => (
                  <div key={i} className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border-l-4 border-brand-accent">
                    {n}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
