import React from 'react';
import { useLocation } from 'react-router-dom';
import BankerDashboard from './BankerDashboard';
import Applications from './Applications';
import AssessmentReview from './AssessmentReview';
import LoanSimulator from './LoanSimulator';
import DecisionAudit from './DecisionAudit';
import Settings from './Settings';
import NotFound from './NotFound';
import { parseBankerRoute } from '../../components/banker/navigation';

export default function BankerPortal() {
  const location = useLocation();

  // 1. Check query parameter first (?page=...)
  const searchParams = new URLSearchParams(location.search);
  const pageParam = searchParams.get('page');

  if (pageParam) {
    const p = pageParam.toLowerCase();
    if (p === 'dashboard') return <BankerDashboard />;
    if (p === 'applications') return <Applications />;
    if (p === 'review' || p === 'assessment' || p === 'applicant') return <AssessmentReview />;
    if (p === 'simulator' || p === 'simulation') return <LoanSimulator />;
    if (p === 'audit' || p === 'history') return <DecisionAudit />;
    if (p === 'settings') return <Settings />;
    if (p === '404') return <NotFound />;
  }

  // 2. Check React Router path (/banker/...)
  const path = location.pathname.toLowerCase();

  if (path.includes('/applications')) {
    return <Applications />;
  }
  if (path.includes('/review') || path.includes('/assessment') || path.includes('/applicant')) {
    return <AssessmentReview />;
  }
  if (path.includes('/simulator')) {
    return <LoanSimulator />;
  }
  if (path.includes('/audit')) {
    return <DecisionAudit />;
  }
  if (path.includes('/settings')) {
    return <Settings />;
  }
  if (path.includes('/dashboard')) {
    return <BankerDashboard />;
  }

  // Default fallback
  return <BankerDashboard />;
}
