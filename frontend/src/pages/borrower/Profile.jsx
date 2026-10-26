import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  ShieldCheck,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  LogOut,
  TrendingUp,
  RefreshCw,
  Building
} from 'lucide-react';
import BorrowerLayout from '../../components/layout/BorrowerLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export function formatINR(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
}

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    businessType: '',
    annualTurnover: 0,
    averageMonthlyIncome: 0,
    tier: 'Tier B-1 Seasonal Prime'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await api.getUserProfile();
        if (data) {
          setProfileData((prev) => ({
            ...prev,
            name: data.name || prev.name,
            email: data.email || prev.email,
            phone: data.phone || prev.phone,
            businessType: data.businessType || 'Salaried / Independent Professional',
            annualTurnover: data.annualTurnover || 1800000,
            averageMonthlyIncome: data.averageMonthlyIncome || 85000,
            tier: data.tier || prev.tier
          }));
        }
      } catch (err) {
        console.warn('Profile fetch notification:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ type: '', message: '' });

    try {
      const res = await api.updateUserProfile({
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        businessType: profileData.businessType,
        annualTurnover: Number(profileData.annualTurnover),
        averageMonthlyIncome: Number(profileData.averageMonthlyIncome)
      });

      updateUser({
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone
      });

      setSaving(false);
      setIsEditing(false);
      setFeedback({ type: 'success', message: 'Profile updated and synchronized successfully!' });
    } catch (err) {
      setSaving(false);
      setFeedback({ type: 'error', message: err.message || 'Failed to update profile.' });
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'CL';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <BorrowerLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '860px', margin: '0 auto' }}>
        {/* Header Breadcrumb */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#5B6B79', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Home</span>
            <span>/</span>
            <span style={{ color: '#173B57', fontWeight: '700' }}>Borrower Profile</span>
          </div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: '800',
              color: '#173B57',
              margin: '6px 0 8px 0',
              letterSpacing: '-0.02em'
            }}
          >
            Account &amp; Financial Profile
          </h1>
          <p style={{ fontSize: '14px', color: '#5B6B79', margin: 0, lineHeight: 1.5 }}>
            View and manage your verified credentials, contact details, and registered income profile.
          </p>
        </div>

        {feedback.message && (
          <div
            style={{
              backgroundColor: feedback.type === 'success' ? '#E8F5EE' : '#FEF3F2',
              border: `1px solid ${feedback.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
              borderRadius: '8px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '13px',
              color: feedback.type === 'success' ? '#18794E' : '#B42318'
            }}
          >
            {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Profile Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #DCE3EA',
            padding: '32px',
            boxShadow: '0 2px 12px rgba(23, 43, 58, 0.04)'
          }}
        >
          {/* Top Profile Summary */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '20px',
              paddingBottom: '24px',
              borderBottom: '1px solid #F1F4F8',
              marginBottom: '24px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#173B57',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  fontWeight: '800',
                  boxShadow: '0 3px 8px rgba(23, 59, 87, 0.2)'
                }}
              >
                {getInitials(profileData.name)}
              </div>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#173B57', margin: '0 0 4px' }}>
                  {profileData.name || 'Borrower Account'}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', color: '#5B6B79' }}>
                    {profileData.email || 'borrower@creditlens.io'}
                  </span>
                  <span style={{ fontSize: '11px', backgroundColor: '#E6F4F1', color: '#0F766E', padding: '2px 8px', borderRadius: '10px', fontWeight: '700' }}>
                    {profileData.tier}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  style={{
                    backgroundColor: '#173B57',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '9px 18px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#5B6B79',
                    border: '1px solid #DCE3EA',
                    borderRadius: '8px',
                    padding: '9px 18px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
              {/* Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#172B3A', marginBottom: '6px' }}>
                  Full Legal Name
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: '8px',
                      border: '1px solid #DCE3EA',
                      fontSize: '14px',
                      color: '#172B3A',
                      backgroundColor: isEditing ? '#FFFFFF' : '#F8FAFC',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <User size={16} color="#748391" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#172B3A', marginBottom: '6px' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    disabled={!isEditing}
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: '8px',
                      border: '1px solid #DCE3EA',
                      fontSize: '14px',
                      color: '#172B3A',
                      backgroundColor: isEditing ? '#FFFFFF' : '#F8FAFC',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <Mail size={16} color="#748391" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#172B3A', marginBottom: '6px' }}>
                  Phone Number
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: '8px',
                      border: '1px solid #DCE3EA',
                      fontSize: '14px',
                      color: '#172B3A',
                      backgroundColor: isEditing ? '#FFFFFF' : '#F8FAFC',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <Phone size={16} color="#748391" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              {/* Business / Occupation */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#172B3A', marginBottom: '6px' }}>
                  Profession / Business Archetype
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={profileData.businessType}
                    onChange={(e) => setProfileData({ ...profileData, businessType: e.target.value })}
                    placeholder="e.g. Retail Trader, Software Engineer"
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: '8px',
                      border: '1px solid #DCE3EA',
                      fontSize: '14px',
                      color: '#172B3A',
                      backgroundColor: isEditing ? '#FFFFFF' : '#F8FAFC',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <Briefcase size={16} color="#748391" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              {/* Monthly Income */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#172B3A', marginBottom: '6px' }}>
                  Average Monthly Income (₹)
                </label>
                <input
                  type="number"
                  disabled={!isEditing}
                  value={profileData.averageMonthlyIncome}
                  onChange={(e) => setProfileData({ ...profileData, averageMonthlyIncome: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #DCE3EA',
                    fontSize: '14px',
                    color: '#172B3A',
                    backgroundColor: isEditing ? '#FFFFFF' : '#F8FAFC',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Annual Turnover */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#172B3A', marginBottom: '6px' }}>
                  Annual Inflow / Turnover (₹)
                </label>
                <input
                  type="number"
                  disabled={!isEditing}
                  value={profileData.annualTurnover}
                  onChange={(e) => setProfileData({ ...profileData, annualTurnover: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #DCE3EA',
                    fontSize: '14px',
                    color: '#172B3A',
                    backgroundColor: isEditing ? '#FFFFFF' : '#F8FAFC',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Save Buttons */}
            {isEditing && (
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#5B6B79',
                    border: '1px solid #DCE3EA',
                    borderRadius: '8px',
                    padding: '10px 18px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    backgroundColor: '#173B57',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 22px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Save size={15} />
                  <span>{saving ? 'Saving changes...' : 'Save Profile'}</span>
                </button>
              </div>
            )}
          </form>

          {/* Account Security & Sign Out Section */}
          <div
            style={{
              marginTop: '32px',
              paddingTop: '24px',
              borderTop: '1px solid #F1F4F8',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#0F766E' }}>
              <ShieldCheck size={16} />
              <span>Session encrypted with 256-bit bank TLS token</span>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              style={{
                backgroundColor: '#FEF3F2',
                color: '#B42318',
                border: '1px solid #FECACA',
                borderRadius: '8px',
                padding: '9px 18px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background-color 0.15s ease'
              }}
            >
              <LogOut size={15} />
              <span>Sign Out of Account</span>
            </button>
          </div>
        </div>
      </div>
    </BorrowerLayout>
  );
}
