/**
 * CreditLens Banker Portal Design Tokens
 * Strictly adhering to root design.md specifications.
 * LIGHT THEME ONLY.
 */

export const colors = {
  // Brand tokens
  brand: '#173B57',
  brandHover: '#102E45',
  accent: '#0F766E',
  accentLight: '#E6F4F1',
  
  // Surfaces & Backgrounds
  page: '#F6F8FB',
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',
  border: '#DCE3EA',
  
  // Typography
  text: '#172B3A',
  textSecondary: '#5B6B79',
  textMuted: '#748391',
  
  // Functional Statuses
  success: '#18794E',
  successBg: '#E8F5EE',
  warning: '#925D00',
  warningBg: '#FFF4D6',
  danger: '#B42318',
  dangerBg: '#FDECEA',
  info: '#245EA8',
  infoBg: '#EAF2FE',
};

export const typography = {
  fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  pageTitle: { fontSize: '28px', fontWeight: '700', lineHeight: '36px', color: colors.text },
  sectionTitle: { fontSize: '20px', fontWeight: '600', lineHeight: '28px', color: colors.text },
  cardTitle: { fontSize: '15px', fontWeight: '600', lineHeight: '22px', color: colors.text },
  body: { fontSize: '14px', fontWeight: '400', lineHeight: '20px', color: colors.text },
  bodyMedium: { fontSize: '14px', fontWeight: '500', lineHeight: '20px', color: colors.text },
  supporting: { fontSize: '13px', fontWeight: '400', lineHeight: '18px', color: colors.textSecondary },
  kpiValue: { fontSize: '26px', fontWeight: '700', lineHeight: '32px', color: colors.brand, fontVariantNumeric: 'tabular-nums' },
  buttonLabel: { fontSize: '14px', fontWeight: '600', lineHeight: '20px' },
};

export const shadows = {
  subtle: '0 2px 8px rgba(23, 43, 58, 0.05)',
  elevated: '0 4px 16px rgba(23, 43, 58, 0.08)',
  dialog: '0 12px 32px rgba(23, 43, 58, 0.12)',
};

export const radii = {
  small: '8px',
  input: '8px',
  button: '8px',
  card: '12px',
  dialog: '16px',
  badge: '6px',
  pill: '9999px',
};

export const transitions = {
  default: 'all 180ms ease-in-out',
};
