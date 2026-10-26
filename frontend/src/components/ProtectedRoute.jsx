import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRole }) {
  const { isAuthenticated, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F6F8FB',
          color: '#173B57',
          fontFamily: "'Inter', system-ui, sans-serif"
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid #DCE3EA',
            borderTopColor: '#0F766E',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            marginBottom: '16px'
          }}
        />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <span style={{ fontSize: '14px', fontWeight: '600' }}>Validating secure session...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole && role !== allowedRole) {
    if (role === 'banker') {
      return <Navigate to="/banker" replace />;
    }
    return <Navigate to="/home" replace />;
  }

  return children;
}
