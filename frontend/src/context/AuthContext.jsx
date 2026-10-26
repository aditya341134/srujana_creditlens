import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const STORAGE_KEY_TOKEN = 'creditlens_auth_token';
const STORAGE_KEY_USER = 'creditlens_auth_user';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY_TOKEN) || null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial verification of stored session
    const verifySession = async () => {
      const storedToken = localStorage.getItem(STORAGE_KEY_TOKEN);
      if (storedToken) {
        try {
          // If profile endpoint is available, fetch latest profile
          const profile = await api.getUserProfile().catch(() => null);
          if (profile && user?.role !== 'banker') {
            setUser((prev) => ({
              ...prev,
              name: profile.name || prev?.name || 'Borrower',
              email: profile.email || prev?.email,
              phone: profile.phone || prev?.phone,
              tier: profile.tier || prev?.tier,
              businessType: profile.businessType || prev?.businessType,
              averageMonthlyIncome: profile.averageMonthlyIncome || prev?.averageMonthlyIncome
            }));
          }
        } catch (e) {
          console.warn('[CreditLens Auth] Session sync notice:', e.message);
        }
      }
      setIsLoading(false);
    };

    verifySession();
  }, []);

  const login = async (credentials) => {
    try {
      const res = await api.login(credentials);
      if (res && res.token) {
        localStorage.setItem(STORAGE_KEY_TOKEN, res.token);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
        return { success: true, user: res.user };
      }
      throw new Error('Invalid response from authentication server.');
    } catch (err) {
      return { success: false, error: err.message || 'Login failed. Please check your credentials.' };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.register(userData);
      return { success: true, data: res };
    } catch (err) {
      return { success: false, error: err.message || 'Registration failed. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedFields };
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(merged));
      return merged;
    });
  };

  const role = user?.role === 'banker' ? 'banker' : 'borrower';
  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
