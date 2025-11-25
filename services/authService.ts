import { UserProfile, Transaction } from "../types";

// Configuration
const MOCK_DELAY = 800;
// ENABLE REAL BACKEND
// Set this to FALSE for the demo environment so it uses LocalStorage instead of crashing
// Set this to TRUE only if you are running 'node server.js' locally
const USE_REAL_BACKEND = false; 
const BACKEND_URL = 'http://localhost:3001/api';

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