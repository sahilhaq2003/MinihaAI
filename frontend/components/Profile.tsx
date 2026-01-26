import React, { useEffect, useState, useRef } from 'react';
import { UserProfile, HistoryItem, Transaction } from '../types';
import { getBillingHistory } from '../services/authService';
import { User, Mail, CreditCard, Calendar, BarChart3, Shield, Zap, LogOut, Settings, Download, Camera, ShieldCheck, Trash2, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';
import imageCompression from 'browser-image-compression';
import { DeleteAccountModal } from './DeleteAccountModal';
import { ChangePassword } from './ChangePassword';
import { deleteAccount, checkPaymentStatus } from '../services/authService';

interface ProfileProps {
  user: UserProfile;
  history: HistoryItem[];
  onLogout: () => void;
  onUpgrade: () => void;
  onUserUpdate?: (updatedUser: UserProfile) => void;
  onNavigateToAdmin?: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, history, onLogout, onUpgrade, onUserUpdate, onNavigateToAdmin }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingBilling, setIsLoadingBilling] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [paymentStatusMessage, setPaymentStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Calculate remaining days for premium plan
  const getRemainingDays = () => {
    if (!user.isPremium || !user.premiumExpiresAt) return null;
    
    const expirationDate = new Date(user.premiumExpiresAt);
    const now = new Date();
    const diffTime = expirationDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isExpired = diffDays <= 0;
    const daysRemaining = isExpired ? 0 : diffDays;
    
    return { daysRemaining, isExpired, expirationDate };
  };

  const remainingDaysInfo = getRemainingDays();

  // Format next payment date from expiration date
  const getNextPaymentDate = () => {
    if (!user.isPremium || !user.premiumExpiresAt) return null;
    
    const expirationDate = new Date(user.premiumExpiresAt);
    // Format date as "Mon DD, YYYY" (e.g., "Nov 24, 2024")
    return expirationDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const nextPaymentDate = getNextPaymentDate();

  // Handle photo upload
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB before compression)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be less than 5MB');
      return;
    }

    setIsUploadingPhoto(true);
    setUploadError(null);

    try {
      // Compress image to low quality
      const options = {
        maxSizeMB: 0.2, // Target 200KB max
        maxWidthOrHeight: 400, // Resize to max 400px
        useWebWorker: true,
        quality: 0.4, // Low quality (0.4 = 40% quality)
        fileType: 'image/jpeg' // Convert to JPEG for better compression
      };

      const compressedFile = await imageCompression(file, options);
      
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        try {
          // Send to backend
          const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api';
          const response = await fetch(`${backendUrl}/user/${user.id}/photo`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ photo: base64String }),
          });

          const data = await response.json();

          if (data.success) {
            // Update user state in parent component
            if (onUserUpdate && data.user) {
              onUserUpdate(data.user);
            } else {
              // Fallback: fetch updated user data
              const userResponse = await fetch(`${backendUrl}/user/${user.id}`);
              const userData = await userResponse.json();
              if (userData.success && onUserUpdate) {
                onUserUpdate(userData.user);
              }
            }
            setUploadError(null);
          } else {
            setUploadError(data.message || 'Failed to upload photo');
          }
        } catch (error) {
          console.error('Upload error:', error);
          setUploadError('Failed to upload photo. Please try again.');
        } finally {
          setIsUploadingPhoto(false);
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };

      reader.onerror = () => {
        setUploadError('Failed to read image file');
        setIsUploadingPhoto(false);
      };

      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Compression error:', error);
      setUploadError('Failed to process image. Please try again.');
      setIsUploadingPhoto(false);
    }
  };

  // Check payment status on mount and periodically
  useEffect(() => {
    if (!user.isPremium) {
      const checkStatus = async () => {
        try {
          const status = await checkPaymentStatus(user.id);
          if (status.success && status.isPremium) {
            // Payment was approved - refresh user data
            const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api';
            const response = await fetch(`${BACKEND_URL}/user/${user.id}`);
            const data = await response.json();
            
            if (data.success && data.user.isPremium) {
              setPaymentStatusMessage('✅ Your payment has been approved! Your Pro plan is now active.');
              if (onUserUpdate) {
                onUserUpdate({ ...user, isPremium: true, premiumExpiresAt: data.user.premiumExpiresAt });
              }
              if (onUpgrade) {
                onUpgrade();
              }
              // Clear message after 5 seconds
              setTimeout(() => setPaymentStatusMessage(null), 5000);
            }
          }
        } catch (error) {
          console.error('Payment status check error:', error);
        }
      };

      // Check immediately
      checkStatus();
      
      // Check every 30 seconds
      const interval = setInterval(checkStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [user.id, user.isPremium, onUserUpdate, onUpgrade]);

  const handleCheckPaymentStatus = async () => {
    setIsCheckingPayment(true);
    setPaymentStatusMessage(null);
    
    try {
      const status = await checkPaymentStatus(user.id);
      
      if (status.success) {
        if (status.isPremium) {
          // Payment was approved - refresh user data
          const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api';
          const response = await fetch(`${BACKEND_URL}/user/${user.id}`);
          const data = await response.json();
          
          if (data.success && data.user.isPremium) {
            setPaymentStatusMessage('✅ Your payment has been approved! Your Pro plan is now active.');
            if (onUserUpdate) {
              onUserUpdate({ ...user, isPremium: true, premiumExpiresAt: data.user.premiumExpiresAt });
            }
            if (onUpgrade) {
              onUpgrade();
            }
          } else {
            setPaymentStatusMessage('Your payment is still pending approval.');
          }
        } else if (status.hasPending) {
          setPaymentStatusMessage('⏳ Your payment request is pending admin approval.');
        } else {
          setPaymentStatusMessage('No pending payment requests found.');
        }
      }
    } catch (error) {
      setPaymentStatusMessage('Failed to check payment status. Please try again.');
    } finally {
      setIsCheckingPayment(false);
      setTimeout(() => setPaymentStatusMessage(null), 5000);
    }
  };

  // Handle invoice download
  const handleDownloadInvoice = (transaction: Transaction) => {
    try {
      // Create invoice content
      const invoiceContent = `
INVOICE
${transaction.invoice}

Date: ${transaction.date}
Amount: ${transaction.amount}
Status: ${transaction.status}

Customer Information:
Name: ${user.name}
Email: ${user.email}

---
MinihaAI
Thank you for your business!
      `.trim();

      // Create a blob with the invoice content
      const blob = new Blob([invoiceContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary anchor element and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${transaction.invoice.replace('#', '')}-${transaction.date.replace(/,/g, '').replace(/\s+/g, '-')}.txt`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice. Please try again.');
    }
  };
  
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">Manage your profile, subscription, and usage.</p>
        </div>
        <Button variant="outline" onClick={onLogout} className="text-rose-600 border-rose-100 hover:bg-rose-50 w-full sm:w-auto">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Left Column: Identity & Actions */}
        <div className="space-y-6">
          {/* Identity Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-slate-800 to-slate-900"></div>
             <div className="relative mt-8 flex flex-col items-center text-center">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-white overflow-hidden mb-4">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <User className="w-10 h-10" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-rose-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Upload profile photo"
                  >
                    {isUploadingPhoto ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
                {uploadError && (
                  <div className="mb-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                    {uploadError}
                  </div>
                )}
                <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
                <div className="flex items-center gap-2 text-slate-500 text-sm mt-1 mb-4">
                  <Mail className="w-3 h-3" /> {user.email}
                </div>
                
                <div className="w-full pt-4 border-t border-slate-100 flex justify-between text-sm">
                   <span className="text-slate-500">Member since</span>
                   <span className="font-medium text-slate-900">
                     {user.createdAt 
                       ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                           month: 'short', 
                           year: 'numeric' 
                         })
                       : 'N/A'}
                   </span>
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
                 <p className="text-slate-900 font-medium">
                   {user.isPremium && nextPaymentDate ? nextPaymentDate : 'N/A'}
                 </p>
               </div>
               <div className="space-y-1">
                 <span className="text-xs font-bold text-slate-400 uppercase">Plan Expires</span>
                 {user.isPremium && remainingDaysInfo ? (
                   <div>
                     <p className={`text-slate-900 font-medium ${remainingDaysInfo.isExpired ? 'text-red-600' : remainingDaysInfo.daysRemaining <= 7 ? 'text-orange-600' : ''}`}>
                       {remainingDaysInfo.isExpired 
                         ? 'Expired' 
                         : remainingDaysInfo.daysRemaining === 1 
                           ? '1 day remaining' 
                           : `${remainingDaysInfo.daysRemaining} days remaining`}
                     </p>
                     {remainingDaysInfo.expirationDate && (
                       <p className="text-slate-500 text-xs mt-1">
                         Expires on {remainingDaysInfo.expirationDate.toLocaleDateString('en-US', { 
                           year: 'numeric', 
                           month: 'short', 
                           day: 'numeric' 
                         })}
                       </p>
                     )}
                   </div>
                 ) : (
                   <p className="text-slate-900 font-medium">N/A</p>
                 )}
               </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100">
               {paymentStatusMessage && (
                 <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
                   paymentStatusMessage.includes('✅') 
                     ? 'bg-green-50 text-green-700 border border-green-200' 
                     : paymentStatusMessage.includes('⏳')
                     ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                     : 'bg-slate-100 text-slate-700'
                 }`}>
                   {paymentStatusMessage.includes('✅') && <CheckCircle2 className="w-4 h-4" />}
                   {paymentStatusMessage}
                 </div>
               )}
               
               {!user.isPremium ? (
                 <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                       <div className="text-sm text-slate-600">
                         Unlock unlimited humanization and advanced detector bypass.
                       </div>
                       <Button onClick={onUpgrade} className="w-full sm:w-auto shadow-rose-500/20">
                         <Zap className="w-4 h-4 mr-2" /> Upgrade to Pro
                       </Button>
                    </div>
                    <div className="pt-2 border-t border-slate-200">
                       <Button 
                         variant="outline" 
                         onClick={handleCheckPaymentStatus}
                         disabled={isCheckingPayment}
                         className="w-full sm:w-auto text-xs"
                       >
                         <RefreshCw className={`w-3 h-3 mr-2 ${isCheckingPayment ? 'animate-spin' : ''}`} />
                         {isCheckingPayment ? 'Checking...' : 'Check Payment Status'}
                       </Button>
                    </div>
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
               <div className="overflow-x-auto">
                   <div className="divide-y divide-slate-100 min-w-[500px]">
                     {transactions.map((item) => (
                       <div key={item.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                          <div className="flex flex-col">
                            <span className="text-slate-900 font-medium">{item.date}</span>
                            <span className="text-slate-500 text-xs">{item.invoice}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-medium text-slate-900">{item.amount}</span>
                            <span className="px-2 py-1 rounded bg-green-50 text-green-700 text-xs font-bold uppercase">{item.status}</span>
                            <button 
                              onClick={() => handleDownloadInvoice(item)}
                              className="p-2 text-slate-400 hover:text-slate-700 hover:text-rose-600 transition-colors"
                              title="Download invoice"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                       </div>
                     ))}
                   </div>
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
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full sm:w-auto"
                      onClick={() => setShowChangePasswordModal(true)}
                    >
                      Change Password
                    </Button>
                </div>
           </div>

           {/* Admin Dashboard */}
           {onNavigateToAdmin && (
             <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
                   <ShieldCheck className="w-5 h-5 text-rose-500" /> Admin
                </h3>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
                    <div className="flex flex-col">
                        <span className="font-medium text-slate-900">Admin Dashboard</span>
                        <span className="text-slate-500 text-sm">Manage payment requests and approve Pro plans</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full sm:w-auto"
                      onClick={onNavigateToAdmin}
                    >
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      Open Admin Dashboard
                    </Button>
                </div>
           </div>
           )}

           {/* Delete Account */}
           <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden p-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
                   <Trash2 className="w-5 h-5 text-red-500" /> Danger Zone
                </h3>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
                    <div className="flex flex-col">
                        <span className="font-medium text-slate-900">Delete Account</span>
                        <span className="text-slate-500 text-sm">Permanently delete your account and all associated data</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full sm:w-auto border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                </div>
           </div>

           {/* Delete Account Modal */}
           <DeleteAccountModal
             isOpen={showDeleteModal}
             onClose={() => setShowDeleteModal(false)}
             onConfirm={async () => {
               await deleteAccount(user.id);
               setShowDeleteModal(false);
               onLogout();
             }}
             userEmail={user.email}
           />

           {/* Change Password Modal */}
           <ChangePassword
             isOpen={showChangePasswordModal}
             onClose={() => setShowChangePasswordModal(false)}
             userId={user.id}
             userEmail={user.email}
           />

        </div>
      </div>
    </div>
  );
};