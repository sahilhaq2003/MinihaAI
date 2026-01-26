import React, { useState } from 'react';
import { Key, X, CheckCircle2, XCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { changePassword } from '../services/authService';
import { Button } from './Button';

interface ChangePasswordProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
}

export const ChangePassword: React.FC<ChangePasswordProps> = ({ 
  isOpen, 
  onClose, 
  userId,
  userEmail 
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChanging, setIsChanging] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Please fill in all fields.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    if (currentPassword === newPassword) {
      setMessage({ type: 'error', text: 'New password must be different from current password.' });
      return;
    }

    setIsChanging(true);
    setMessage(null);

    try {
      const result = await changePassword(userId, currentPassword, newPassword);
      setMessage({ type: 'success', text: result.message });
      
      // Clear form and close modal after 2 seconds
      setTimeout(() => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setMessage(null);
        onClose();
      }, 2000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to change password. Please try again.' });
    } finally {
      setIsChanging(false);
    }
  };

  const handleClose = () => {
    if (!isChanging) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-slate-100 scale-100 animate-in zoom-in-95 duration-200 relative">
        <button
          onClick={handleClose}
          disabled={isChanging}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Key className="w-8 h-8 text-rose-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Change Password</h2>
          <p className="text-slate-600 text-sm">
            Update your account password. Make sure it's strong and secure.
          </p>
        </div>

        {userEmail && (
          <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-200">
            <p className="text-sm text-slate-700">
              <strong>Account:</strong> {userEmail}
            </p>
          </div>
        )}

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-600 border border-green-200' 
              : 'bg-red-50 text-red-600 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            {message.text}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  setMessage(null);
                }}
                placeholder="Enter current password"
                disabled={isChanging}
                className="w-full px-4 py-3 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 disabled:opacity-50 disabled:cursor-not-allowed"
                autoFocus
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                disabled={isChanging}
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setMessage(null);
                }}
                placeholder="Enter new password (min 6 characters)"
                disabled={isChanging}
                className="w-full px-4 py-3 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 disabled:opacity-50 disabled:cursor-not-allowed"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                disabled={isChanging}
              >
                {showNewPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setMessage(null);
                }}
                placeholder="Confirm new password"
                disabled={isChanging}
                className="w-full px-4 py-3 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 disabled:opacity-50 disabled:cursor-not-allowed"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                disabled={isChanging}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              type="button"
              className="flex-1"
              onClick={handleClose}
              disabled={isChanging}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              className="flex-1"
              disabled={isChanging}
              isLoading={isChanging}
            >
              {isChanging ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Changing...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

