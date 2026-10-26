import { useState, useEffect } from 'react';

/**
 * Universal navigation helper for Banker Portal
 * Works seamlessly with:
 * 1. Standard browser URL parameters (?page=dashboard, ?page=applications, ?page=applicant&id=..., ?page=review&id=...)
 * 2. URL paths (/banker/dashboard, /banker/applications, /banker/applications/:id, /banker/assessments/:id)
 * 3. Hash routes (#/banker/...)
 * 4. Custom navigation events without page reloads
 */

export function parseBankerRoute() {
  if (typeof window === 'undefined') {
    return { screen: 'dashboard', id: null };
  }

  const searchParams = new URLSearchParams(window.location.search);
  const pageParam = searchParams.get('page');
  const idParam = searchParams.get('id');

  if (pageParam) {
    return {
      screen: pageParam.toLowerCase(),
      id: idParam || null,
    };
  }

  const path = window.location.pathname.toLowerCase();
  
  if (path.includes('/applications/') || path.includes('/applicant/')) {
    const parts = path.split('/');
    const lastPart = parts[parts.length - 1];
    if (path.includes('/review') || path.includes('/assessment')) {
      return { screen: 'review', id: lastPart };
    }
    return { screen: 'applicant', id: lastPart };
  }

  if (path.includes('/assessments/') || path.includes('/review/')) {
    const parts = path.split('/');
    return { screen: 'review', id: parts[parts.length - 1] };
  }

  if (path.includes('/verification')) {
    return { screen: 'verification', id: idParam || null };
  }
  if (path.includes('/simulator')) {
    return { screen: 'simulator', id: idParam || null };
  }
  if (path.includes('/scenarios')) {
    return { screen: 'scenarios', id: idParam || null };
  }
  if (path.includes('/assistant')) {
    return { screen: 'assistant', id: idParam || null };
  }
  if (path.includes('/audit')) {
    return { screen: 'audit', id: idParam || null };
  }
  if (path.includes('/reports') || path.includes('/report')) {
    return { screen: 'reports', id: idParam || null };
  }
  if (path.includes('/settings')) {
    return { screen: 'settings', id: null };
  }
  if (path.includes('/applications')) {
    return { screen: 'applications', id: null };
  }
  if (path.includes('/login') || path.includes('/auth')) {
    return { screen: 'login', id: null };
  }
  if (path.includes('/404')) {
    return { screen: '404', id: null };
  }
  if (path.includes('/dashboard') || path.includes('/banker')) {
    return { screen: 'dashboard', id: null };
  }

  // Fallback to query or default
  return { screen: 'dashboard', id: null };
}

export function navigateToBanker(screen, id = null) {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  url.searchParams.set('page', screen);
  if (id) {
    url.searchParams.set('id', id);
  } else {
    url.searchParams.delete('id');
  }

  window.history.pushState({ screen, id }, '', url.toString());
  window.dispatchEvent(new CustomEvent('banker-navigation', { detail: { screen, id } }));
}

export function useBankerRoute() {
  const [route, setRoute] = useState(parseBankerRoute);

  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseBankerRoute());
    };

    const handleCustomNav = (e) => {
      setRoute(e.detail || parseBankerRoute());
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('banker-navigation', handleCustomNav);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('banker-navigation', handleCustomNav);
    };
  }, []);

  return {
    ...route,
    navigate: navigateToBanker,
  };
}
