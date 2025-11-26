import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Mail, Loader2 } from 'lucide-react';
import { verifyEmail, resendVerificationEmail } from '../services/authService';
import { Button } from './Button';

interface VerifyEmailProps {
  onBack: () => void;
}

export const VerifyEmail: React.FC<VerifyEmailProps> = ({ onBack }) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // Get token and email from URL
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const urlEmail = params.get('email');
    
    setToken(urlToken);
    setEmail(urlEmail);

  useEffect(() => {
    if (!token || !email) {
      setStatus('error');
      setMessage('Invalid verification link. Please check your email.');
      return;
    }

    const verify = async () => {
      try {
        const result = await verifyEmail(token, email);
        if (result.success) {
          setStatus('success');
          setMessage('Email verified successfully! You can now log in.');
          setTimeout(() => onBack(), 3000);
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Verification failed. The link may have expired.');
      }
    };

    verify();
  }, [token, email, navigate]);

  const handleResend = async () => {
    if (!email) return;
    
    setResending(true);
    try {
      await resendVerificationEmail(email);
      setMessage('Verification email sent! Please check your inbox.');
    } catch (err: any) {
      setMessage(err.message || 'Failed to resend email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-rose-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Verifying Email...</h2>
            <p className="text-slate-500">Please wait while we verify your email address.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Email Verified!</h2>
            <p className="text-slate-500 mb-6">{message}</p>
            <Button onClick={onBack}>Go to Login</Button>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Verification Failed</h2>
            <p className="text-slate-500 mb-6">{message}</p>
            {email && (
              <div className="space-y-3">
                <Button onClick={handleResend} disabled={resending}>
                  {resending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                  ) : (
                    <><Mail className="w-4 h-4 mr-2" /> Resend Verification Email</>
                  )}
                </Button>
                <Button variant="outline" onClick={onBack}>
                  Back to Home
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

