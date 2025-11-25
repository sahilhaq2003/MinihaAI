import React from 'react';
import { Sparkles, User, ScanSearch, Crown } from 'lucide-react';
import { View } from '../types';
import { Button } from './Button';

interface HeaderProps {
  currentView: View;
  onChangeView: (view: View) => void;
  isPremium: boolean;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onChangeView, isPremium }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer group" 
          onClick={() => onChangeView(View.EDITOR)}
        >
          <div className="bg-gradient-to-br from-rose-500 to-orange-600 p-2 rounded-xl shadow-lg shadow-rose-500/20 group-hover:shadow-rose-500/30 transition-all duration-300">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight hidden sm:block">
            MinihaAI
          </span>
        </div>

        <nav className="flex items-center gap-1 sm:gap-2 bg-slate-100/50 p-1 rounded-xl border border-slate-200/50">
          <button 
            onClick={() => onChangeView(View.EDITOR)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentView === View.EDITOR 
                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            Editor
          </button>
          
          <button 
            onClick={() => onChangeView(View.DETECTOR)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              currentView === View.DETECTOR 
                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <ScanSearch className="w-4 h-4" />
            <span className="hidden sm:inline">AI Detector</span>
            <span className="sm:hidden">Detect</span>
          </button>
        </nav>

        <div className="flex items-center gap-3">
           <button 
            onClick={() => onChangeView(View.HISTORY)}
            className={`md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors ${currentView === View.HISTORY ? 'bg-rose-50 text-rose-600' : ''}`}
          >
            History
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

          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 ring-2 ring-white shadow-sm border border-slate-200">
              <User className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};