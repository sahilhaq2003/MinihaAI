import React, { useState, useEffect } from 'react';
import { Key, CheckCircle2, XCircle, Loader2, Smartphone, Mail } from 'lucide-react';
import { resetPassword, forgotPassword, verifyOTP } from '../services/authService';
import { Button } from './Button';

interface ResetPasswordProps {
  onBack: () => void;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({ onBack }) => {
  const [step, setStep] = useState<'request' | 'verify' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [useTwilioVerify, setUseTwilioVerify] = useState(false);

  useEffect(() => {
    // Get token and email from URL (for backward compatibility)
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const urlEmail = params.get('email');
    
    if (urlToken && urlEmail) {
      setStep('reset');
      setEmail(urlEmail);
      setToken(urlToken);
    }
  }, []);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email address.' });
      return;
    }

    if (!mobileNumber) {
      setMessage({ type: 'error', text: 'Please enter your mobile number.' });
      return;
    }

    // Validate mobile number format (must include country code with +)
    if (!mobileNumber.startsWith('+')) {
      setMessage({ type: 'error', text: 'Please include country code with + (e.g., +1234567890 for US, +919876543210 for India).' });
      return;
    }
    
    // Validate minimum length (country code + number, at least 8 digits after +)
    const digitsOnly = mobileNumber.substring(1).replace(/\D/g, '');
    if (digitsOnly.length < 8 || digitsOnly.length > 15) {
      setMessage({ type: 'error', text: 'Please enter a valid international mobile number (8-15 digits after country code).' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await forgotPassword(email, mobileNumber);
      setMessage({ type: 'success', text: result.message });
      setOtpSent(true);
      setStep('verify');
      setUseTwilioVerify(result.useTwilioVerify || false);
      
      // Show OTP in development mode (backend returns it in dev mode)
      if (result.otpCode) {
        console.log('🔐 OTP Code (Development only):', result.otpCode);
        setMessage({ 
          type: 'success', 
          text: `${result.message} OTP: ${result.otpCode} (Development mode only)` 
        });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to send OTP.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      setMessage({ type: 'error', text: 'Please enter the OTP code.' });
      return;
    }

    if (otpCode.length !== 6) {
      setMessage({ type: 'error', text: 'OTP must be 6 digits.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await verifyOTP(email, otpCode, mobileNumber, useTwilioVerify);
      if (result.resetToken) {
        setToken(result.resetToken);
        setStep('reset');
        setMessage({ type: 'success', text: 'OTP verified successfully. Please set your new password.' });
      } else {
        setMessage({ type: 'error', text: 'OTP verification failed.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Invalid or expired OTP code.' });
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
      setMessage({ type: 'error', text: 'Invalid reset token. Please request a new OTP.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await resetPassword(token, email, password, confirmPassword);
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
            Enter your email and mobile number to receive an OTP code.
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
              />
            </div>
            <div className="relative">
              <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="tel"
                placeholder="Mobile number with country code (e.g., +1234567890 or +919876543210)"
                value={mobileNumber}
                onChange={(e) => {
                  // Allow + and numbers only
                  let value = e.target.value;
                  // Keep + at the start if present
                  if (value.startsWith('+')) {
                    value = '+' + value.substring(1).replace(/\D/g, '');
                  } else {
                    value = value.replace(/\D/g, '');
                  }
                  setMobileNumber(value);
                }}
                maxLength={20}
                className="w-full px-4 py-3 pl-11 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                Include country code (e.g., +1 for US, +91 for India, +44 for UK)
              </p>
            </div>
            <Button type="submit" isLoading={isLoading} className="w-full">
              Send OTP
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

  if (step === 'verify') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
          <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Key className="w-8 h-8 text-rose-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">Verify OTP</h2>
          <p className="text-slate-500 mb-6 text-center text-sm">
            Enter the 6-digit OTP code sent to your mobile number.
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

          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otpCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6); // Only numbers, max 6 digits
                  setOtpCode(value);
                }}
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                required
              />
            </div>
            <Button type="submit" isLoading={isLoading} className="w-full">
              Verify OTP
            </Button>
            <button 
              type="button"
              onClick={() => {
                setStep('request');
                setOtpCode('');
                setMessage(null);
              }}
              className="w-full mt-2 text-sm text-slate-500 hover:text-slate-800"
            >
              Change mobile number
            </button>
          </form>
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

