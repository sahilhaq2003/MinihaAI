import React from 'react';
import { User, ScanSearch, Crown, LogOut, Clock } from 'lucide-react';
import { View, UserProfile } from '../types';
import { Button } from './Button';

// Custom MinihaAI Logo Component (using favicon design)
const MinihaAILogo: React.FC<{ className?: string }> = ({ className = "w-4 h-4 sm:w-5 sm:h-5" }) => {
  return (
    <svg
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#f43f5e' }} />
          <stop offset="100%" style={{ stopColor: '#e11d48' }} />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#logoGrad)" />
      <text x="16" y="23" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="bold" fill="white" textAnchor="middle">M</text>
    </svg>
  );
};

interface HeaderProps {
  currentView: View;
  onChangeView: (view: View) => void;
  isPremium: boolean;
  onLogout?: () => void;
  user?: UserProfile;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onChangeView, isPremium, onLogout, user }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
          onClick={() => onChangeView(View.EDITOR)}
        >
          <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-lg shadow-rose-500/20 group-hover:shadow-rose-500/30 transition-all duration-300 flex items-center justify-center">
            <MinihaAILogo className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight block">
            MinihaAI
          </span>
        </div>

        <nav className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-xl border border-slate-200/50">
          <button
            onClick={() => onChangeView(View.EDITOR)}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${currentView === View.EDITOR
              ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
          >
            Editor
          </button>

          <button
            onClick={() => onChangeView(View.DETECTOR)}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-2 ${currentView === View.DETECTOR
              ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
          >
            <ScanSearch className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">AI Detector</span>
            <span className="sm:hidden">Detect</span>
          </button>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => onChangeView(View.HISTORY)}
            className={`lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors ${currentView === View.HISTORY ? 'bg-rose-50 text-rose-600' : ''}`}
            title="History"
          >
            <Clock className="w-5 h-5" />
          </button>

          {!isPremium && (
            <Button
              size="sm"
              variant="primary"
              className="hidden md:flex items-center gap-1.5 shadow-rose-500/20"
              onClick={() => onChangeView(View.PRICING)}
            >
              <Crown className="w-4 h-4" /> Go Pro
            </Button>
          )}

          <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onChangeView(View.PROFILE)}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center ring-2 shadow-sm border border-slate-200 transition-all overflow-hidden ${currentView === View.PROFILE ? 'bg-rose-100 text-rose-600 ring-rose-200' : 'bg-slate-100 text-slate-500 ring-white hover:bg-white'}`}
              title="My Profile"
            >
              {(() => {
                const isValidAvatar = (url?: string) => {
                  if (!url) return false;
                  if (url.startsWith('http://') || url.startsWith('https://')) return true;
                  if (url.startsWith('data:image/')) {
                    if (!url.includes('base64,')) return false;
                    const base64Data = url.split('base64,')[1];
                    // Strict check: Base64 length must be a multiple of 4
                    if (!base64Data || base64Data.length % 4 !== 0) return false;
                    return true;
                  }
                  return false;
                };

                return isValidAvatar(user?.avatar) ? (
                  <img
                    src={user.avatar}
                    alt={user.name || 'Profile'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement?.classList.add('fallback-icon');
                    }}
                  />
                ) : (
                  <User className="w-4 h-4" />
                );
              })()}
              {/* Fallback icon that shows when image is hidden */}
              <style>{`
                .fallback-icon::after {
                  content: '';
                  display: block;
                  width: 100%;
                  height: 100%;
                  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E");
                  background-repeat: no-repeat;
                  background-position: center;
                  background-size: 50%;
                }
              `}</style>
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors hidden sm:block"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};