import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Layers,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('borrower'); // 'borrower' | 'banker'
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    setIsLoading(true);
    const result = await login({ email, password, role });
    setIsLoading(false);

    if (result.success) {
      setIsSuccess(true);
      const destination =
        result.user.role === 'banker'
          ? '/banker'
          : location.state?.from?.pathname || '/home';

      setTimeout(() => {
        navigate(destination, { replace: true });
      }, 500);
    } else {
      setApiError(result.error);
    }
  };

  const handleQuickDemo = (demoRole) => {
    if (demoRole === 'banker') {
      setEmail('d.vance@creditlens.bank');
      setPassword('SeniorUnderwriter#301');
      setRole('banker');
    } else {
      setEmail('rajesh.kumar@creditlens.in');
      setPassword('BorrowerSecure#2026');
      setRole('borrower');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F6F8FB',
        fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        padding: '24px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #DCE3EA',
          boxShadow: '0 4px 20px rgba(23, 43, 58, 0.06)',
          padding: '36px 32px'
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#173B57',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
              boxShadow: '0 3px 8px rgba(23, 59, 87, 0.25)'
            }}
          >
            <Layers size={24} strokeWidth={2.4} />
          </div>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: '800',
              color: '#173B57',
              margin: '0 0 6px 0',
              letterSpacing: '-0.02em'
            }}
          >
            Credit<span style={{ color: '#0F766E' }}>Lens</span>
          </h1>
          <p style={{ fontSize: '13px', color: '#5B6B79', margin: 0, lineHeight: 1.4 }}>
            Understand your creditworthiness. See the reasons.
          </p>
        </div>

        {/* Portal Role Switcher Tabs */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#F1F4F8',
            borderRadius: '8px',
            padding: '4px',
            marginBottom: '20px'
          }}
        >
          <button
            type="button"
            onClick={() => setRole('borrower')}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: role === 'borrower' ? '700' : '500',
              backgroundColor: role === 'borrower' ? '#FFFFFF' : 'transparent',
              color: role === 'borrower' ? '#173B57' : '#5B6B79',
              boxShadow: role === 'borrower' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Borrower Portal
          </button>
          <button
            type="button"
            onClick={() => setRole('banker')}
            style={{
              flex: 1,
              padding: '8px',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: role === 'banker' ? '700' : '500',
              backgroundColor: role === 'banker' ? '#FFFFFF' : 'transparent',
              color: role === 'banker' ? '#173B57' : '#5B6B79',
              boxShadow: role === 'banker' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Banker Portal
          </button>
        </div>

        {/* API Error Alert */}
        {apiError && (
          <div
            style={{
              backgroundColor: '#FEF3F2',
              border: '1px solid #FECACA',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '13px',
              color: '#B42318'
            }}
          >
            <AlertCircle size={18} color="#B42318" style={{ flexShrink: 0 }} />
            <span>{apiError}</span>
          </div>
        )}

        {/* Success Alert */}
        {isSuccess && (
          <div
            style={{
              backgroundColor: '#E8F5EE',
              border: '1px solid #BBF7D0',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '13px',
              color: '#18794E',
              fontWeight: '600'
            }}
          >
            <CheckCircle2 size={18} color="#18794E" />
            <span>Authenticated successfully. Redirecting...</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#172B3A',
                marginBottom: '6px'
              }}
            >
              {role === 'banker' ? 'Banker Workstation Email' : 'Email Address'}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: null });
              }}
              placeholder={role === 'banker' ? 'officer@creditlens.bank' : 'name@example.com'}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: `1px solid ${errors.email ? '#B42318' : '#DCE3EA'}`,
                fontSize: '14px',
                color: '#172B3A',
                backgroundColor: '#FFFFFF',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s ease'
              }}
              onFocus={(e) => (e.target.style.borderColor = '#0F766E')}
              onBlur={(e) => (e.target.style.borderColor = errors.email ? '#B42318' : '#DCE3EA')}
              required
            />
            {errors.email && (
              <span style={{ fontSize: '12px', color: '#B42318', marginTop: '4px', display: 'block' }}>
                {errors.email}
              </span>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label
                htmlFor="password"
                style={{ fontSize: '13px', fontWeight: '600', color: '#172B3A' }}
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0F766E',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Forgot password?
              </button>
            </div>

            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: null });
                }}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '10px 40px 10px 12px',
                  borderRadius: '8px',
                  border: `1px solid ${errors.password ? '#B42318' : '#DCE3EA'}`,
                  fontSize: '14px',
                  color: '#172B3A',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s ease'
                }}
                onFocus={(e) => (e.target.style.borderColor = '#0F766E')}
                onBlur={(e) => (e.target.style.borderColor = errors.password ? '#B42318' : '#DCE3EA')}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#748391',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <span style={{ fontSize: '12px', color: '#B42318', marginTop: '4px', display: 'block' }}>
                {errors.password}
              </span>
            )}
          </div>

          {/* Remember Me */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}
          >
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                color: '#5B6B79'
              }}
            >
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: '#0F766E' }}
              />
              <span>Remember this session</span>
            </label>
            <span style={{ fontSize: '11px', color: '#0F766E', fontWeight: '600' }}>
              <Lock size={11} style={{ display: 'inline', marginRight: '3px' }} />
              256-bit SSL
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || isSuccess}
            style={{
              width: '100%',
              backgroundColor: '#173B57',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isLoading || isSuccess ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: isLoading ? 0.8 : 1,
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={(e) => !isLoading && (e.target.style.backgroundColor = '#102E45')}
            onMouseLeave={(e) => !isLoading && (e.target.style.backgroundColor = '#173B57')}
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In as {role === 'banker' ? 'Banker' : 'Borrower'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Login Helpers */}
        <div
          style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid #F1F4F8',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '11px', color: '#748391', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase' }}>
            Quick Demo Autofill
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => handleQuickDemo('borrower')}
              style={{
                backgroundColor: '#E6F4F1',
                color: '#0F766E',
                border: '1px solid #99EFE5',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Demo Borrower
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('banker')}
              style={{
                backgroundColor: '#F1F5F9',
                color: '#173B57',
                border: '1px solid #DCE3EA',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Demo Underwriter
            </button>
          </div>
        </div>

        {/* Link to Signup */}
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: '#5B6B79' }}>
          Don't have an account yet?{' '}
          <Link
            to="/signup"
            style={{ color: '#0F766E', fontWeight: '700', textDecoration: 'none' }}
          >
            Sign up now
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(23, 43, 58, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 1000
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
              textAlign: 'center'
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#173B57', margin: '0 0 10px' }}>
              Password Reset Notice
            </h3>
            <p style={{ fontSize: '13px', color: '#5B6B79', lineHeight: 1.5, marginBottom: '20px' }}>
              In accordance with banking security protocols, password recovery for authorized accounts is managed directly through branch administrators. Please contact your loan advisor or support desk.
            </p>
            <button
              type="button"
              onClick={() => setShowForgotPassword(false)}
              style={{
                backgroundColor: '#173B57',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 18px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Security Footer Notice */}
      <div
        style={{
          marginTop: '24px',
          fontSize: '12px',
          color: '#748391',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        <ShieldCheck size={14} color="#0F766E" />
        <span>FCRA &amp; ECOA Compliant System • Zero Demographic Bias</span>
      </div>
    </div>
  );
}
