import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, Clock, Search, Loader2, Eye } from 'lucide-react';
import { Button } from './Button';

interface PaymentRequest {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  amount: string;
  payment_id: string;
  payment_receipt: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  admin_notes?: string;
}

interface AdminDashboardProps {
  onBack: () => void;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pendingPayments, setPendingPayments] = useState<PaymentRequest[]>([]);
  const [allPayments, setAllPayments] = useState<PaymentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLogin = async () => {
    if (!adminPassword.trim()) {
      setError('Please enter admin password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/admin/payments?adminPassword=${encodeURIComponent(adminPassword)}`);
      const data = await response.json();

      if (data.success) {
        setIsAuthenticated(true);
        setPendingPayments(data.pending || []);
        setAllPayments(data.all || []);
      } else {
        setError('Invalid admin password');
      }
    } catch (err: any) {
      setError('Failed to authenticate. Please try again.');
      console.error('Admin login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPayments = async () => {
    if (!adminPassword) return;

    try {
      const response = await fetch(`${BACKEND_URL}/admin/payments?adminPassword=${encodeURIComponent(adminPassword)}`);
      const data = await response.json();

      if (data.success) {
        setPendingPayments(data.pending || []);
        setAllPayments(data.all || []);
      }
    } catch (err) {
      console.error('Refresh error:', err);
    }
  };

  const handleApprove = async (paymentId: string) => {
    if (!confirm('Are you sure you want to approve this payment?')) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/admin/payments/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: paymentId,
          adminPassword: adminPassword,
          adminNotes: adminNotes
        })
      });

      const data = await response.json();

      if (data.success) {
        await refreshPayments();
        setSelectedPayment(null);
        setAdminNotes('');
        alert('Payment approved! User has been upgraded to Pro plan.');
      } else {
        setError(data.message || 'Failed to approve payment');
      }
    } catch (err: any) {
      setError('Failed to approve payment. Please try again.');
      console.error('Approve error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (paymentId: string) => {
    if (!confirm('Are you sure you want to reject this payment?')) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/admin/payments/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: paymentId,
          adminPassword: adminPassword,
          adminNotes: adminNotes
        })
      });

      const data = await response.json();

      if (data.success) {
        await refreshPayments();
        setSelectedPayment(null);
        setAdminNotes('');
        alert('Payment rejected.');
      } else {
        setError(data.message || 'Failed to reject payment');
      }
    } catch (err: any) {
      setError('Failed to reject payment. Please try again.');
      console.error('Reject error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full border border-slate-200">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
            <p className="text-slate-500 text-sm">Enter admin password to access</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>
            <Button
              variant="primary"
              className="w-full"
              onClick={handleLogin}
              isLoading={isLoading}
            >
              Login
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={onBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
            <p className="text-slate-500">Manage payment requests and approve Pro plan upgrades</p>
          </div>
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-900">Pending</h3>
            </div>
            <p className="text-3xl font-extrabold text-amber-600">{pendingPayments.length}</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <h3 className="font-bold text-slate-900">Approved</h3>
            </div>
            <p className="text-3xl font-extrabold text-green-600">
              {allPayments.filter(p => p.status === 'approved').length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-slate-900">Rejected</h3>
            </div>
            <p className="text-3xl font-extrabold text-red-600">
              {allPayments.filter(p => p.status === 'rejected').length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Pending Payment Requests</h2>
          </div>
          <div className="p-6">
            {pendingPayments.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Clock className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>No pending payment requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="border border-slate-200 rounded-lg p-4 hover:border-rose-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900">{payment.user_name || payment.user_email}</h3>
                          <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                            Pending
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">{payment.user_email}</p>
                        <p className="text-sm text-slate-500">User ID: {payment.user_id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-rose-600">{payment.amount}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(payment.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-3 mb-3">
                      <p className="text-xs font-medium text-slate-700 mb-1">Payment ID:</p>
                      <p className="text-sm font-mono text-slate-900">{payment.payment_id}</p>
                      {payment.payment_receipt && (
                        <>
                          <p className="text-xs font-medium text-slate-700 mb-1 mt-2">Receipt:</p>
                          <p className="text-xs text-slate-600 whitespace-pre-wrap">{payment.payment_receipt}</p>
                        </>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApprove(payment.id)}
                        disabled={isProcessing}
                        className="flex-1"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(payment.id)}
                        disabled={isProcessing}
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">All Payment Requests</h2>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left p-3 font-semibold text-slate-700">User</th>
                    <th className="text-left p-3 font-semibold text-slate-700">Amount</th>
                    <th className="text-left p-3 font-semibold text-slate-700">Payment ID</th>
                    <th className="text-left p-3 font-semibold text-slate-700">Status</th>
                    <th className="text-left p-3 font-semibold text-slate-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {allPayments.map((payment) => (
                    <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3">
                        <div>
                          <p className="font-medium text-slate-900">{payment.user_name || 'N/A'}</p>
                          <p className="text-xs text-slate-500">{payment.user_email}</p>
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-slate-900">{payment.amount}</td>
                      <td className="p-3">
                        <code className="text-xs bg-slate-100 px-2 py-1 rounded">{payment.payment_id}</code>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'approved' ? 'bg-green-100 text-green-700' :
                          payment.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 text-xs">
                        {new Date(payment.submitted_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

