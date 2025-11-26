import React, { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from './Button';

interface PaymentSuccessProps {
  onPaymentSuccess: () => void;
  onBack: () => void;
}

export const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ onPaymentSuccess, onBack }) => {
  useEffect(() => {
    // Payment is already processed, just confirm success
    onPaymentSuccess();
    // Auto-redirect after 3 seconds
    const timer = setTimeout(() => onBack(), 3000);
    return () => clearTimeout(timer);
  }, [onPaymentSuccess, onBack]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h2>
        <p className="text-slate-500 mb-6">Your account has been upgraded to Pro. Redirecting...</p>
        <Button onClick={onBack}>Continue to App</Button>
      </div>
    </div>
  );
};

