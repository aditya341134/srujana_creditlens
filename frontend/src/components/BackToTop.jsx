import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

/**
 * BackToTop
 * Floating button that smoothly scrolls to the top of the page when clicked.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisible = () => {
      const scrolled = window.scrollY;
      if (scrolled > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisible, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisible);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="cl-back-to-top"
      aria-label="Scroll back to top of page"
      title="Back to top"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '42px',
        height: '42px',
        borderRadius: '50%',
        background: '#173B57',
        color: '#FFFFFF',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 4px 12px rgba(23, 59, 87, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 90,
        transition: 'transform 0.2s ease, background 0.2s ease'
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#0F766E')}
      onMouseLeave={(e) => (e.currentTarget.style.background = '#173B57')}
    >
      <ArrowUp size={18} strokeWidth={2.4} />
    </button>
  );
}

export default BackToTop;
