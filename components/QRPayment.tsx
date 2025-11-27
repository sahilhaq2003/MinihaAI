import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Loader2, QrCode, Copy, Upload, FileText } from 'lucide-react';
import { Button } from './Button';

interface QRPaymentProps {
  isOpen: boolean;
  onClose: () => void;
  amount: string;
  userId: string;
  onPaymentSuccess: () => void;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api';

export const QRPayment: React.FC<QRPaymentProps> = ({ isOpen, onClose, amount, userId, onPaymentSuccess }) => {
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [paymentId, setPaymentId] = useState<string>('');
  const [isChecking, setIsChecking] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'submitted' | 'success' | 'failed'>('pending');
  const [copied, setCopied] = useState(false);
  const [submittedPaymentId, setSubmittedPaymentId] = useState('');
  const [paymentReceipt, setPaymentReceipt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Generate payment ID and QR code data
  useEffect(() => {
    if (isOpen) {
      const id = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      setPaymentId(id);
      
      // Generate QR code with payment instructions
      // Include bank details, UPI ID, or payment instructions
      const paymentInstructions = `MinihaAI Pro Plan Payment
Amount: ${amount}
Payment ID: ${id}
UPI: minihaai@paytm
Bank: [Your Bank Details]
Account: [Your Account Number]
IFSC: [Your IFSC Code]

After payment, submit your payment ID on this page.`;
      
      setQrCodeData(paymentInstructions);
      setPaymentStatus('pending');
      setSubmitError(null);
      setSubmitSuccess(false);
      setSubmittedPaymentId('');
      setPaymentReceipt('');
    }
  }, [isOpen, amount, userId]);

  const handleSubmitPayment = async () => {
    if (!submittedPaymentId.trim()) {
      setSubmitError('Please enter your payment ID');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/payment/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          paymentId: submittedPaymentId,
          paymentReceipt: paymentReceipt,
          amount: amount
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSubmitSuccess(true);
        setPaymentStatus('submitted');
        // Don't close modal - let user know to wait for admin approval
      } else {
        setSubmitError(data.message || 'Failed to submit payment');
      }
    } catch (error: any) {
      setSubmitError('Failed to submit payment. Please try again.');
      console.error('Submit payment error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyPaymentId = () => {
    navigator.clipboard.writeText(paymentId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateQRCodeSVG = (data: string): string => {
    // Generate QR code using a free QR code API service
    // In production, you can use a library like 'qrcode.react' or generate on backend
    // For now, using a reliable QR code API
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}&bgcolor=ffffff&color=000000&margin=1`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 border border-slate-100 scale-100 animate-in zoom-in-95 duration-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <QrCode className="w-8 h-8 text-rose-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Scan to Pay</h2>
          <p className="text-slate-500 text-sm">Scan the QR code with your payment app</p>
        </div>

        {paymentStatus === 'pending' && (
          <>
            <div className="bg-slate-50 rounded-xl p-6 mb-4 flex items-center justify-center border-2 border-dashed border-slate-200">
              {qrCodeData ? (
                <img
                  src={generateQRCodeSVG(qrCodeData)}
                  alt="Payment QR Code"
                  className="w-64 h-64"
                />
              ) : (
                <Loader2 className="w-16 h-16 text-slate-300 animate-spin" />
              )}
            </div>

            <div className="bg-rose-50 rounded-lg p-4 mb-4 border border-rose-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">Amount:</span>
                <span className="text-lg font-bold text-rose-600">{amount}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">Payment ID:</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-600">{paymentId}</span>
                  <button
                    onClick={copyPaymentId}
                    className="p-1 hover:bg-rose-100 rounded transition-colors"
                    title="Copy Payment ID"
                  >
                    <Copy className={`w-3.5 h-3.5 ${copied ? 'text-green-600' : 'text-slate-500'}`} />
                  </button>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-rose-200">
                <p className="text-xs text-slate-600 mb-1"><strong>Payment Methods:</strong></p>
                <p className="text-xs text-slate-600">UPI: minihaai@paytm</p>
                <p className="text-xs text-slate-600">Bank Transfer: [Your Bank Details]</p>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-100">
              <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                After Payment - Submit Your Payment ID
              </h3>
              <p className="text-xs text-blue-700 mb-3">
                After making the payment, enter your payment transaction ID or reference number below. Admin will verify and activate your Pro plan.
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Payment Transaction ID / Reference Number *
                  </label>
                  <input
                    type="text"
                    value={submittedPaymentId}
                    onChange={(e) => setSubmittedPaymentId(e.target.value)}
                    placeholder="Enter your payment transaction ID"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Payment Receipt (Optional)
                  </label>
                  <textarea
                    value={paymentReceipt}
                    onChange={(e) => setPaymentReceipt(e.target.value)}
                    placeholder="Paste receipt details or screenshot URL (optional)"
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              </div>

              {submitError && (
                <div className="mt-3 p-2 bg-red-50 text-red-600 text-xs rounded border border-red-200">
                  {submitError}
                </div>
              )}

              <Button
                variant="primary"
                className="w-full mt-3"
                onClick={handleSubmitPayment}
                disabled={isSubmitting || !submittedPaymentId.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Submit Payment
                  </>
                )}
              </Button>
            </div>

            <Button
              variant="ghost"
              className="w-full"
              onClick={onClose}
            >
              Cancel
            </Button>
          </>
        )}

        {paymentStatus === 'submitted' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Payment Submitted!</h3>
            <p className="text-slate-600 mb-4">
              Your payment request has been submitted successfully. Our admin will review and activate your Pro plan within 24 hours.
            </p>
            <p className="text-xs text-slate-500 mb-4">
              Payment ID: <span className="font-mono">{submittedPaymentId}</span>
            </p>
            <Button
              variant="primary"
              className="w-full"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        )}

        {paymentStatus === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Payment Successful!</h3>
            <p className="text-slate-600 mb-4">Your Pro plan subscription is now active.</p>
            <Button
              variant="primary"
              className="w-full"
              onClick={() => {
                onPaymentSuccess();
                onClose();
              }}
            >
              Continue
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

