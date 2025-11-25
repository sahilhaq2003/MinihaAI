
import React, { useEffect, useState } from 'react';
import { UserProfile, HistoryItem, Transaction } from '../types';
import { getBillingHistory } from '../services/authService';
import { User, Mail, CreditCard, Calendar, BarChart3, Shield, Zap, LogOut, Settings, Download } from 'lucide-react';
import { Button } from './Button';

interface ProfileProps {
  user: UserProfile;
  history: HistoryItem[];
  onLogout: () => void;
  onUpgrade: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, history, onLogout, onUpgrade }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingBilling, setIsLoadingBilling] = useState(false);

  useEffect(() => {
    const loadBilling = async () => {
        setIsLoadingBilling(true);
        try {
            const data = await getBillingHistory(user.id);
            setTransactions(data);
        } catch (e) {
            console.error("Failed to load billing");
        } finally {
            setIsLoadingBilling(false);
        }
    };
    loadBilling();
  }, [user.id]);

  // Calculate stats
  const totalGenerations = history.length;
  const totalWords = history.reduce((acc, item) => acc + item.humanized.length, 0);
  const wordsSaved = Math.round(totalWords / 5); // Estimate 5 chars per word
  
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
          <p className="text-slate-500 mt-1">Manage your profile, subscription, and usage.</p>
        </div>
        <Button variant="outline" onClick={onLogout} className="text-rose-600 border-rose-100 hover:bg-rose-50">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Identity & Actions */}
        <div className="space-y-6">
          {/* Identity Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-slate-800 to-slate-900"></div>
             <div className="relative mt-8 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-white overflow-hidden mb-4">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <User className="w-10 h-10" />
                    </div>
                  )}
                </div>
                <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
                <div className="flex items-center gap-2 text-slate-500 text-sm mt-1 mb-4">
                  <Mail className="w-3 h-3" /> {user.email}
                </div>
                
                <div className="w-full pt-4 border-t border-slate-100 flex justify-between text-sm">
                   <span className="text-slate-500">Member since</span>
                   <span className="font-medium text-slate-900">Oct 2024</span>
                </div>
             </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Usage Analytics
            </h3>
            <div className="space-y-4">
               <div className="flex justify-between items-center">
                  <span className="text-slate-600">Total Rewrites</span>
                  <span className="font-bold text-slate-900">{totalGenerations}</span>
               </div>
               <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: `${Math.min(totalGenerations, 100)}%` }}></div>
               </div>
               
               <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-600">Words Humanized</span>
                  <span className="font-bold text-slate-900">~{wordsSaved.toLocaleString()}</span>
               </div>
               
               <div className="mt-4 p-3 bg-slate-50 rounded-xl text-xs text-slate-500 leading-relaxed border border-slate-100">
                 You've saved approximately <strong>{Math.ceil(wordsSaved / 300)} hours</strong> of manual editing time using MinihaAI.
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: Subscription & Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Subscription Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                 <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                   <CreditCard className="w-5 h-5 text-rose-600" /> Subscription Plan
                 </h3>
                 <p className="text-slate-500 text-sm mt-1">Manage your billing and plan details.</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${user.isPremium ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg shadow-rose-500/30' : 'bg-slate-100 text-slate-600'}`}>
                {user.isPremium ? 'Pro Plan' : 'Free Plan'}
              </span>
            </div>
            
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="space-y-1">
                 <span className="text-xs font-bold text-slate-400 uppercase">Current Status</span>
                 <p className="text-slate-900 font-medium flex items-center gap-2">
                   <span className={`w-2 h-2 rounded-full ${user.isPremium ? 'bg-green-500' : 'bg-slate-300'}`}></span> 
                   {user.isPremium ? 'Active' : 'Inactive'}
                 </p>
               </div>
               <div className="space-y-1">
                 <span className="text-xs font-bold text-slate-400 uppercase">Billing Cycle</span>
                 <p className="text-slate-900 font-medium">Monthly</p>
               </div>
               <div className="space-y-1">
                 <span className="text-xs font-bold text-slate-400 uppercase">Next Payment</span>
                 <p className="text-slate-900 font-medium">{user.isPremium ? 'Nov 24, 2024' : 'N/A'}</p>
               </div>
               <div className="space-y-1">
                 <span className="text-xs font-bold text-slate-400 uppercase">Payment Method</span>
                 <p className="text-slate-900 font-medium flex items-center gap-2">
                    {user.isPremium ? '•••• 4242' : 'None added'}
                 </p>
               </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100">
               {!user.isPremium ? (
                 <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-slate-600">
                      Unlock unlimited humanization and advanced detector bypass.
                    </div>
                    <Button onClick={onUpgrade} className="w-full sm:w-auto shadow-rose-500/20">
                      <Zap className="w-4 h-4 mr-2" /> Upgrade to Pro
                    </Button>
                 </div>
               ) : (
                 <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-slate-600">
                      You are currently on the best plan available.
                    </div>
                    <Button variant="outline" className="w-full sm:w-auto">
                      Manage Subscription
                    </Button>
                 </div>
               )}
            </div>
          </div>

          {/* Billing History / Details */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-slate-100">
                 <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                   <Calendar className="w-5 h-5 text-slate-400" /> Billing History
                 </h3>
             </div>
             
             {isLoadingBilling ? (
                <div className="p-8 text-center text-slate-400 text-sm animate-pulse">Loading history...</div>
             ) : transactions.length > 0 ? (
               <div className="divide-y divide-slate-100">
                 {transactions.map((item) => (
                   <div key={item.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex flex-col">
                        <span className="text-slate-900 font-medium">{item.date}</span>
                        <span className="text-slate-500 text-xs">{item.invoice}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium text-slate-900">{item.amount}</span>
                        <span className="px-2 py-1 rounded bg-green-50 text-green-700 text-xs font-bold uppercase">{item.status}</span>
                        <button className="p-2 text-slate-400 hover:text-slate-700">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="p-8 text-center text-slate-500 text-sm">
                 No billing history available.
               </div>
             )}
          </div>
          
           {/* Security / Misc */}
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
                   <Shield className="w-5 h-5 text-slate-400" /> Security
                </h3>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
                    <div className="flex flex-col">
                        <span className="font-medium text-slate-900">Password</span>
                        <span className="text-slate-500 text-sm">Last changed 3 months ago</span>
                    </div>
                    <Button variant="outline" size="sm">Change Password</Button>
                </div>
           </div>

        </div>
      </div>
    </div>
  );
};