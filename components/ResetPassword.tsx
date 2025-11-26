import React, { useState, useEffect } from 'react';
import { Key, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { resetPassword, forgotPassword } from '../services/authService';
import { Button } from './Button';

interface ResetPasswordProps {
  onBack: () => void;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({ onBack }) => {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Get token and email from URL
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const urlEmail = params.get('email');
    
    if (urlToken && urlEmail) {
      setStep('reset');
      setEmail(urlEmail);
      setToken(urlToken);
    }
  }, []);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email address.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await forgotPassword(email);
      setMessage({ type: 'success', text: result.message });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to send reset email.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setMessage({ type: 'error', text: 'Please fill in all fields.' });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    if (!token || !email) {
      setMessage({ type: 'error', text: 'Invalid reset link.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await resetPassword(token, email, password);
      setMessage({ type: 'success', text: result.message });
      setTimeout(() => onBack(), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Password reset failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'request') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
          <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Key className="w-8 h-8 text-rose-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">Reset Password</h2>
          <p className="text-slate-500 mb-6 text-center text-sm">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-600' 
                : 'bg-red-50 text-red-600'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              {message.text}
            </div>
          )}

          <form onSubmit={handleRequestReset} className="space-y-4">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              required
            />
            <Button type="submit" isLoading={isLoading} className="w-full">
              Send Reset Link
            </Button>
          </form>

          <button 
            onClick={onBack}
            className="w-full mt-4 text-sm text-slate-500 hover:text-slate-800"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Key className="w-8 h-8 text-rose-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">Set New Password</h2>
        <p className="text-slate-500 mb-6 text-center text-sm">
          Enter your new password below.
        </p>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-600' 
              : 'bg-red-50 text-red-600'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            {message.text}
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            required
            minLength={6}
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            required
            minLength={6}
          />
          <Button type="submit" isLoading={isLoading} className="w-full">
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  );
};

