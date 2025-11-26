import React from 'react';
import { Sparkles, User, ScanSearch, Crown, LogOut, Clock } from 'lucide-react';
import { View, UserProfile } from '../types';
import { Button } from './Button';

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
          <div className="bg-gradient-to-br from-rose-500 to-orange-600 p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-lg shadow-rose-500/20 group-hover:shadow-rose-500/30 transition-all duration-300">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight block">
            MinihaAI
          </span>
        </div>

        <nav className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-xl border border-slate-200/50">
          <button 
            onClick={() => onChangeView(View.EDITOR)}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
              currentView === View.EDITOR 
                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            Editor
          </button>
          
          <button 
            onClick={() => onChangeView(View.DETECTOR)}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              currentView === View.DETECTOR 
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
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name || 'Profile'} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-4 h-4" />
              )}
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