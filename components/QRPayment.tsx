import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Loader2, QrCode, Copy, Upload, FileText, Smartphone, Building2 } from 'lucide-react';
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
  const [mobileNumber, setMobileNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Generate payment ID and QR code data
  useEffect(() => {
    if (isOpen) {
      const id = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      setPaymentId(id);
      
      // Generate QR code with bank account details in a format readable by banking apps
      // Format: Structured bank transfer details that can be scanned by mobile banking apps
      const bankDetails = `BANK TRANSFER DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bank Name: Peoples Bank
Branch: Kolonawa Branch
Account Number: 194 2 002 8 0021843
Amount: ${amount}
Reference: ${id}
Description: MinihaAI Pro Plan Payment

Payment ID: ${id}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
After payment, submit your Payment ID and Mobile Number on the payment page.`;
      
      setQrCodeData(bankDetails);
      setPaymentStatus('pending');
      setSubmitError(null);
      setSubmitSuccess(false);
      setSubmittedPaymentId('');
      setMobileNumber('');
    }
  }, [isOpen, amount, userId]);

  const handleSubmitPayment = async () => {
    if (!submittedPaymentId.trim()) {
      setSubmitError('Please enter your payment transaction ID');
      return;
    }

    if (!mobileNumber.trim()) {
      setSubmitError('Please enter your mobile number');
      return;
    }

    if (mobileNumber.length < 10) {
      setSubmitError('Please enter a valid mobile number');
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
          paymentReceipt: mobileNumber, // Store mobile number in receipt field
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6 lg:p-8 border border-slate-100 scale-100 animate-in zoom-in-95 duration-200 relative my-4 max-h-[95vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-slate-400 hover:text-slate-600 transition-colors z-10 bg-white rounded-full p-1 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-rose-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <QrCode className="w-6 h-6 sm:w-8 sm:h-8 text-rose-600" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1 sm:mb-2">Scan to Pay</h2>
          <p className="text-slate-500 text-xs sm:text-sm">Scan the QR code with your payment app</p>
        </div>

        {paymentStatus === 'pending' && (
          <>
            {/* QR Code Section */}
            <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-xl p-4 sm:p-6 mb-4 flex flex-col items-center justify-center border-2 border-dashed border-rose-200">
              {qrCodeData ? (
                <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm mb-3">
                  <img
                    src={generateQRCodeSVG(qrCodeData)}
                    alt="Payment QR Code"
                    className="w-48 h-48 sm:w-64 sm:h-64"
                  />
                </div>
              ) : (
                <Loader2 className="w-16 h-16 text-slate-300 animate-spin" />
              )}
              <p className="text-xs sm:text-sm text-slate-600 text-center mt-2">
                Scan with your banking app or mobile payment app
              </p>
            </div>

            {/* Payment Details Card */}
            <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-xl p-4 sm:p-5 mb-4 border border-rose-200 shadow-sm">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700">Amount:</span>
                  <span className="text-xl sm:text-2xl font-bold text-rose-600">{amount}</span>
                </div>
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <span className="text-sm font-medium text-slate-700">Payment ID:</span>
                  <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-rose-200">
                    <span className="text-xs sm:text-sm font-mono text-slate-700 break-all">{paymentId}</span>
                    <button
                      onClick={copyPaymentId}
                      className="p-1 hover:bg-rose-100 rounded transition-colors flex-shrink-0"
                      title="Copy Payment ID"
                    >
                      <Copy className={`w-4 h-4 ${copied ? 'text-green-600' : 'text-slate-500'}`} />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Bank Account Details */}
              <div className="mt-4 pt-4 border-t border-rose-200">
                <div className="flex items-start gap-2 mb-3">
                  <Building2 className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-700 mb-1">Bank Account Details:</p>
                    <div className="bg-white rounded-lg p-3 border border-rose-100 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-600">Bank:</span>
                        <span className="text-xs font-semibold text-slate-900">Peoples Bank</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-600">Branch:</span>
                        <span className="text-xs font-semibold text-slate-900">Kolonawa Branch</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-600">Account Number:</span>
                        <span className="text-xs font-mono font-semibold text-slate-900">194 2 002 8 0021843</span>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('194 2 002 8 0021843');
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="w-full mt-2 text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center justify-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        Copy Account Number
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Submission Form */}
            <div className="bg-blue-50 rounded-xl p-4 sm:p-5 mb-4 border border-blue-200 shadow-sm">
              <h3 className="text-sm sm:text-base font-bold text-blue-900 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                After Payment - Submit Details
              </h3>
              <p className="text-xs sm:text-sm text-blue-700 mb-4 leading-relaxed">
                After making the payment, please enter your payment transaction ID and mobile number below. Our admin will verify and activate your Pro plan within 24 hours.
              </p>
              
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    Payment Transaction ID / Reference Number *
                  </label>
                  <input
                    type="text"
                    value={submittedPaymentId}
                    onChange={(e) => setSubmittedPaymentId(e.target.value)}
                    placeholder="Enter your payment transaction ID"
                    className="w-full px-4 py-2.5 text-sm sm:text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all bg-white"
                  />
                  <p className="text-xs text-slate-500 mt-1">This is the reference number from your bank transaction</p>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5" />
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ''); // Only numbers
                      setMobileNumber(value);
                    }}
                    placeholder="Enter your mobile number"
                    maxLength={15}
                    className="w-full px-4 py-2.5 text-sm sm:text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all bg-white"
                  />
                  <p className="text-xs text-slate-500 mt-1">We'll contact you if needed for verification</p>
                </div>
              </div>

              {submitError && (
                <div className="mt-3 p-3 bg-red-50 text-red-600 text-xs sm:text-sm rounded-lg border border-red-200">
                  {submitError}
                </div>
              )}

              <Button
                variant="primary"
                className="w-full mt-4 py-3 text-sm sm:text-base font-semibold"
                onClick={handleSubmitPayment}
                disabled={isSubmitting || !submittedPaymentId.trim() || !mobileNumber.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Submit Payment Details
                  </>
                )}
              </Button>
            </div>

            <Button
              variant="ghost"
              className="w-full mt-2"
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

