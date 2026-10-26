import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Layers,
  LayoutDashboard,
  FileText,
  ShieldCheck,
  Calculator,
  History,
  Settings as SettingsIcon,
  ChevronDown,
  LogOut,
  User,
  Menu,
  X,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function BankerNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const menuRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch pending review count from live backend
  useEffect(() => {
    let isMounted = true;
    async function loadPendingCount() {
      try {
        const res = await api.getApplications();
        const items = res.items || (Array.isArray(res) ? res : []);
        const pending = items.filter((a) => {
          const s = (a.status || a.reviewStatus || '').toLowerCase();
          return s.includes('review') || s.includes('pending') || s.includes('ready');
        }).length;
        if (isMounted) setPendingCount(pending);
      } catch (e) {
        // Fallback default
        if (isMounted) setPendingCount(2);
      }
    }
    loadPendingCount();
    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  const handleSignOut = () => {
    setProfileOpen(false);
    logout();
    navigate('/login');
  };

  // Determine current active banker sub-path
  const currentPath = location.pathname;
  const currentSearch = new URLSearchParams(location.search);
  const pageParam = currentSearch.get('page');

  const isLinkActive = (id, to) => {
    if (pageParam) {
      if (id === 'dashboard' && pageParam === 'dashboard') return true;
      if (id === 'applications' && pageParam === 'applications') return true;
      if (id === 'review' && (pageParam === 'review' || pageParam === 'assessment' || pageParam === 'applicant')) return true;
      if (id === 'simulator' && pageParam === 'simulator') return true;
      if (id === 'audit' && pageParam === 'audit') return true;
      return false;
    }
    if (id === 'dashboard') {
      return currentPath === '/banker' || currentPath === '/banker/' || currentPath === '/banker/dashboard';
    }
    return currentPath.startsWith(to);
  };

  const navLinks = [
    { id: 'dashboard', to: '/banker/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'applications', to: '/banker/applications', label: 'Applications', icon: FileText, badge: pendingCount > 0 ? pendingCount : null },
    { id: 'review', to: '/banker/review', label: 'Underwriting Review', icon: ShieldCheck },
    { id: 'simulator', to: '/banker/simulator', label: 'Loan Simulator', icon: Calculator },
    { id: 'audit', to: '/banker/audit', label: 'Audit Trail', icon: History }
  ];

  const getInitials = (name) => {
    if (!name) return 'DV';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header
      style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #DCE3EA',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(23, 43, 58, 0.04)'
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 20px',
          height: '68px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Left: Brand Logo & Portal Badge */}
        <Link
          to="/banker"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '9px',
              backgroundColor: '#173B57',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 2px 6px rgba(23, 59, 87, 0.2)'
            }}
          >
            <Layers size={20} strokeWidth={2.4} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: '800',
                  color: '#173B57',
                  letterSpacing: '-0.02em'
                }}
              >
                Credit<span style={{ color: '#0F766E' }}>Lens</span>
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  color: '#173B57',
                  backgroundColor: '#E8EDF2',
                  padding: '2px 7px',
                  borderRadius: '10px',
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase'
                }}
              >
                Banker Portal
              </span>
            </div>
            <span
              style={{
                fontSize: '11px',
                color: '#5B6B79',
                lineHeight: '1.2'
              }}
            >
              Institutional Underwriting Desk
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation Bar */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          className="cl-desktop-nav"
        >
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item.id, item.to);
            return (
              <Link
                key={item.id}
                to={item.to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: active ? '700' : '500',
                  color: active ? '#0F766E' : '#172B3A',
                  backgroundColor: active ? '#E6F4F1' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
              >
                <Icon size={16} strokeWidth={active ? 2.4 : 1.8} />
                <span>{item.label}</span>
                {item.badge != null && (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: '700',
                      backgroundColor: '#B54708',
                      color: '#FFFFFF',
                      borderRadius: '10px',
                      padding: '1px 6px',
                      lineHeight: '1.3'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Desk Status & Underwriter Profile Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Active Desk Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#F0FDF4',
              border: '1px solid #DCFCE7',
              borderRadius: '20px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: '600',
              color: '#166534'
            }}
            className="cl-status-pill"
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#22C55E',
                display: 'inline-block'
              }}
            />
            <span>Desk Online</span>
          </div>

          {/* Underwriter Profile Pill & Dropdown */}
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
              aria-label="Underwriter Account Menu"
              aria-expanded={profileOpen}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'none',
                border: '1px solid #DCE3EA',
                borderRadius: '30px',
                padding: '4px 10px 4px 4px',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease, background-color 0.15s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#0F766E')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#DCE3EA')}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#173B57',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '700',
                  letterSpacing: '0.02em'
                }}
              >
                {getInitials(user?.name || 'David Vance')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }} className="cl-user-name-label">
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#172B3A',
                    lineHeight: 1.1
                  }}
                >
                  {user?.name ? user.name.split(' ')[0] : 'David'}
                </span>
                <span style={{ fontSize: '10px', color: '#5B6B79' }}>Underwriter</span>
              </div>
              <ChevronDown
                size={14}
                color="#5B6B79"
                style={{
                  transform: profileOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease'
                }}
              />
            </button>

            {/* Profile Menu Dropdown */}
            {profileOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  width: '240px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #DCE3EA',
                  boxShadow: '0 8px 24px rgba(23, 43, 58, 0.12)',
                  padding: '8px 0',
                  zIndex: 200
                }}
              >
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #F0F4F8' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#173B57' }}>
                    {user?.name || 'David Vance'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#5B6B79', marginTop: '2px' }}>
                    {user?.email || 'd.vance@creditlens.bank'}
                  </div>
                  <div
                    style={{
                      display: 'inline-block',
                      marginTop: '6px',
                      fontSize: '10px',
                      fontWeight: '700',
                      color: '#0F766E',
                      backgroundColor: '#E6F4F1',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}
                  >
                    Senior Credit Officer (#301)
                  </div>
                </div>

                <div style={{ padding: '4px 0' }}>
                  <Link
                    to="/banker/settings"
                    onClick={() => setProfileOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 16px',
                      fontSize: '13px',
                      color: '#172B3A',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F6F8FB')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <SettingsIcon size={15} color="#5B6B79" />
                    <span>Underwriting Policies</span>
                  </Link>

                  <Link
                    to="/home"
                    onClick={() => setProfileOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 16px',
                      fontSize: '13px',
                      color: '#172B3A',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F6F8FB')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <ExternalLink size={15} color="#5B6B79" />
                    <span>View Borrower Portal</span>
                  </Link>
                </div>

                <div style={{ borderTop: '1px solid #F0F4F8', paddingTop: '4px' }}>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      padding: '8px 16px',
                      background: 'none',
                      border: 'none',
                      fontSize: '13px',
                      color: '#B42318',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FEF3F2')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <LogOut size={15} color="#B42318" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              padding: '6px',
              cursor: 'pointer',
              color: '#173B57'
            }}
            className="cl-mobile-menu-btn"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #DCE3EA',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
          className="cl-mobile-drawer"
        >
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item.id, item.to);
            return (
              <Link
                key={item.id}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: active ? '700' : '500',
                  color: active ? '#0F766E' : '#172B3A',
                  backgroundColor: active ? '#E6F4F1' : 'transparent',
                  textDecoration: 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
                {item.badge != null && (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      backgroundColor: '#B54708',
                      color: '#FFFFFF',
                      borderRadius: '10px',
                      padding: '2px 8px'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
          <div style={{ borderTop: '1px solid #E2E8F0', marginTop: '8px', paddingTop: '8px' }}>
            <button
              type="button"
              onClick={handleSignOut}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '10px 14px',
                background: 'none',
                border: 'none',
                color: '#B42318',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
