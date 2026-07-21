import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface ItineraryDay {
  day: number;
  morning: string;
  afternoon: string;
  evening: string;
}

const mockItineraries: Record<string, ItineraryDay[]> = {
  Delhi: [
    { day: 1, morning: 'Visit the historical Red Fort and Jama Masjid', afternoon: 'Explore the bustling street food alleys of Chandni Chowk', evening: 'Relax with light show at India Gate' },
    { day: 2, morning: 'Tour Qutub Minar and Humayun’s Tomb complex', afternoon: 'Upscale shopping and lunch at Connaught Place', evening: 'Sunset spiritual experience at Lotus Temple' },
  ],
  Mumbai: [
    { day: 1, morning: 'Walk by Marine Drive & Gateway of India', afternoon: 'Take a ferry ride to Elephanta Caves temples', evening: 'Enjoy local street food (Bhel Puri) at Chowpatty Beach' },
    { day: 2, morning: 'Visit the Siddhivinayak Temple & Haji Ali Dargah', afternoon: 'Explore boutique shops and cafes in Colaba', evening: 'Sunset views near Bandra-Worli Sea Link' },
  ],
  Goa: [
    { day: 1, morning: 'Unwind at Calangute and Baga beach shacks', afternoon: 'Water sports activities (Jet ski or parasail)', evening: 'Beachside barbecue and live music party' },
    { day: 2, morning: 'Explore Old Goa churches (Basilica of Bom Jesus)', afternoon: 'Spice plantation tour with traditional Goan lunch', evening: 'Sunset cruise along Mandovi River' },
  ],
};

export default function AiTripPlanner() {
  const [city, setCity] = useState('Goa');
  const [days, setDays] = useState(2);
  const [budget, setBudget] = useState('Premium');
  const [itinerary, setItinerary] = useState<ItineraryDay[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = () => {
    setLoading(true);
    setItinerary(null);
    setTimeout(() => {
      setItinerary(mockItineraries[city] || mockItineraries['Goa']);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="glass rounded-3xl p-6 shadow-lg border border-white/20 transition-all duration-300 hover:shadow-xl">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
        <Sparkles className="text-brand-accent animate-bounce" size={20} />
        AI Trip Planner
      </h3>
      <p className="text-xs text-slate-500 mb-6 font-semibold">
        Input details to generate a customized travel itinerary dynamically.
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1.5">Destination</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold rounded-xl p-2.5 border border-slate-200 dark:border-slate-700 outline-none"
            >
              <option value="Goa">Goa (Beach & Parties)</option>
              <option value="Delhi">Delhi (History & Food)</option>
              <option value="Mumbai">Mumbai (City Lights)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1.5">Budget</label>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold rounded-xl p-2.5 border border-slate-200 dark:border-slate-700 outline-none"
            >
              <option value="Budget">Budget Friendly</option>
              <option value="Premium">Premium Luxury</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-brand-primary hover:bg-blue-700 disabled:bg-slate-400 text-white font-bold rounded-xl py-3 text-xs shadow transition-all duration-300 hover:scale-102 flex items-center justify-center gap-1.5"
        >
          {loading ? 'Analyzing Destinations...' : <><Sparkles size={14} /> Generate Itinerary</>}
        </button>
      </div>

      {itinerary && (
        <div className="mt-6 border-t border-slate-200 dark:border-slate-700/50 pt-4 space-y-4 max-h-[300px] overflow-y-auto pr-1 no-scrollbar animate-fadeIn">
          <span className="text-xs font-bold text-brand-secondary tracking-wider block uppercase">GENERATED ITINERARY</span>
          {itinerary.map((day) => (
            <div key={day.day} className="bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl">
              <span className="text-xs font-bold text-brand-accent block mb-2">Day {day.day} - Outline</span>
              <ul className="text-xs font-medium space-y-2 text-slate-600 dark:text-slate-300">
                <li>🌅 <span className="font-bold text-slate-800 dark:text-slate-100">Morning:</span> {day.morning}</li>
                <li>☀️ <span className="font-bold text-slate-800 dark:text-slate-100">Afternoon:</span> {day.afternoon}</li>
                <li>🌙 <span className="font-bold text-slate-800 dark:text-slate-100">Evening:</span> {day.evening}</li>
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
