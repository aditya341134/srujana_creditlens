import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FilePlus,
  UserCheck,
  Award,
  Sliders,
  HelpCircle,
  LogOut,
  Bell,
  Menu,
  X,
  ShieldCheck,
  Lock,
  Layers,
  ChevronDown,
  Calendar,
  Sparkles,
  FileCheck2,
  Printer,
  Users,
  Search,
  Phone,
  Mail
} from 'lucide-react';
import { SYNTHETIC_PERSONAS, BORROWER_STORAGE_KEY } from '../pages/user/userPortalState';
import { ScrollProgress } from './ScrollProgress';
import { BackToTop } from './BackToTop';
import { CookieConsent } from './CookieConsent';
import { WebsiteSearchModal } from './WebsiteSearchModal';
import { FloatingContact } from './FloatingContact';
import { TransparencyFAQModal } from './TransparencyFAQModal';
import { ConfirmationModal } from './ConfirmationModal';
import { CopyButton } from './CopyButton';
import './userPortal.css';

export function UserPortalLayout({
  activePage = 'dashboard',
  onNavigate,
  user = {
    name: 'Rajesh Kumar & Elena Vance',
    id: 'CL-84091',
    tier: 'Tier B-1 Seasonal Prime',
    lastSyncTime: '12 minutes ago',
    email: 'rajesh.elena@artisanoven.com',
    phone: '(415) 892-4412'
  },
  toastMessage,
  children
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  // Global Ctrl+K / Cmd+K shortcut listener for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 10 Borrower Frontend Modules
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/user/dashboard',
      badge: null
    },
    {
      id: 'seasonal-intelligence',
      label: 'Seasonal Cashflow',
      icon: Calendar,
      path: '/user/seasonal-intelligence',
      badge: 'Core Demo',
      badgeClass: 'cl-nav-badge-teal'
    },
    {
      id: 'financial-profile',
      label: 'Financial Profile',
      icon: UserCheck,
      path: '/user/financial-profile',
      badge: null
    },
    {
      id: 'my-assessment',
      label: 'Credit Assessment',
      icon: Award,
      path: '/user/my-assessment',
      badge: 'Explainable',
      badgeClass: 'cl-nav-badge-blue'
    },
    {
      id: 'loan-simulator',
      label: 'Loan Simulator',
      icon: Sliders,
      path: '/user/loan-simulator',
      badge: 'Compare'
    },
    {
      id: 'document-evidence',
      label: 'Evidence & Documents',
      icon: ShieldCheck,
      path: '/user/document-evidence',
      badge: null
    },
    {
      id: 'readiness-copilot',
      label: 'Readiness Copilot',
      icon: Sparkles,
      path: '/user/readiness-copilot',
      badge: 'AI Guide',
      badgeClass: 'cl-nav-badge-teal'
    },
    {
      id: 'credit-decision',
      label: 'Credit Decision',
      icon: FileCheck2,
      path: '/user/credit-decision',
      badge: null
    },
    {
      id: 'financial-report',
      label: 'Borrower Report',
      icon: Printer,
      path: '/user/financial-report',
      badge: 'PDF',
      badgeClass: 'cl-nav-badge-neutral'
    },
    {
      id: 'loan-application',
      label: 'Loan Request',
      icon: FilePlus,
      path: '/user/loan-application',
      badge: null
    }
  ];

  const handleNavClick = (itemId, itemPath) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(itemId, itemPath);
    } else {
      window.location.hash = itemId;
    }
  };

  const getPageTitle = (id) => {
    switch (id) {
      case 'dashboard':
        return 'Applicant Overview';
      case 'seasonal-intelligence':
        return 'Seasonal Income Intelligence';
      case 'loan-application':
        return 'New Loan Application';
      case 'financial-profile':
        return 'Financial Profile & Records';
      case 'my-assessment':
        return 'Explainable Credit Assessment';
      case 'loan-simulator':
        return 'Interactive Loan Simulator & Scenarios';
      case 'document-evidence':
        return 'Evidence & Document Management';
      case 'readiness-copilot':
        return 'Credit Readiness Copilot';
      case 'credit-decision':
        return 'Understand My Credit Decision';
      case 'financial-report':
        return 'Borrower Financial & Solvency Report';
      default:
        return 'User Portal';
    }
  };

  const handleSwitchPersona = (personaKey) => {
    try {
      const target = SYNTHETIC_PERSONAS[personaKey];
      if (target) {
        localStorage.setItem(
          BORROWER_STORAGE_KEY,
          JSON.stringify({ activePersonaId: personaKey, data: target })
        );
        setPersonaMenuOpen(false);
        window.location.reload();
      }
    } catch {
      // fallback
    }
  };

  const handleExecuteReset = () => {
    try {
      localStorage.removeItem(BORROWER_STORAGE_KEY);
      localStorage.removeItem('creditlens_borrower_state_v2');
      localStorage.removeItem('creditlens_borrower_state_v5');
    } catch {
      // ignore
    }
    setResetConfirmOpen(false);
    window.location.hash = 'dashboard';
    window.location.reload();
  };

  return (
    <div className="creditlens-portal-root">
      {/* Scroll Progress Bar at the top of the viewport */}
      <ScrollProgress />

      {/* Skip to Main Content Accessibility Link */}
      <a href="#main-content" className="cl-skip-link">
        Skip to main content
      </a>

      {/* Sidebar Navigation */}
      <aside className={`cl-sidebar ${mobileMenuOpen ? 'open' : ''}`} aria-label="Main Navigation">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Clickable Logo & Brand Header */}
          <button
            type="button"
            onClick={() => handleNavClick('dashboard')}
            className="cl-sidebar-brand"
            style={{
              background: 'none',
              border: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              padding: '24px 20px 20px',
              display: 'block',
              width: '100%'
            }}
            title="Return to CreditLens Dashboard"
          >
            <div className="cl-brand-logo-row">
              <div className="cl-brand-icon-box">
                <Layers size={18} strokeWidth={2.4} />
              </div>
              <span className="cl-brand-name">CreditLens</span>
            </div>
            <span className="cl-brand-tagline">Fair &amp; Explainable Credit</span>
          </button>

          {/* Quick Search Trigger in Sidebar */}
          <div style={{ padding: '0 16px 12px' }}>
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                background: '#F1F5F9',
                border: '1px solid #DCE3EA',
                borderRadius: '8px',
                color: '#5B6B79',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
              title="Search modules and tools (Ctrl+K)"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Search size={14} color="#0F766E" />
                <span>Search portal...</span>
              </div>
              <kbd style={{ fontSize: '10px', background: '#FFFFFF', border: '1px solid #DCE3EA', borderRadius: '4px', padding: '1px 5px' }}>
                Ctrl+K
              </kbd>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="cl-nav-menu" aria-label="Borrower Portal Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id, item.path)}
                  className={`cl-nav-item ${isActive ? 'active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="cl-nav-item-left">
                    <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`cl-nav-badge ${item.badgeClass || ''}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with FCRA & Help Link */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid #DCE3EA',
            fontSize: '11px',
            color: '#748391',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0F766E' }}></span>
            <span>FCRA &amp; ECOA Compliant</span>
          </div>
          <button
            type="button"
            onClick={() => setFaqModalOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: '#0F766E',
              fontWeight: '600',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px'
            }}
          >
            <HelpCircle size={12} />
            <span>Borrower Rights &amp; FAQ</span>
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="cl-main-wrapper">
        {/* Sticky Top Header Bar */}
        <header className="cl-top-header" role="banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              type="button"
              className="cl-mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <div className="cl-header-breadcrumb">
              <button
                type="button"
                onClick={() => handleNavClick('dashboard')}
                className="cl-breadcrumb-portal"
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', font: 'inherit', color: 'inherit' }}
                title="Go to overview"
              >
                Borrower Portal
              </button>
              <span className="cl-breadcrumb-separator">/</span>
              <span className="cl-breadcrumb-current">{getPageTitle(activePage)}</span>
            </div>
          </div>

          <div className="cl-header-right">
            {/* Header Search Button */}
            <button
              type="button"
              onClick={() => setSearchModalOpen(true)}
              className="cl-btn-icon"
              title="Search modules and topics (Ctrl+K)"
              aria-label="Search website"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Search size={18} />
            </button>

            {/* Interactive Persona Demo Switcher */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setPersonaMenuOpen(!personaMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#E6F4F1',
                  border: '1px solid #99EFE5',
                  color: '#0F766E',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
                title="Switch demonstration persona"
              >
                <Users size={14} />
                <span>Persona: {user.name.split(' ')[0]}</span>
                <ChevronDown
                  size={12}
                  style={{
                    transform: personaMenuOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s'
                  }}
                />
              </button>

              {personaMenuOpen && (
                <div
                  className="cl-profile-dropdown"
                  style={{ width: '300px', right: 0, padding: '8px' }}
                >
                  <div style={{ padding: '8px 10px', fontSize: '11px', fontWeight: '700', color: '#748391', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Select Demonstration Persona
                  </div>

                  {Object.entries(SYNTHETIC_PERSONAS).map(([key, p]) => {
                    const isSelected = user.id === p.user.id;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleSwitchPersona(key)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          border: 'none',
                          background: isSelected ? '#E6F4F1' : 'transparent',
                          color: '#172B3A',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          marginBottom: '4px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: '13px', color: isSelected ? '#0F766E' : '#172B3A' }}>
                            {p.user.name}
                          </strong>
                          {isSelected && <span className="cl-badge cl-badge-teal" style={{ fontSize: '9px' }}>Active</span>}
                        </div>
                        <span style={{ fontSize: '11px', color: '#5B6B79' }}>
                          {p.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Plaid Feed Active Pill */}
            <div className="cl-plaid-status-pill" title="Synchronized bank verification feed active">
              <span className="cl-pulse-dot"></span>
              <span>Plaid Active</span>
            </div>

            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="cl-btn-icon"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-label="View recent audit alerts"
                title="Telemetry notifications"
              >
                <Bell size={18} />
              </button>

              {notificationsOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '44px',
                    right: 0,
                    width: '320px',
                    background: '#ffffff',
                    border: '1px solid #DCE3EA',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(23,43,58,0.12)',
                    padding: '16px',
                    zIndex: 150
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#173B57' }}>Recent Telemetry</span>
                    <button
                      type="button"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#748391' }}
                      onClick={() => setNotificationsOpen(false)}
                      aria-label="Close notification panel"
                    >
                      <X size={15} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                    <div style={{ padding: '8px', background: '#F1F5F9', borderRadius: '8px' }}>
                      <strong style={{ color: '#0F766E' }}>Bank Verified Inflow</strong>
                      <p style={{ margin: '2px 0 0', color: '#5B6B79' }}>Direct business deposit verified: +$7,900.00</p>
                      <span style={{ fontSize: '10px', color: '#748391' }}>Today 08:30 AM</span>
                    </div>
                    <div style={{ padding: '8px', background: '#FFF4D6', borderRadius: '8px' }}>
                      <strong style={{ color: '#925D00' }}>Copilot Optimization</strong>
                      <p style={{ margin: '2px 0 0', color: '#5B6B79' }}>Seasonal Step-EMI eliminates summer deficit risk.</p>
                      <span style={{ fontSize: '10px', color: '#748391' }}>Oct 24</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Menu Button & Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 6px',
                  borderRadius: '8px',
                  transition: 'background 0.15s'
                }}
                title="Account & Profile options"
                aria-expanded={profileMenuOpen}
              >
                <div className="cl-user-text">
                  <span className="cl-user-name">{user.name}</span>
                  <span className="cl-user-tier">
                    ID: {user.id} • <span className="cl-user-tier-highlight">{user.tier}</span>
                  </span>
                </div>
                <div className="cl-user-avatar" title={`${user.name} • ${user.tier}`}>
                  {user.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <ChevronDown
                  size={14}
                  color="#748391"
                  style={{
                    transform: profileMenuOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s ease'
                  }}
                />
              </button>

              {/* Profile Dropdown */}
              {profileMenuOpen && (
                <div className="cl-profile-dropdown">
                  <div className="cl-profile-dropdown-user">
                    <div className="cl-user-avatar" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                      {user.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#172B3A' }}>{user.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <span style={{ fontSize: '11px', color: '#0F766E', fontWeight: '600' }}>{user.tier}</span>
                        <CopyButton textToCopy={user.id} label="ID" successLabel="Copied" />
                      </div>
                    </div>
                  </div>

                  {/* Security Status Box */}
                  <div className="cl-profile-dropdown-sec">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#5B6B79' }}>
                      <Lock size={13} color="#0F766E" />
                      <span>256-Bit Encrypted Data</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#5B6B79' }}>
                      <ShieldCheck size={13} color="#173B57" />
                      <span>Fair Lending &amp; FCRA Compliant</span>
                    </div>
                  </div>

                  {/* Action Links */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderTop: '1px solid #DCE3EA', paddingTop: '6px' }}>
                    <button
                      type="button"
                      className="cl-profile-dropdown-item"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        setFaqModalOpen(true);
                      }}
                    >
                      <HelpCircle size={14} />
                      <span>Transparency &amp; FAQ</span>
                    </button>
                    <button
                      type="button"
                      className="cl-profile-dropdown-item danger"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        setResetConfirmOpen(true);
                      }}
                    >
                      <LogOut size={14} />
                      <span>Reset Local Data</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content View with Main Landmark */}
        <main id="main-content" className="cl-page-content" tabIndex="-1">
          {children}
        </main>

        {/* Comprehensive Institutional Footer */}
        <footer className="cl-portal-footer" role="contentinfo">
          <div className="cl-footer-container">
            <div className="cl-footer-grid">
              {/* Brand Column */}
              <div className="cl-footer-col">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div className="cl-brand-icon-box" style={{ width: '28px', height: '28px' }}>
                    <Layers size={15} strokeWidth={2.4} />
                  </div>
                  <strong style={{ fontSize: '15px', color: '#172B3A' }}>CreditLens</strong>
                </div>
                <p style={{ fontSize: '12px', color: '#5B6B79', lineHeight: 1.5, margin: '0 0 12px' }}>
                  Fair and explainable creditworthiness assessment platform. Empowering seasonal business owners and non-traditional earners with transparent underwriting.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#0F766E', fontWeight: '600' }}>
                  <ShieldCheck size={14} />
                  <span>FCRA &amp; ECOA Model Certified</span>
                </div>
              </div>

              {/* Navigation Links Column */}
              <div className="cl-footer-col">
                <strong className="cl-footer-title">Borrower Modules</strong>
                <ul className="cl-footer-list">
                  <li><button type="button" onClick={() => handleNavClick('dashboard')} className="cl-footer-link">Applicant Dashboard</button></li>
                  <li><button type="button" onClick={() => handleNavClick('seasonal-intelligence')} className="cl-footer-link">Seasonal Cashflow Model</button></li>
                  <li><button type="button" onClick={() => handleNavClick('financial-profile')} className="cl-footer-link">Financial Profile Ledger</button></li>
                  <li><button type="button" onClick={() => handleNavClick('my-assessment')} className="cl-footer-link">Credit Assessment Breakdown</button></li>
                  <li><button type="button" onClick={() => handleNavClick('loan-simulator')} className="cl-footer-link">Loan Comparison Simulator</button></li>
                </ul>
              </div>

              {/* Tools & Compliance Column */}
              <div className="cl-footer-col">
                <strong className="cl-footer-title">Tools &amp; Rights</strong>
                <ul className="cl-footer-list">
                  <li><button type="button" onClick={() => handleNavClick('document-evidence')} className="cl-footer-link">Evidence Management</button></li>
                  <li><button type="button" onClick={() => handleNavClick('readiness-copilot')} className="cl-footer-link">Credit Readiness Copilot</button></li>
                  <li><button type="button" onClick={() => handleNavClick('credit-decision')} className="cl-footer-link">Underwriting Decision</button></li>
                  <li><button type="button" onClick={() => handleNavClick('financial-report')} className="cl-footer-link">Borrower Audit Report (PDF)</button></li>
                  <li><button type="button" onClick={() => setFaqModalOpen(true)} className="cl-footer-link">Transparency &amp; FAQ</button></li>
                </ul>
              </div>

              {/* Support & Contact Column */}
              <div className="cl-footer-col">
                <strong className="cl-footer-title">Underwriting Helpline</strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                  <a href="tel:+14158924412" className="cl-footer-contact-link">
                    <Phone size={13} color="#0F766E" />
                    <span>(415) 892-4412 (Direct Support)</span>
                  </a>
                  <a href="mailto:support@creditlens.io" className="cl-footer-contact-link">
                    <Mail size={13} color="#0F766E" />
                    <span>support@creditlens.io</span>
                  </a>
                  <span style={{ fontSize: '11px', color: '#748391', marginTop: '4px' }}>
                    Hours: Mon–Fri 8:00 AM – 8:00 PM EST
                  </span>
                  <div style={{ marginTop: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setResetConfirmOpen(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        fontSize: '11px',
                        color: '#B42318',
                        textDecoration: 'underline',
                        cursor: 'pointer'
                      }}
                    >
                      Reset Local Simulation Data
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Legal Row with Dynamic Year */}
            <div className="cl-footer-bottom">
              <span style={{ fontSize: '12px', color: '#748391' }}>
                &copy; {new Date().getFullYear()} CreditLens Technologies Inc. All rights reserved.
              </span>
              <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: '#5B6B79' }}>
                <span>FCRA 15 U.S.C. § 1681i Disclosures</span>
                <span>•</span>
                <span>ECOA 12 CFR Part 1002 Safe Harbor</span>
                <span>•</span>
                <span>Zero Demographic Bias Certified</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Global Floating Contact Button */}
      <FloatingContact userEmail={user.email} userPhone={user.phone} />

      {/* Back to Top Floating Button */}
      <BackToTop />

      {/* Essential Storage Cookie Notice */}
      <CookieConsent />

      {/* Site-wide Search Modal */}
      <WebsiteSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onNavigate={handleNavClick}
      />

      {/* Transparency & Borrower Rights FAQ Modal */}
      <TransparencyFAQModal
        isOpen={faqModalOpen}
        onClose={() => setFaqModalOpen(false)}
      />

      {/* Confirmation Modal for Reset Session Data */}
      <ConfirmationModal
        isOpen={resetConfirmOpen}
        title="Reset Local Simulation Data?"
        message="This will clear your local storage modifications, custom what-if scenarios, and uploaded evidence documents, returning CreditLens to the default seasonal business owner demo."
        confirmLabel="Reset Session"
        cancelLabel="Keep Data"
        isDanger={true}
        onConfirm={handleExecuteReset}
        onCancel={() => setResetConfirmOpen(false)}
      />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="cl-toast" role="status" aria-live="polite">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default UserPortalLayout;
