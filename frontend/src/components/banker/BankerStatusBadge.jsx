import React from 'react';
import { CheckCircle2, AlertTriangle, Clock, AlertCircle, Info, ShieldCheck } from 'lucide-react';

/**
 * Modernized BankerStatusBadge matching Borrower Portal design standards:
 * - Color + Icon + Label (accessible, never color alone)
 * - Harmonious pastel background with high-contrast text
 * - Clean rounded pill styling
 */
export default function BankerStatusBadge({ status, size = 'md' }) {
  const norm = (status || '').toLowerCase().trim();

  let config = {
    color: '#026AA2',
    bg: '#F0F9FF',
    border: '#B9E6FE',
    icon: Clock,
    label: status || 'Pending Review'
  };

  if (norm.includes('approve') || norm.includes('sanction') || norm.includes('disbursed') || norm.includes('confirmed')) {
    config = {
      color: '#18794E',
      bg: '#E8F5EE',
      border: '#A6F4C5',
      icon: CheckCircle2,
      label: 'Approved'
    };
  } else if (norm.includes('reject') || norm.includes('decline')) {
    config = {
      color: '#B42318',
      bg: '#FEF3F2',
      border: '#FECDCA',
      icon: AlertCircle,
      label: 'Rejected'
    };
  } else if (norm.includes('need') || norm.includes('info') || norm.includes('missing') || norm.includes('discrepancy')) {
    config = {
      color: '#B54708',
      bg: '#FFFAEB',
      border: '#FEDF89',
      icon: AlertTriangle,
      label: 'Needs Information'
    };
  } else if (norm.includes('ready') || norm.includes('pending') || norm.includes('awaiting')) {
    config = {
      color: '#925D00',
      bg: '#FFF4D6',
      border: '#FDE68A',
      icon: Clock,
      label: 'Ready for Review'
    };
  } else if (norm.includes('under') || norm.includes('progress') || norm.includes('verification')) {
    config = {
      color: '#0F766E',
      bg: '#E6F4F1',
      border: '#99F6E4',
      icon: Info,
      label: 'Under Review'
    };
  }

  const Icon = config.icon;
  const padding = size === 'sm' ? '2px 8px' : '4px 10px';
  const fontSize = size === 'sm' ? '11px' : '12px';
  const iconSize = size === 'sm' ? 12 : 13;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding,
        fontSize,
        fontWeight: '600',
        borderRadius: '20px',
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
        lineHeight: 1.2,
        whiteSpace: 'nowrap'
      }}
      aria-label={`Status: ${config.label}`}
    >
      <Icon size={iconSize} strokeWidth={2.2} />
      <span>{config.label}</span>
    </span>
  );
}
