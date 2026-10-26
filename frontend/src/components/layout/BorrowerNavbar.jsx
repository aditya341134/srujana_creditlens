import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Compass,
  BookOpen,
  FileText,
  BarChart3,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function BorrowerNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const handleSignOut = () => {
    setProfileOpen(false);
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/home', label: 'Home', icon: Compass },
    { to: '/knowledge', label: 'Knowledge', icon: BookOpen },
    { to: '/loan', label: 'Loan', icon: FileText },
    { to: '/review', label: 'Review', icon: BarChart3 },
    { to: '/other', label: 'Other', icon: HelpCircle }
  ];

  const getInitials = (name) => {
    if (!name) return 'CL';
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
        {/* Left: Brand Logo & Tagline */}
        <Link
          to="/home"
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                  color: '#0F766E',
                  backgroundColor: '#E6F4F1',
                  padding: '1px 6px',
                  borderRadius: '10px'
                }}
              >
                Borrower
              </span>
            </div>
            <span
              style={{
                fontSize: '11px',
                color: '#5B6B79',
                lineHeight: '1.2',
                display: 'none',
                maxWidth: '240px'
              }}
              className="cl-brand-sub"
            >
              Fair &amp; Explainable Assessment
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
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `cl-nav-link ${isActive ? 'active' : ''}`
                }
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? '#0F766E' : '#172B3A',
                  backgroundColor: isActive ? '#E6F4F1' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease'
                })}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right: Profile Avatar & Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
              aria-label="User Account Menu"
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
                {getInitials(user?.name)}
              </div>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#172B3A',
                  maxWidth: '120px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                className="cl-user-name-label"
              >
                {user?.name ? user.name.split(' ')[0] : 'Profile'}
              </span>
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
                  top: '46px',
                  right: 0,
                  width: '260px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #DCE3EA',
                  boxShadow: '0 8px 24px rgba(23, 43, 58, 0.12)',
                  padding: '16px',
                  zIndex: 200,
                  animation: 'fadeIn 0.15s ease-out'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    paddingBottom: '12px',
                    borderBottom: '1px solid #F1F4F8',
                    marginBottom: '10px'
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#173B57',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: '700'
                    }}
                  >
                    {getInitials(user?.name)}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        color: '#172B3A',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {user?.name || 'Borrower'}
                    </span>
                    <span
                      style={{
                        fontSize: '12px',
                        color: '#5B6B79',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {user?.email || 'borrower@creditlens.io'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      color: '#172B3A',
                      fontSize: '13px',
                      fontWeight: '500',
                      textDecoration: 'none',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F1F4F8')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <User size={15} color="#0F766E" />
                    <span>View Profile</span>
                  </Link>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      fontSize: '11px',
                      color: '#0F766E',
                      backgroundColor: '#E6F4F1',
                      borderRadius: '6px',
                      margin: '4px 0'
                    }}
                  >
                    <ShieldCheck size={14} />
                    <span>Verified Borrower Account</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      color: '#B42318',
                      fontSize: '13px',
                      fontWeight: '600',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      transition: 'background-color 0.15s ease'
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
            className="cl-mobile-toggle"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle Navigation Menu"
            style={{
              display: 'none',
              background: 'none',
              border: '1px solid #DCE3EA',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              color: '#173B57'
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          style={{
            borderTop: '1px solid #DCE3EA',
            backgroundColor: '#FFFFFF',
            padding: '12px 20px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
          className="cl-mobile-menu"
        >
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: isActive ? '700' : '500',
                  color: isActive ? '#0F766E' : '#172B3A',
                  backgroundColor: isActive ? '#E6F4F1' : 'transparent',
                  textDecoration: 'none'
                })}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
          <NavLink
            to="/profile"
            onClick={() => setMobileMenuOpen(false)}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: isActive ? '700' : '500',
              color: isActive ? '#0F766E' : '#172B3A',
              backgroundColor: isActive ? '#E6F4F1' : 'transparent',
              textDecoration: 'none'
            })}
          >
            <User size={18} />
            <span>Profile</span>
          </NavLink>
        </div>
      )}

      {/* Inline styles for responsive visibility */}
      <style>{`
        @media (max-width: 768px) {
          .cl-desktop-nav {
            display: none !important;
          }
          .cl-mobile-toggle {
            display: flex !important;
          }
          .cl-user-name-label {
            display: none !important;
          }
        }
        @media (min-width: 900px) {
          .cl-brand-sub {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
}
