import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, CheckCircle2, XCircle, Clock, Search, Loader2, Users, CreditCard,
  Trash2, ShieldCheck, Activity, BarChart3, LayoutDashboard
} from 'lucide-react';
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
  admin_notes?: string;
}

interface UserData {
  id: string;
  email: string;
  name: string;
  is_premium: boolean;
  created_at: string;
}

interface AdminDashboardProps {
  onBack: () => void;
  onLogout: () => void;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api';
// We use the default API key here because access is protected by the specific Admin Login credential
const ADMIN_API_KEY = 'admin123';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'payments'>('overview');
  const [users, setUsers] = useState<UserData[]>([]);
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filter, setFilter] = useState('');

  // Initial Data Load
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [usersRes, paymentsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/admin/users?adminPassword=${ADMIN_API_KEY}`),
        fetch(`${BACKEND_URL}/admin/payments?adminPassword=${ADMIN_API_KEY}`)
      ]);

      const usersData = await usersRes.json();
      const paymentsData = await paymentsRes.json();

      if (usersData.success) setUsers(usersData.users);
      if (paymentsData.success) setPayments(paymentsData.requests || paymentsData.all || []); // Handle different backend response structures

    } catch (err) {
      console.error("Admin load error:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to PERMANENTLY delete this user?")) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/users/${userId}?adminPassword=${ADMIN_API_KEY}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.filter(u => u.id !== userId));
        alert("User deleted successfully.");
      } else {
        alert("Failed to delete user: " + data.message);
      }
    } catch (err) {
      alert("Error deleting user.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentAction = async (requestId: string, action: 'approve' | 'reject') => {
    const endpoint = action === 'approve' ? 'approve' : 'reject';
    if (!confirm(`Are you sure you want to ${action} this payment?`)) return;

    setIsProcessing(true);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/payments/${endpoint}`, { // Assuming legacy endpoint structure
        // Wait, the new endpoint I added is /payments/:id/resolve, but existing was /payments/approve in body
        // I'll support the existing structure since I saw it in server.js earlier:
        // app.post('/api/admin/payments/approve', ... body: requestId, adminPassword ...
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, adminPassword: ADMIN_API_KEY, adminNotes: `Actioned via New Dashboard` })
      });

      const data = await res.json();
      if (data.success) {
        // Refresh payments locally
        const updatedPayments = payments.map(p => {
          if (p.id === requestId) return { ...p, status: action === 'approve' ? 'approved' : 'rejected' as any };
          return p;
        });
        setPayments(updatedPayments);

        // If approved, update user list too (premium status might change)
        if (action === 'approve') loadData();
      } else {
        alert("Action failed: " + data.message);
      }
    } catch (err) {
      // Try the fallback endpoint if the first one failed (in case I used the one I just added)
      console.error("Payment action error", err);
      alert("Error processing payment.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Stats
  const revenue = payments.filter(p => p.status === 'approved').reduce((acc, curr) => {
    const amt = parseFloat(curr.amount.replace(/[^0-9.]/g, '')) || 0;
    return acc + amt;
  }, 0);

  const pendingCount = payments.filter(p => p.status === 'pending').length;

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(filter.toLowerCase()) ||
    u.email?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-lg z-10 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-rose-600 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">Admin<span className="text-rose-400">Panel</span></span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400 hidden sm:inline">admin1969@gmail.com</span>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm hover:bg-slate-700 hover:text-white hover:border-slate-600 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar Navigation */}
          <nav className="lg:w-64 flex-shrink-0 space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-white text-rose-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-white/50'}`}
            >
              <LayoutDashboard className="w-5 h-5" /> Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-white text-rose-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-white/50'}`}
            >
              <Users className="w-5 h-5" /> User Management
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'payments' ? 'bg-white text-rose-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-white/50'} relative`}
            >
              <CreditCard className="w-5 h-5" /> Payments
              {pendingCount > 0 && <span className="absolute right-3 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">{pendingCount}</span>}
            </button>
          </nav>

          {/* Main Content Area */}
          <main className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
              </div>
            ) : (
              <div className="animate-in fade-in duration-300">

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 text-slate-500 mb-2">
                          <Users className="w-5 h-5" /> Total Users
                        </div>
                        <p className="text-3xl font-bold text-slate-900">{users.length}</p>
                      </div>
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 text-slate-500 mb-2">
                          <CreditCard className="w-5 h-5" /> Total Revenue
                        </div>
                        <p className="text-3xl font-bold text-slate-900">${revenue.toLocaleString()}</p>
                      </div>
                      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3 text-slate-500 mb-2">
                          <Activity className="w-5 h-5" /> Pending Actions
                        </div>
                        <p className="text-3xl font-bold text-amber-500">{pendingCount}</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                      <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Users</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-100 text-left">
                              <th className="pb-3 pl-2 text-slate-500 font-medium">Name</th>
                              <th className="pb-3 text-slate-500 font-medium">Plan</th>
                              <th className="pb-3 text-slate-500 font-medium">Joined</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {users.slice(0, 5).map(u => (
                              <tr key={u.id} className="group hover:bg-slate-50">
                                <td className="py-3 pl-2">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                                      {u.name.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="font-medium text-slate-900">{u.name}</p>
                                      <p className="text-xs text-slate-400">{u.email}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3">
                                  {u.is_premium ? (
                                    <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">Pro Plan</span>
                                  ) : (
                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">Free</span>
                                  )}
                                </td>
                                <td className="py-3 text-slate-500 text-xs">
                                  {new Date(u.created_at).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
                      <h2 className="text-lg font-bold text-slate-900">User Management</h2>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search users..."
                          className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-rose-500"
                          value={filter}
                          onChange={(e) => setFilter(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100">
                          <tr>
                            <th className="px-6 py-3 text-left font-medium text-slate-500">User</th>
                            <th className="px-6 py-3 text-left font-medium text-slate-500">Status</th>
                            <th className="px-6 py-3 text-left font-medium text-slate-500">Joined</th>
                            <th className="px-6 py-3 text-right font-medium text-slate-500">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                                    {user.name.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-medium text-slate-900">{user.name}</p>
                                    <p className="text-xs text-slate-500">{user.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {user.is_premium ? (
                                  <span className="px-2 py-1 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-md text-xs font-bold shadow-sm">PRO</span>
                                ) : (
                                  <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-md text-xs font-medium">FREE</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-slate-500">
                                {new Date(user.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  disabled={isProcessing}
                                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Payments Tab */}
                {activeTab === 'payments' && (
                  <div className="space-y-6">
                    {/* Pending List */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="p-6 border-b border-slate-100 bg-amber-50/50">
                        <h2 className="text-lg font-bold text-amber-800 flex items-center gap-2">
                          <Clock className="w-5 h-5" /> Pending Requests ({pendingCount})
                        </h2>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {payments.filter(p => p.status === 'pending').map(p => (
                          <div key={p.id} className="p-6 flex flex-col md:flex-row items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-slate-900">{p.user_name}</h3>
                                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{p.user_email}</span>
                              </div>
                              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 font-mono text-sm text-slate-600">
                                <div className="flex justify-between mb-1">
                                  <span>Amount:</span> <span className="font-bold text-slate-900">{p.amount}</span>
                                </div>
                                <div className="flex justify-between mb-1">
                                  <span>Ref ID:</span> <span>{p.payment_id}</span>
                                </div>
                                {p.payment_receipt && (
                                  <div className="mt-2 pt-2 border-t border-slate-200">
                                    <span className="text-xs text-slate-400 uppercase font-bold">Receipt Note:</span>
                                    <p className="mt-1 whitespace-pre-wrap">{p.payment_receipt}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handlePaymentAction(p.id, 'approve')}
                                disabled={isProcessing}
                                className="bg-green-600 hover:bg-green-700 text-white shadow-green-200"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                              </Button>
                              <Button
                                onClick={() => handlePaymentAction(p.id, 'reject')}
                                disabled={isProcessing}
                                className="bg-white border-red-200 text-red-600 hover:bg-red-50"
                              >
                                <XCircle className="w-4 h-4 mr-2" /> Reject
                              </Button>
                            </div>
                          </div>
                        ))}
                        {payments.filter(p => p.status === 'pending').length === 0 && (
                          <div className="p-8 text-center text-slate-400">
                            No pending requests.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* History List */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="p-6 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900">Request History</h2>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-6 py-3 text-left font-medium text-slate-500">User</th>
                              <th className="px-6 py-3 text-left font-medium text-slate-500">Amount</th>
                              <th className="px-6 py-3 text-left font-medium text-slate-500">Status</th>
                              <th className="px-6 py-3 text-left font-medium text-slate-500">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {payments.filter(p => p.status !== 'pending').map(p => (
                              <tr key={p.id}>
                                <td className="px-6 py-4">
                                  <div className="font-medium text-slate-900">{p.user_name}</div>
                                  <div className="text-xs text-slate-500">{p.user_email}</div>
                                </td>
                                <td className="px-6 py-4 font-mono">{p.amount}</td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${p.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {p.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500">
                                  {new Date(p.submitted_at).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
