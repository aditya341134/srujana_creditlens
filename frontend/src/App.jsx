import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Borrower Pages
import Home from './pages/borrower/Home';
import Knowledge from './pages/borrower/Knowledge';
import LoanApplication from './pages/borrower/LoanApplication';
import Review from './pages/borrower/Review';
import Other from './pages/borrower/Other';
import Profile from './pages/borrower/Profile';

// Banker Portal
import BankerPortal from './pages/banker/BankerPortal';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CreditLens Application caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F6F8FB',
            fontFamily: "'Inter', system-ui, sans-serif",
            padding: '24px'
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #DCE3EA',
              padding: '36px',
              maxWidth: '520px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#FFF4D6',
                color: '#925D00',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '22px',
                fontWeight: '700'
              }}
            >
              !
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#173B57', margin: '0 0 8px' }}>
              Notice: Display State Reset
            </h2>
            <p style={{ fontSize: '13px', color: '#5B6B79', lineHeight: 1.5, marginBottom: '20px' }}>
              A temporary display error was encountered while rendering this component. Your session and underlying banking data are intact.
            </p>
            {this.state.error?.message && (
              <div
                style={{
                  fontSize: '11px',
                  color: '#B42318',
                  backgroundColor: '#FEF3F2',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  marginBottom: '20px',
                  fontFamily: 'monospace',
                  textAlign: 'left'
                }}
              >
                {this.state.error.message}
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/home';
              }}
              style={{
                backgroundColor: '#173B57',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 22px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Return to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function RootRedirect() {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'banker') {
    return <Navigate to="/banker" replace />;
  }

  return <Navigate to="/home" replace />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Root Dispatcher */}
            <Route path="/" element={<RootRedirect />} />

            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/register" element={<Signup />} />

            {/* Authenticated Borrower Routes */}
            <Route
              path="/home"
              element={
                <ProtectedRoute allowedRole="borrower">
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/knowledge"
              element={
                <ProtectedRoute allowedRole="borrower">
                  <Knowledge />
                </ProtectedRoute>
              }
            />
            <Route
              path="/loan"
              element={
                <ProtectedRoute allowedRole="borrower">
                  <LoanApplication />
                </ProtectedRoute>
              }
            />
            <Route
              path="/review"
              element={
                <ProtectedRoute allowedRole="borrower">
                  <Review />
                </ProtectedRoute>
              }
            />
            <Route
              path="/other"
              element={
                <ProtectedRoute allowedRole="borrower">
                  <Other />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRole="borrower">
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Authenticated Banker Routes */}
            <Route
              path="/banker/*"
              element={
                <ProtectedRoute allowedRole="banker">
                  <BankerPortal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/banker"
              element={
                <ProtectedRoute allowedRole="banker">
                  <BankerPortal />
                </ProtectedRoute>
              }
            />

            {/* 404 Catch-All Route */}
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
