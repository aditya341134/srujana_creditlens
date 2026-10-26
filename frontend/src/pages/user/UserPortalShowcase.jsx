import React, { useState, useEffect } from 'react';
import { UserDashboard } from './UserDashboard';
import { SeasonalIntelligence } from './SeasonalIntelligence';
import { FinancialProfile } from './FinancialProfile';
import { MyAssessment } from './MyAssessment';
import { LoanSimulator } from './LoanSimulator';
import { EvidenceManagement } from './EvidenceManagement';
import { ReadinessCopilot } from './ReadinessCopilot';
import { CreditDecision } from './CreditDecision';
import { BorrowerReport } from './BorrowerReport';
import { LoanApplication } from './LoanApplication';
import { NotFound } from './NotFound';
import { captureUtmParameters } from '../../utils/utmTracker';

const PAGE_METADATA = {
  dashboard: { title: 'Applicant Overview' },
  'seasonal-intelligence': { title: 'Seasonal Income Intelligence' },
  'financial-profile': { title: 'Financial Profile & Records' },
  'my-assessment': { title: 'Explainable Credit Assessment' },
  'loan-simulator': { title: 'Loan Comparison Simulator' },
  'document-evidence': { title: 'Document & Evidence Management' },
  'readiness-copilot': { title: 'Credit Readiness Copilot' },
  'credit-decision': { title: 'Understand My Credit Decision' },
  'financial-report': { title: 'Borrower Financial Report' },
  'loan-application': { title: 'New Loan Application' }
};

const VALID_PAGES = Object.keys(PAGE_METADATA);

/**
 * UserPortalShowcase
 * Interactive harness enabling seamless navigation between all 10 Borrower Frontend modules
 * with hash routing, dynamic document titles, UTM tracking, and 404 fallback.
 */
export function UserPortalShowcase({ initialPage = 'dashboard' }) {
  const [currentPage, setCurrentPage] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return initialPage;
    if (VALID_PAGES.includes(hash)) {
      return hash;
    }
    return '404';
  });

  // Capture UTM parameters on initial load
  useEffect(() => {
    captureUtmParameters();
  }, []);

  // Sync hash changes & update page titles
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash) {
        setCurrentPage('dashboard');
      } else if (VALID_PAGES.includes(hash)) {
        setCurrentPage(hash);
      } else {
        setCurrentPage('404');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update dynamic document title
  useEffect(() => {
    const meta = PAGE_METADATA[currentPage];
    if (meta) {
      document.title = `${meta.title} | CreditLens — Fair & Explainable Credit`;
    } else if (currentPage === '404') {
      document.title = 'Page Not Found | CreditLens';
    } else {
      document.title = 'CreditLens — Fair & Explainable Credit Assessment';
    }
  }, [currentPage]);

  const handleNavigate = (pageId) => {
    setCurrentPage(pageId);
    window.location.hash = pageId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  switch (currentPage) {
    case 'seasonal-intelligence':
      return <SeasonalIntelligence onNavigate={handleNavigate} />;
    case 'financial-profile':
      return <FinancialProfile onNavigate={handleNavigate} />;
    case 'my-assessment':
      return <MyAssessment onNavigate={handleNavigate} />;
    case 'loan-simulator':
      return <LoanSimulator onNavigate={handleNavigate} />;
    case 'document-evidence':
      return <EvidenceManagement onNavigate={handleNavigate} />;
    case 'readiness-copilot':
      return <ReadinessCopilot onNavigate={handleNavigate} />;
    case 'credit-decision':
      return <CreditDecision onNavigate={handleNavigate} />;
    case 'financial-report':
      return <BorrowerReport onNavigate={handleNavigate} />;
    case 'loan-application':
      return <LoanApplication onNavigate={handleNavigate} />;
    case 'dashboard':
      return <UserDashboard onNavigate={handleNavigate} />;
    case '404':
    default:
      return <NotFound onNavigate={handleNavigate} />;
  }
}

export default UserPortalShowcase;
