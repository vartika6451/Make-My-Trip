import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Sun, Moon, LogOut, User, LayoutDashboard, Wallet, Compass } from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export default function Navbar({ darkMode, setDarkMode }: NavbarProps) {
  const { user, isAuthenticated, logout, fetchProfile } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, fetchProfile]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass sticky top-0 z-50 transition-all duration-300 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-secondary">
                VAYU<span className="text-brand-accent">BOOK</span>
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6 text-sm font-semibold">
            <Link to="/" className="hover:text-brand-primary transition-colors py-2">Home</Link>
            <Link to="/#offers" className="hover:text-brand-primary transition-colors py-2">Offers</Link>
            <Link to="/#destinations" className="hover:text-brand-primary transition-colors py-2">Destinations</Link>
            {user?.role === 'ROLE_ADMIN' && (
              <Link to="/admin" className="flex items-center gap-1 text-brand-accent hover:text-brand-primary transition-colors py-2">
                <LayoutDashboard size={16} /> Admin Panel
              </Link>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-4">
                {/* Wallet Balance Info */}
                <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 py-1.5 px-3 rounded-full border border-slate-200 dark:border-slate-700">
                  <Wallet size={16} className="text-brand-secondary" />
                  <span className="text-xs font-bold">₹{user.walletBalance.toLocaleString('en-IN')}</span>
                </div>

                {/* User Dropdown Profile Link */}
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1 text-slate-700 dark:text-slate-200 hover:text-brand-primary dark:hover:text-brand-primary transition-colors text-sm font-medium"
                >
                  <User size={18} className="text-brand-primary" />
                  <span className="max-w-[120px] truncate">{user.name}</span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 hover:text-red-700 transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold hover:text-brand-primary transition-colors px-3 py-1.5"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-brand-primary hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-105"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
