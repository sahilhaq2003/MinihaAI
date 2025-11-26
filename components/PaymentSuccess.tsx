import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { verifyPayment } from '../services/authService';
import { Button } from './Button';

interface PaymentSuccessProps {
  onPaymentSuccess: () => void;
  onBack: () => void;
}

export const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ onPaymentSuccess, onBack }) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Get session_id from URL
    const params = new URLSearchParams(window.location.search);
    const urlSessionId = params.get('session_id');
    setSessionId(urlSessionId);

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setMessage('Invalid payment session.');
      return;
    }

    const verify = async () => {
      try {
        const result = await verifyPayment(sessionId);
        if (result.success) {
          setStatus('success');
          setMessage('Payment successful! Your account has been upgraded to Pro.');
          onPaymentSuccess();
          setTimeout(() => onBack(), 3000);
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Payment verification failed.');
      }
    };

    verify();
  }, [sessionId, navigate, onPaymentSuccess]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-rose-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Processing Payment...</h2>
            <p className="text-slate-500">Please wait while we verify your payment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h2>
            <p className="text-slate-500 mb-6">{message}</p>
            <Button onClick={onBack}>Continue to App</Button>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Failed</h2>
            <p className="text-slate-500 mb-6">{message}</p>
            <div className="space-y-3">
              <Button onClick={() => window.location.href = '/#pricing'}>Try Again</Button>
              <Button variant="outline" onClick={onBack}>
                Back to Home
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

