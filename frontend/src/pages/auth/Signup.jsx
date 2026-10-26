import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  User,
  Mail,
  Phone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full legal name is required';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'Please enter your complete legal name';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[+0-9\s\-()]{8,20}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) return;

    setIsLoading(true);
    const result = await register({
      name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: 'borrower'
    });
    setIsLoading(false);

    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login', {
          state: { message: 'Registration successful! You may now sign in.' }
        });
      }, 1500);
    } else {
      setApiError(result.error);
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
          maxWidth: '460px',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #DCE3EA',
          boxShadow: '0 4px 20px rgba(23, 43, 58, 0.06)',
          padding: '36px 32px'
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
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
            Create Your Account
          </h1>
          <p style={{ fontSize: '13px', color: '#5B6B79', margin: 0 }}>
            Join CreditLens to understand your loan creditworthiness with complete transparency.
          </p>
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
              padding: '12px 14px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '13px',
              color: '#18794E',
              fontWeight: '600'
            }}
          >
            <CheckCircle2 size={20} color="#18794E" />
            <span>Account registered successfully! Redirecting to sign in...</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div style={{ marginBottom: '14px' }}>
            <label
              htmlFor="fullName"
              style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#172B3A', marginBottom: '6px' }}
            >
              Full Legal Name
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="e.g. Priya Sharma"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: '8px',
                  border: `1px solid ${errors.fullName ? '#B42318' : '#DCE3EA'}`,
                  fontSize: '14px',
                  color: '#172B3A',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <User size={16} color="#748391" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            {errors.fullName && <span style={{ fontSize: '12px', color: '#B42318', marginTop: '4px', display: 'block' }}>{errors.fullName}</span>}
          </div>

          {/* Email */}
          <div style={{ marginBottom: '14px' }}>
            <label
              htmlFor="email"
              style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#172B3A', marginBottom: '6px' }}
            >
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: '8px',
                  border: `1px solid ${errors.email ? '#B42318' : '#DCE3EA'}`,
                  fontSize: '14px',
                  color: '#172B3A',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <Mail size={16} color="#748391" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            {errors.email && <span style={{ fontSize: '12px', color: '#B42318', marginTop: '4px', display: 'block' }}>{errors.email}</span>}
          </div>

          {/* Phone Number */}
          <div style={{ marginBottom: '14px' }}>
            <label
              htmlFor="phone"
              style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#172B3A', marginBottom: '6px' }}
            >
              Phone Number
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: '8px',
                  border: `1px solid ${errors.phone ? '#B42318' : '#DCE3EA'}`,
                  fontSize: '14px',
                  color: '#172B3A',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <Phone size={16} color="#748391" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            {errors.phone && <span style={{ fontSize: '12px', color: '#B42318', marginTop: '4px', display: 'block' }}>{errors.phone}</span>}
          </div>

          {/* Password */}
          <div style={{ marginBottom: '14px' }}>
            <label
              htmlFor="password"
              style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#172B3A', marginBottom: '6px' }}
            >
              Password (min. 8 characters)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                style={{
                  width: '100%',
                  padding: '10px 40px 10px 36px',
                  borderRadius: '8px',
                  border: `1px solid ${errors.password ? '#B42318' : '#DCE3EA'}`,
                  fontSize: '14px',
                  color: '#172B3A',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <Lock size={16} color="#748391" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
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
                  padding: '4px'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span style={{ fontSize: '12px', color: '#B42318', marginTop: '4px', display: 'block' }}>{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="confirmPassword"
              style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#172B3A', marginBottom: '6px' }}
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: `1px solid ${errors.confirmPassword ? '#B42318' : '#DCE3EA'}`,
                fontSize: '14px',
                color: '#172B3A',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            {errors.confirmPassword && <span style={{ fontSize: '12px', color: '#B42318', marginTop: '4px', display: 'block' }}>{errors.confirmPassword}</span>}
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
              transition: 'background-color 0.15s ease'
            }}
          >
            {isLoading ? <span>Registering account...</span> : (
              <>
                <span>Complete Registration</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Link to Login */}
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: '#5B6B79' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#0F766E', fontWeight: '700', textDecoration: 'none' }}>
            Sign in here
          </Link>
        </div>
      </div>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#748391', textAlign: 'center', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <ShieldCheck size={14} color="#0F766E" />
        <span>Your data is protected under banking confidentiality standards</span>
      </div>
    </div>
  );
}
