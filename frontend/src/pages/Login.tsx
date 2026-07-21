import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, clearError, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-[80svh] flex items-center justify-center px-4 py-12">
      <div className="glass max-w-md w-full rounded-3xl p-8 shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <span className="text-2xl font-black tracking-tight text-brand-primary">
            VAYU<span className="text-brand-accent">BOOK</span>
          </span>
          <h2 className="text-xl font-bold mt-3 text-slate-800 dark:text-slate-100">Welcome Back</h2>
          <p className="text-xs text-slate-500 mt-1 font-semibold">Sign in to check bookings and wallet funds</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 mb-6">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1.5">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@makemytrip.com"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-2xl py-3 pl-11 pr-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1.5">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-2xl py-3 pl-11 pr-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-primary hover:bg-blue-700 disabled:bg-slate-400 text-white font-bold py-3.5 px-4 rounded-2xl text-sm shadow-lg shadow-blue-500/20 transition-all duration-300 hover:scale-102 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? 'Signing In...' : <><LogIn size={16} /> Sign In</>}
          </button>
        </form>

        <p className="text-xs text-center text-slate-500 font-semibold mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-primary hover:underline font-bold">Register here</Link>
        </p>
      </div>
    </div>
  );
}
