# CreditLens Design System
Version: 1.0
Product: CreditLens — Fair and Explainable Creditworthiness Assessment
Purpose: Single source of truth for the User Portal and Banker Portal UI designs.

## 1. Non-negotiable design direction

- **LIGHT THEME ONLY.** Do not create dark mode, dark theme screens, dark sidebars, or dark full-page backgrounds.
- Use a clean, modern, premium, trustworthy fintech/banking aesthetic.
- Both portals must look like parts of the same product.
- Prefer white surfaces, very light cool-gray page backgrounds, deep navy text, and restrained teal accents.
- Avoid excessive gradients, glassmorphism, neon colors, oversized headings, heavy shadows, clutter, and decorative elements that reduce usability.
- Design for a real product, not a generic AI dashboard.
- Use realistic synthetic data only. Do not use real personal or financial information.

## 2. Brand personality

CreditLens should feel:
- Trustworthy
- Clear and transparent
- Professional
- Calm and accessible
- Helpful rather than judgmental

Suggested product tagline: **Understand your creditworthiness. See the reasons.**

## 3. Color tokens

Use these exact shared tokens wherever possible. Do not invent new colors for individual screens.

| Token | Hex | Use |
|---|---|---|
| `color.brand` | `#173B57` | Primary brand, selected navigation, key headings |
| `color.brand-hover` | `#102E45` | Hover state for primary brand elements |
| `color.accent` | `#0F766E` | Primary accent, links, selected controls, chart highlights |
| `color.accent-light` | `#E6F4F1` | Subtle accent backgrounds |
| `color.page` | `#F6F8FB` | Main page background |
| `color.surface` | `#FFFFFF` | Cards, forms, tables, dialogs |
| `color.surface-subtle` | `#F1F5F9` | Subtle panels and secondary surfaces |
| `color.border` | `#DCE3EA` | Borders, dividers, table separators |
| `color.text` | `#172B3A` | Primary text |
| `color.text-secondary` | `#5B6B79` | Secondary text, helper text |
| `color.text-muted` | `#748391` | Muted labels; do not use for small text on white if contrast is insufficient |
| `color.success` | `#18794E` | Success states |
| `color.success-bg` | `#E8F5EE` | Success background |
| `color.warning` | `#925D00` | Warning and missing-information states |
| `color.warning-bg` | `#FFF4D6` | Warning background |
| `color.danger` | `#B42318` | Errors and serious risk indicators |
| `color.danger-bg` | `#FDECEA` | Error background |
| `color.info` | `#245EA8` | Informational states |
| `color.info-bg` | `#EAF2FE` | Informational background |

Rules:
- Status must never be communicated by color alone. Include text labels and/or icons.
- Use green for positive indicators, amber for pending or incomplete information, red only for errors or serious risk, and blue for neutral information.
- Do not use red to imply that an applicant is inherently “bad.” Describe the specific financial concern.
- Avoid gradient fills. Solid colors are preferred.

## 4. Typography

- Preferred font: **Inter**. If unavailable, use `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.
- Use sentence case for headings and buttons. Avoid excessive all-caps.
- Use tabular numerals for currency and financial figures when available.
- Keep text readable and concise.

Suggested type scale:
- Page title: 28–32 px, weight 650–700
- Section title: 18–22 px, weight 600
- Card title: 14–16 px, weight 600
- Body: 14–16 px, weight 400
- Supporting text: 12–14 px, weight 400
- KPI value: 24–30 px, weight 650–700
- Button label: 14–16 px, weight 600

Avoid very large hero typography inside authenticated dashboards.

## 5. Layout and spacing

Use a consistent 4 px base spacing scale:
- `space-1`: 4 px
- `space-2`: 8 px
- `space-3`: 12 px
- `space-4`: 16 px
- `space-5`: 20 px
- `space-6`: 24 px
- `space-8`: 32 px
- `space-10`: 40 px
- `space-12`: 48 px
- `space-16`: 64 px

Layout guidance:
- Desktop content padding: 24–32 px.
- Mobile content padding: 16 px.
- Typical gap between cards: 16–24 px.
- Keep content aligned to a consistent grid.
- Use a maximum readable content width where appropriate.
- Avoid unnecessary horizontal scrolling.

## 6. Borders, radius and elevation

- Small controls: 8 px radius.
- Inputs and buttons: 8–10 px radius.
- Cards and panels: 12 px radius.
- Large sections/dialogs: 16 px radius.
- Standard border: 1 px solid `#DCE3EA`.
- Use subtle shadows only when elevation improves hierarchy:
  `0 2px 8px rgba(23, 43, 58, 0.05)`.
- Prefer borders and spacing over stacking multiple shadows.
- Avoid pill-shaped buttons everywhere; use them only for compact status badges when appropriate.

## 7. Buttons and controls

### Primary button
- Background: `#173B57`
- Text: `#FFFFFF`
- Hover: `#102E45`
- Visible keyboard focus ring.
- Disabled state: clearly distinguishable without losing readable contrast.

### Secondary button
- White background
- Text: `#173B57`
- Border: `#DCE3EA`
- Hover background: `#F1F5F9`

### Accent action
- Use `#0F766E` sparingly for secondary emphasis, links, selected states, or key chart accents.

### Inputs
- White background, 1 px border `#DCE3EA`, 8–10 px radius.
- Labels always visible; never rely on placeholder text as the only label.
- Provide helper text, validation and specific corrective error messages.
- Show focus clearly.
- Include appropriate input types, units, and currency indicators.

