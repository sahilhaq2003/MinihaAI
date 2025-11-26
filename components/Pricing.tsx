import React, { useState } from 'react';
import { Check, Star, Zap, Shield, ScanSearch, Sparkles, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { processPayment } from '../services/authService';

interface PricingProps {
  onSubscribe: () => void;
  isPremium: boolean;
  userId?: string;
}

export const Pricing: React.FC<PricingProps> = ({ onSubscribe, isPremium, userId }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async () => {
    if (!userId) {
      setError("Please log in to upgrade.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = await processPayment(userId, "$19.00");
      if (result.success) {
        onSubscribe();
      }
    } catch (err: any) {
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="py-16 px-4 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Simple, transparent pricing
        </h2>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Upgrade to unlock unlimited humanization, advanced tones, and deeper AI detection analysis.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start max-w-4xl mx-auto">
        {/* Free Plan */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-shadow duration-300 relative overflow-hidden group">
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-900 uppercase tracking-wide">Starter</h3>
            <p className="text-slate-500 text-sm mt-2">Essential tools for occasional use.</p>
          </div>
          <div className="mb-8">
            <span className="text-5xl font-extrabold text-slate-900 tracking-tight">$0</span>
            <span className="text-slate-500 font-medium">/month</span>
          </div>
          <ul className="space-y-4 mb-8">
            <li className="flex items-center text-slate-700 text-sm">
              <div className="w-6 h-6 rounded-full bg-green-50 text-green-600 flex items-center justify-center mr-3 flex-shrink-0">
                  <Check className="w-3.5 h-3.5" />
              </div>
              10 Humanizations per day
            </li>
            <li className="flex items-center text-slate-700 text-sm">
              <div className="w-6 h-6 rounded-full bg-green-50 text-green-600 flex items-center justify-center mr-3 flex-shrink-0">
                  <Check className="w-3.5 h-3.5" />
              </div>
              Basic AI Detection (3/day)
            </li>
            <li className="flex items-center text-slate-700 text-sm">
              <div className="w-6 h-6 rounded-full bg-green-50 text-green-600 flex items-center justify-center mr-3 flex-shrink-0">
                  <Check className="w-3.5 h-3.5" />
              </div>
              Standard Tone only
            </li>
          </ul>
          <Button variant="outline" className="w-full py-3" disabled={!isPremium}>
            {isPremium ? 'Downgrade to Free' : 'Current Plan'}
          </Button>
        </div>

        {/* Pro Plan */}
        <div className="bg-slate-900 rounded-3xl p-1 p-[1px] shadow-2xl shadow-rose-900/20 transform md:-translate-y-4 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-orange-500 rounded-3xl opacity-20 blur-xl"></div>
          <div className="bg-slate-900 rounded-[23px] p-8 relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-rose-600 to-rose-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider shadow-lg">
                Most Popular
            </div>
            
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-white uppercase tracking-wide flex items-center gap-2">
                    Pro Humanizer <Sparkles className="w-4 h-4 text-rose-400" />
                </h3>
                <p className="text-slate-400 text-sm mt-2">Unlimited power for professionals.</p>
            </div>
            
            <div className="mb-8">
                <span className="text-5xl font-extrabold text-white tracking-tight">$19</span>
                <span className="text-slate-400 font-medium">/month</span>
            </div>
            
            <ul className="space-y-4 mb-8">
                <li className="flex items-center text-slate-300 text-sm font-medium">
                <div className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mr-3 flex-shrink-0 border border-rose-500/20">
                    <Check className="w-3.5 h-3.5" />
                </div>
                Unlimited Humanizations
                </li>
                <li className="flex items-center text-slate-300 text-sm font-medium">
                <div className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mr-3 flex-shrink-0 border border-rose-500/20">
                    <ScanSearch className="w-3.5 h-3.5" />
                </div>
                Unlimited AI Detection
                </li>
                <li className="flex items-center text-slate-300 text-sm font-medium">
                <div className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mr-3 flex-shrink-0 border border-rose-500/20">
                    <Star className="w-3.5 h-3.5" />
                </div>
                Access to All 7 Tones
                </li>
                <li className="flex items-center text-slate-300 text-sm font-medium">
                <div className="w-6 h-6 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mr-3 flex-shrink-0 border border-rose-500/20">
                    <Zap className="w-3.5 h-3.5" />
                </div>
                Priority Fast Processing
                </li>
            </ul>
            
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 text-red-400 text-xs rounded-lg text-center">
                {error}
              </div>
            )}
            <Button 
                variant="primary" 
                className="w-full py-4 text-base shadow-lg shadow-rose-900/40 border-none bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500"
                onClick={handleUpgrade}
                disabled={isPremium || isProcessing}
            >
                {isProcessing ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                ) : isPremium ? 'Active Plan' : 'Get Started with Pro'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};