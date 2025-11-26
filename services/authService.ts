
import { UserProfile, Transaction } from "../types";

// Configuration
const MOCK_DELAY = 800;

// Set to true to use the real SQLite backend server
const USE_REAL_BACKEND = true; 

// Use environment variable for production, fallback to localhost for development
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api';

// Helper for local storage simulation (Fallback)
const getLocalUsers = () => {
  const users = localStorage.getItem('miniha_users_db');
  return users ? JSON.parse(users) : {};
};

const saveLocalUser = (email: string, userData: any) => {
  const users = getLocalUsers();
  users[email] = userData;
  localStorage.setItem('miniha_users_db', JSON.stringify(users));
};

export const loginWithGoogle = async (token?: string): Promise<UserProfile> => {
  if (USE_REAL_BACKEND && token) {
    try {
        const response = await fetch(`${BACKEND_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });
        
        const data = await response.json();
        if (!data.success) throw new Error(data.message);
        
        return data.user;
    } catch (error) {
        console.error("Backend login failed:", error);
        throw error; // Re-throw to UI
    }
  }

  // --- MOCK BACKEND SIMULATION (Fallback) ---
  return new Promise((resolve) => {
    setTimeout(() => {
        resolve({
            id: "user_" + Date.now(),
            name: "Demo User",
            email: "user@example.com",
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`,
            isPremium: false
        });
    }, MOCK_DELAY);
  });
};

export const signupWithEmail = async (email: string, password: string): Promise<UserProfile> => {
    if (USE_REAL_BACKEND) {
        try {
            const response = await fetch(`${BACKEND_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.message || "Signup failed");
            return data.user;
        } catch (error) {
            console.error("Backend signup error:", error);
            throw error;
        }
    }

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = getLocalUsers();
            if (users[email]) {
                reject(new Error("User already exists with this email."));
                return;
            }

            const newUser = {
                id: "user_" + Date.now(),
                name: email.split('@')[0], // Default name from email
                email: email,
                password: password, 
                isPremium: false,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
            };

            saveLocalUser(email, newUser);

            // Return profile (without password)
            const { password: _, ...profile } = newUser;
            resolve(profile);
        }, MOCK_DELAY);
    });
};

export const loginWithEmail = async (email: string, password: string): Promise<UserProfile> => {
    if (USE_REAL_BACKEND) {
        try {
            const response = await fetch(`${BACKEND_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            // Handle email verification required
            if (response.status === 403 && data.requiresVerification) {
                throw new Error(data.message || "Please verify your email address before logging in.");
            }
            
            if (!data.success) throw new Error(data.message || "Login failed");
            return data.user;
        } catch (error) {
            console.error("Backend login error:", error);
            throw error;
        }
    }

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = getLocalUsers();
            const user = users[email];

            if (!user) {
                reject(new Error("User not found. Please sign up first."));
                return;
            }

            if (user.password !== password) {
                reject(new Error("Invalid password."));
                return;
            }

            // Return profile (without password)
            const { password: _, ...profile } = user;
            resolve(profile);
        }, MOCK_DELAY);
    });
};

export const getBillingHistory = async (userId: string): Promise<Transaction[]> => {
    if (USE_REAL_BACKEND) {
        try {
            const response = await fetch(`${BACKEND_URL}/user/${userId}/transactions`);
            const data = await response.json();
            if (!data.success) return [];
            return data.transactions;
        } catch (error) {
            console.error("Error fetching billing history:", error);
            return [];
        }
    }

    // Mock Data for Demo
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { id: 'tx_1', date: 'Oct 24, 2024', amount: '$19.00', status: 'Paid', invoice: '#INV-2024-001' },
                { id: 'tx_2', date: 'Sep 24, 2024', amount: '$19.00', status: 'Paid', invoice: '#INV-2024-002' },
            ]);
        }, 500);
    });
}

export const logoutUser = async (): Promise<void> => {
    // Simulate server-side session cleanup
    return new Promise(resolve => setTimeout(resolve, 500));
};

// Process payment (free simulation - no payment processor needed)
export const processPayment = async (userId: string, amount: string): Promise<{ success: boolean; user?: any; transaction?: Transaction }> => {
    if (USE_REAL_BACKEND) {
        try {
            const response = await fetch(`${BACKEND_URL}/payment/process`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, amount })
            });

            const data = await response.json();
            if (!data.success) throw new Error(data.message || "Payment processing failed");
            
            return data;
        } catch (error) {
            console.error("Payment processing error:", error);
            throw error;
        }
    }

    // Mock for demo
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                user: { id: userId, isPremium: true },
                transaction: {
                    id: 'mock_' + Date.now(),
                    user_id: userId,
                    amount: amount,
                    status: 'Paid',
                    date: new Date().toISOString(),
                    invoice_id: '#INV-MOCK',
                    plan_type: 'Pro Plan'
                }
            });
        }, 1500);
    });
};

// Verify email
export const verifyEmail = async (token: string, email: string): Promise<{ success: boolean; message: string }> => {
    if (USE_REAL_BACKEND) {
        try {
            const response = await fetch(`${BACKEND_URL}/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`);
            const data = await response.json();
            if (!data.success) throw new Error(data.message || "Email verification failed");
            return data;
        } catch (error) {
            console.error("Email verification error:", error);
            throw error;
        }
    }
    return { success: true, message: "Email verified" };
};

// Resend verification email
export const resendVerificationEmail = async (email: string): Promise<{ success: boolean; message: string }> => {
    if (USE_REAL_BACKEND) {
        try {
            const response = await fetch(`${BACKEND_URL}/auth/resend-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.message || "Failed to resend verification email");
            return data;
        } catch (error) {
            console.error("Resend verification error:", error);
            throw error;
        }
    }
    return { success: true, message: "Verification email sent" };
};

// Request password reset
export const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    if (USE_REAL_BACKEND) {
        try {
            const response = await fetch(`${BACKEND_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.message || "Failed to send reset email");
            return data;
        } catch (error) {
            console.error("Forgot password error:", error);
            throw error;
        }
    }
    return { success: true, message: "Reset email sent" };
};

// Reset password with token
export const resetPassword = async (token: string, email: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    if (USE_REAL_BACKEND) {
        try {
            const response = await fetch(`${BACKEND_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, email, newPassword })
            });
            const data = await response.json();
            if (!data.success) throw new Error(data.message || "Password reset failed");
            return data;
        } catch (error) {
            console.error("Reset password error:", error);
            throw error;
        }
    }
    return { success: true, message: "Password reset successful" };
};
