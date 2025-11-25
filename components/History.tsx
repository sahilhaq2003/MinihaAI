import React from 'react';
import { HistoryItem } from '../types';
import { Clock, ArrowRight, Trash2 } from 'lucide-react';

interface HistoryProps {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export const History: React.FC<HistoryProps> = ({ items, onSelect, onClear }) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center bg-white/50">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
           <Clock className="w-6 h-6 text-slate-300" />
        </div>
        <p className="font-medium text-slate-600">No history yet</p>
        <p className="text-xs mt-1 text-slate-400">Your processed texts will appear here.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white border-r border-slate-200/60">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wide">
          <Clock className="w-4 h-4 text-rose-500" /> Recent Activity
        </h3>
        <button 
          onClick={onClear}
          className="text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all p-1.5 rounded-md"
          title="Clear History"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="overflow-y-auto flex-1 p-3 space-y-2">
        {items.map((item) => (
          <div 
            key={item.id}
            onClick={() => onSelect(item)}
            className="group p-3.5 rounded-xl border border-transparent bg-slate-50 hover:bg-white hover:border-rose-100 hover:shadow-lg hover:shadow-rose-100/50 transition-all duration-200 cursor-pointer relative"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold tracking-wider text-rose-600 uppercase bg-rose-50 px-2 py-0.5 rounded-md">
                {item.tone}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-xs text-slate-600 line-clamp-2 mb-2 font-medium leading-relaxed">
              {item.humanized}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};