import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-white">
                VAYU<span className="text-brand-accent">BOOK</span>
              </span>
            </div>
            <p className="text-sm">
              Discover beautiful destinations worldwide. Experience premium bookings, flight comparisons, and travel planning inside a unified interface.
            </p>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-300">
              <a href="#" className="hover:text-brand-primary transition-colors">Facebook</a>
              <a href="#" className="hover:text-brand-primary transition-colors">Twitter</a>
              <a href="#" className="hover:text-brand-primary transition-colors">Instagram</a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Flights Search</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Hotels Booking</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Special Offers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">AI Trip Planner</a></li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-white font-bold mb-4">Policies</h3>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cancellation Rules</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Refund Policies</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3 text-sm">
            <h3 className="text-white font-bold mb-4">Contact Info</h3>
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-brand-secondary" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={16} className="text-brand-secondary" />
              <span>support@vayubook.com</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-brand-secondary" />
              <span>Aerocity, New Delhi, India</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-6 text-center text-xs">
          <p>© {new Date().getFullYear()} Vayubook travel platforms. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
