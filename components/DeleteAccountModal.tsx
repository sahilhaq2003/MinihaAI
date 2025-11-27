import React, { useState } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from './Button';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  userEmail?: string;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  userEmail 
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requiredText = 'delete';
  const isConfirmed = confirmText.toLowerCase().trim() === requiredText;

  const handleDelete = async () => {
    if (!isConfirmed) {
      setError(`Please type "${requiredText}" to confirm`);
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await onConfirm();
      // Modal will be closed by parent component after successful deletion
    } catch (err: any) {
      setError(err.message || 'Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmText('');
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-slate-100 scale-100 animate-in zoom-in-95 duration-200 relative">
        <button
          onClick={handleClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Delete Account</h2>
          <p className="text-slate-600 text-sm">
            This action cannot be undone. This will permanently delete your account and all associated data.
          </p>
        </div>

        {userEmail && (
          <div className="bg-slate-50 rounded-lg p-4 mb-4 border border-slate-200">
            <p className="text-sm text-slate-700">
              <strong>Account:</strong> {userEmail}
            </p>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Type <span className="font-mono font-bold text-red-600">"{requiredText}"</span> to confirm:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => {
              setConfirmText(e.target.value);
              setError(null);
            }}
            placeholder={requiredText}
            disabled={isDeleting}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            autoFocus
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        <div className="bg-red-50 rounded-lg p-4 mb-6 border border-red-200">
          <p className="text-xs text-red-700">
            <strong>Warning:</strong> This will permanently delete:
          </p>
          <ul className="text-xs text-red-700 mt-2 list-disc list-inside space-y-1">
            <li>Your account and profile information</li>
            <li>All your humanization history</li>
            <li>All your transactions and payment records</li>
            <li>All your payment requests</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="flex-1 bg-red-600 hover:bg-red-700 border-red-600"
            onClick={handleDelete}
            disabled={!isConfirmed || isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Account'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