### Status badges
- Compact, readable and consistent.
- Examples: `Submitted`, `Under review`, `Needs information`, `Completed`.
- Use text plus a subtle status color.

## 8. Navigation and page shell

Both portals must share:
- Same CreditLens logo/wordmark treatment.
- Same header height and visual style.
- Same typography, spacing and control styles.
- Same sidebar width and navigation item treatment on desktop.
- Same responsive navigation behavior.

Suggested desktop shell:
- Light sidebar: white background with subtle right border.
- Main page: `#F6F8FB` background.
- Top header: white background with subtle bottom border.
- Active navigation: very light teal background with deep navy/teal text and a slim accent indicator.
- Sidebar must never use a dark background.

Suggested responsive behavior:
- Desktop: left sidebar plus top header.
- Tablet: collapsible sidebar or compact navigation.
- Mobile: compact top bar and accessible drawer or bottom navigation.
- Maintain visible focus, usable touch targets, and no clipped content.

## 9. Cards, tables and dashboards

### Cards
- White surface, subtle border, 12 px radius.
- Consistent internal padding, typically 16–24 px.
- Clear label, value and supporting context.
- Avoid decorative icons on every card if they add no meaning.

### Tables
- White background with clear column headers and row dividers.
- Readable row height and consistent alignment.
- Use text labels for application statuses.
- Search and filters should be easy to find.
- On small screens, use a responsive table strategy or convert rows into readable stacked cards.

### Charts
- Use a restrained palette: brand navy, teal, blue, and muted neutrals.
- Label axes, units and legends clearly.
- Use direct labels where possible.
- Do not use 3D charts or decorative charts without a decision-making purpose.
- Include text summaries or accessible labels for key chart information.

## 10. Portal-specific guidance

### User Portal
The user-facing portal should feel clear, reassuring and easy to understand.
Typical screens:
- Login and registration
- User dashboard
- Loan application
- Financial profile
- My assessment
- Loan simulator
- Application status
- Assessment report

Use plain language and explain financial terms. Distinguish estimates from confirmed decisions. Show missing or unverified data without blaming the user.

### Banker Portal
The banker-facing portal can be more information-dense while keeping the same visual identity.
Typical screens:
- Banker login
- Banker dashboard
- Applications list with search and filters
- Applicant details
- Explainable assessment review
- Review outcome and notes
- Review history, if time permits

Keep model-generated assessment separate from a human review decision. Do not imply that an ML score alone determines approval or rejection.

## 11. UX states

Design relevant states for components and pages:
- Default
- Hover
- Keyboard focus
- Active/selected
- Disabled
- Loading
- Success
- Validation error
- API error
- Empty state
- Missing or incomplete data
- Permission denied, where relevant

Error messages should explain what happened and how to fix it. Loading indicators should not cause major layout shifts.

## 12. Accessibility and responsive design

- Follow WCAG 2.2 AA principles where applicable.
- Maintain sufficient text and control contrast.
- Do not communicate status through color alone.
- Use clear labels, logical heading order and meaningful control names.
- Ensure keyboard navigation and visible focus.
- Respect reduced-motion preferences.
- Make controls comfortably usable on touch screens.
- Test at approximately 360 px mobile, 768 px tablet and 1280–1440 px desktop widths.

## 13. Motion

- Use subtle transitions, generally 150–200 ms.
- Animate hover, focus, menu and dialog states only when useful.
- Avoid constant movement, parallax, large entrance animations and distracting effects.
- Respect `prefers-reduced-motion`.

## 14. Content and financial trust

- Use synthetic demo applicants and fictional financial data.
- Never present illustrative scores or sample decisions as real credit decisions.
- Do not claim guaranteed loan approval.
- Missing financial history must be represented as uncertainty or missing evidence, not automatic proof of inability to repay.
- Show assessment limitations and distinguish model output from a banker's decision.
- Do not invent financial metrics, model explanations or API results.

## 15. Naming and handoff conventions

Use consistent frame naming:
- `User / Login`
- `User / Dashboard`
- `User / Loan Application`
- `User / Financial Profile`
- `User / My Assessment`
- `User / Loan Simulator`
- `User / Application Status`
- `User / Assessment Report`
- `Banker / Login`
- `Banker / Dashboard`
- `Banker / Applications`
- `Banker / Applicant Details`
- `Banker / Assessment Review`
- `Banker / Review Decision`
- `Banker / Review History`

Use shared component names such as:
- `Button / Primary`
- `Button / Secondary`
- `Input / Default`
- `Card / KPI`
- `Badge / Status`
- `Navigation / Sidebar`
- `Navigation / Header`
- `Table / Applications`
- `Alert / Warning`
- `State / Empty`
- `State / Loading`

## 16. Final acceptance checklist

Before considering a screen complete, verify:
- [ ] Light theme only; no dark mode or dark sidebar.
- [ ] Correct shared color, type, spacing and radius tokens.
- [ ] Consistent with both CreditLens portals.
- [ ] Responsive desktop, tablet and mobile layouts.
- [ ] Clear hierarchy and alignment.
- [ ] Accessible labels, contrast and keyboard focus.
- [ ] Relevant loading, error, empty and success states.
- [ ] Realistic synthetic data and clear financial assumptions.
- [ ] No unsupported credit claims or misleading decisions.
- [ ] Clean handoff with named frames and reusable components.

**Golden rule:** If a design decision is not specified here, choose the simplest accessible option that matches the existing CreditLens light design system. Do not introduce a new theme or visual language.
