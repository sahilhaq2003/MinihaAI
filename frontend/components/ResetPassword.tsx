import React, { useState } from 'react';
import { Key, CheckCircle2, XCircle, Mail, Lock, ArrowLeft } from 'lucide-react';
import { resetPassword, forgotPassword } from '../services/authService';
import { Button } from './Button';

interface ResetPasswordProps {
  onBack: () => void;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({ onBack }) => {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleRequestOTP = async (e: React.FormEvent) => {
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
      setStep('reset');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to send OTP.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpCode || !password || !confirmPassword) {
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

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await resetPassword(otpCode, email, password);
      setMessage({ type: 'success', text: result.message });
      setTimeout(() => onBack(), 3000); // Go back to login after success
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Password reset failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Request OTP
  if (step === 'request') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Key className="w-8 h-8 text-rose-600" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">Reset Password</h2>
          <p className="text-slate-500 mb-6 text-center text-sm">
            Enter your email to receive a 6-digit verification code.
          </p>

          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
              }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {message.text}
            </div>
          )}

          <form onSubmit={handleRequestOTP} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 pl-11 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                required
                autoFocus
              />
            </div>
            <Button type="submit" isLoading={isLoading} className="w-full">
              Send OTP Code
            </Button>
          </form>

          <button onClick={onBack} className="w-full mt-4 text-sm text-slate-500 hover:text-slate-800 flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Enter OTP & New Password
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Key className="w-8 h-8 text-rose-600" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">Set New Password</h2>
        <p className="text-slate-500 mb-6 text-center text-sm">
          Enter the code sent to <strong>{email}</strong> and your new password.
        </p>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 px-2 bg-slate-100 rounded text-xs font-bold text-slate-600">OTP</div>
            <input
              type="text"
              placeholder="Enter 6-digit Code"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              className="w-full px-4 py-3 pl-14 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 tracking-widest font-mono"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pl-11 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              required
              minLength={6}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 pl-11 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              required
              minLength={6}
            />
          </div>

          <Button type="submit" isLoading={isLoading} className="w-full">
            Reset Password
          </Button>

          <button
            type="button"
            onClick={() => setStep('request')}
            className="w-full text-center text-sm text-slate-400 hover:text-slate-600 mt-2"
          >
            Change Email
          </button>
        </form>
      </div>
    </div>
  );
};
