import React, { useState, useEffect } from 'react';
import { HelpCircle, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

import { getInterpolatedColor } from '../utils/ulasColors';
export { getInterpolatedColor };

export default function ULASSpeedometerGauge({
  score = 0,
  band = 'B',
  decision = 'CONDITIONAL_APPROVAL',
  calibratedPd = 0.22,
  confidence = 0.90,
  isLoading = false,
  error = null,
  isUnavailable = false
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

  // Check user system preference for reduced motion
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Smooth animation of needle and score counter on score update
  useEffect(() => {
    if (isLoading || isUnavailable || error || score === null || score === undefined) {
      return;
    }
    const target = Math.max(0, Math.min(100, Number(score)));

    if (prefersReducedMotion) {
      setAnimatedScore(target);
      return;
    }

    let start = animatedScore;
    const duration = 750; // ms
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = start + (target - start) * ease;
      setAnimatedScore(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setAnimatedScore(target);
      }
    };

    const animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [score, isLoading, isUnavailable, error, prefersReducedMotion]);

  // Geometry:
  // Center: (150, 135), radius = 102
  // Arch spans 180° from angle 180° (left) to 0° (right)
  const cx = 150;
  const cy = 135;
  const r = 102;
  const arcLength = Math.PI * r; // ~320.44 px

  const currentScore = isUnavailable || error ? 0 : animatedScore;
  const scoreColor = getInterpolatedColor(currentScore);

  // Needle angle: -90 deg (score 0) to +90 deg (score 100)
  const needleAngle = -90 + (currentScore / 100) * 180;

  // Arc stroke offset: arcLength - (arcLength * (currentScore / 100))
  const strokeOffset = arcLength - (arcLength * (currentScore / 100));

  // Ticks at 0, 25, 50, 75, 100
  const ticks = [0, 25, 50, 75, 100].map((val) => {
    const angleRad = Math.PI - (val / 100) * Math.PI;
    const innerR = r - 15;
    const outerR = r + 8;
    const labelR = r + 24;

    const x1 = cx + innerR * Math.cos(angleRad);
    const y1 = cy - innerR * Math.sin(angleRad);
    const x2 = cx + outerR * Math.cos(angleRad);
    const y2 = cy - outerR * Math.sin(angleRad);
    const lx = cx + labelR * Math.cos(angleRad);
    const ly = cy - labelR * Math.sin(angleRad);

    return { val, x1, y1, x2, y2, lx, ly };
  });

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '18px 22px',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #DCE3EA',
        boxShadow: '0 2px 10px rgba(23,43,58,0.04)',
        maxWidth: '380px',
        width: '100%',
        margin: '0 auto',
        transition: 'border-color 0.2s ease'
      }}
      role="meter"
      aria-label="Universal Loan Acceptance Score (ULAS) Speedometer Gauge"
      aria-valuenow={Math.round(currentScore)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={
        isUnavailable
          ? 'ULAS score unavailable due to insufficient data'
          : `ULAS Score: ${Math.round(score)} out of 100, Band ${band}`
      }
    >
      {/* Header bar with methodology info toggle */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} color="#0F766E" />
          <span
            style={{
              fontSize: '11px',
              fontWeight: '700',
              color: '#748391',
              textTransform: 'uppercase',
              letterSpacing: '0.06em'
            }}
          >
            ULAS v0.2 Speedometer
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowTooltip((prev) => !prev)}
          aria-label="Explain ULAS Score Methodology"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            color: '#748391',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '50%',
            transition: 'color 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#0F766E')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#748391')}
        >
          <HelpCircle size={15} />
        </button>
      </div>

      {/* Methodology Popover Tooltip */}
      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            top: '44px',
            left: '16px',
            right: '16px',
            backgroundColor: '#173B57',
            color: '#FFFFFF',
            padding: '14px 16px',
            borderRadius: '10px',
            zIndex: 50,
            fontSize: '12px',
            lineHeight: 1.45,
            boxShadow: '0 8px 24px rgba(23,43,58,0.25)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <strong style={{ fontSize: '13px', color: '#6EE7B7' }}>ULAS Scoring Methodology (0–100)</strong>
            <button
              type="button"
              onClick={() => setShowTooltip(false)}
              style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '14px' }}
            >
              ✕
            </button>
          </div>
          <p style={{ margin: '0 0 6px' }}>
            ULAS calculates creditworthiness on a transparent 0 to 100 scale using logistic grant mapping: <code>P = 1 / (1 + e^-(R-50)/18)</code>, calibrated against RBI and fair lending baselines.
          </p>
          <p style={{ margin: 0, color: '#CBD5E1', fontSize: '11px' }}>
            The gauge dynamically transitions from red (0–20) to orange (21–40), amber/yellow (41–60), yellow-green (61–80), and emerald green (81–100).
          </p>
        </div>
      )}

      {/* Speedometer SVG Canvas */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '300px', height: '175px' }}>
        <svg
          viewBox="0 0 300 185"
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          <defs>
            {/* Dynamic Red-to-Green Continuous Arc Gradient */}
            <linearGradient id="ulasContinuousGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#DC2626" />   {/* 0-20: Red */}
              <stop offset="20%" stopColor="#EA580C" />  {/* 20: Red-Orange */}
              <stop offset="35%" stopColor="#F97316" />  {/* 35: Orange */}
              <stop offset="50%" stopColor="#EAB308" />  {/* 50: Amber to Yellow */}
              <stop offset="75%" stopColor="#65A30D" />  {/* 75: Yellow-Green */}
              <stop offset="100%" stopColor="#0F766E" /> {/* 100: Green */}
            </linearGradient>

            {/* Drop Shadow for Dial Pivot */}
            <filter id="pivotShadow" x="-25%" y="-25%" width="150%" height="150%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#173B57" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* 1. Inactive Background Track Arc */}
          <path
            d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
            fill="none"
            stroke="#E9ECEF"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* 2. Active Calibrated Colored Arc */}
          {!isUnavailable && !error && (
            <path
              d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
              fill="none"
              stroke="url(#ulasContinuousGradient)"
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={arcLength}
              strokeDashoffset={strokeOffset}
              style={{
                transition: prefersReducedMotion
                  ? 'none'
                  : 'stroke-dashoffset 0.75s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            />
          )}

          {/* 3. Radial Tick Marks & Numerical Labels */}
          {ticks.map((t) => (
            <g key={t.val}>
              <line
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke="#A0AEC0"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <text
                x={t.lx}
                y={t.ly + 4}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill="#748391"
                fontFamily="Inter, system-ui, sans-serif"
              >
                {t.val}
              </text>
            </g>
          ))}

          {/* 4. Speedometer Needle Dial with Center Pivot */}
          {!isUnavailable && !error && (
            <g
              transform={`rotate(${needleAngle}, ${cx}, ${cy})`}
              style={{
                transition: prefersReducedMotion
                  ? 'none'
                  : 'transform 0.75s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transformOrigin: `${cx}px ${cy}px`
              }}
            >
              {/* Tapered needle pointer */}
              <polygon
                points={`${cx - 3.5},${cy} ${cx + 3.5},${cy} ${cx},${cy - r + 8}`}
                fill="#173B57"
              />
              {/* Needle tip dot in active score color */}
              <circle cx={cx} cy={cy - r + 8} r="3.5" fill={scoreColor} />
            </g>
          )}

          {/* 5. Center Dial Pivot Cap */}
          <circle
            cx={cx}
            cy={cy}
            r="12"
            fill="#FFFFFF"
            stroke="#173B57"
            strokeWidth="3.5"
            filter="url(#pivotShadow)"
          />
          <circle cx={cx} cy={cy} r="5" fill={scoreColor} />
        </svg>

        {/* Center Digital Score Readout */}
        <div
          style={{
            position: 'absolute',
            bottom: '2px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          {isLoading ? (
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#748391' }}>
              Calculating...
            </span>
          ) : isUnavailable || error ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <AlertCircle size={24} color="#D97706" style={{ marginBottom: '2px' }} />
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#925D00' }}>
                Data Insufficient
              </span>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                <span
                  style={{
                    fontSize: '40px',
                    fontWeight: '900',
                    color: '#173B57',
                    lineHeight: 1,
                    letterSpacing: '-0.03em'
                  }}
                >
                  {Math.round(currentScore)}
                </span>
                <span
                  style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#748391',
                    lineHeight: 1
                  }}
                >
                  /100
                </span>
              </div>

              {/* Score Band Pill Badge */}
              <div
                style={{
                  marginTop: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: `${scoreColor}18`,
                  color: scoreColor,
                  border: `1px solid ${scoreColor}40`,
                  padding: '2px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '800',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase'
                }}
              >
                <span>Band {band}</span>
                <span>•</span>
                <span>{decision.replace(/_/g, ' ')}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Probability & Model Confidence Summary */}
      <div
        style={{
          width: '100%',
          marginTop: '12px',
          paddingTop: '10px',
          borderTop: '1px solid #F1F4F8',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          fontSize: '11px',
          color: '#5B6B79'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <span style={{ display: 'block', color: '#748391', textTransform: 'uppercase', fontSize: '9px', fontWeight: '700' }}>
            Grant Prob (P)
          </span>
          <strong style={{ fontSize: '13px', color: '#173B57' }}>
            {Math.round((1 - (calibratedPd || 0.22)) * 100)}%
          </strong>
        </div>

        <div style={{ width: '1px', height: '18px', backgroundColor: '#E2E8F0' }} />

        <div style={{ textAlign: 'center' }}>
          <span style={{ display: 'block', color: '#748391', textTransform: 'uppercase', fontSize: '9px', fontWeight: '700' }}>
            Model Confidence
          </span>
          <strong style={{ fontSize: '13px', color: '#0F766E' }}>
            {Math.round((confidence || 0.90) * 100)}%
          </strong>
        </div>

        <div style={{ width: '1px', height: '18px', backgroundColor: '#E2E8F0' }} />

        <div style={{ textAlign: 'center' }}>
          <span style={{ display: 'block', color: '#748391', textTransform: 'uppercase', fontSize: '9px', fontWeight: '700' }}>
            Scale Range
          </span>
          <strong style={{ fontSize: '13px', color: '#173B57' }}>
            0 – 100
          </strong>
        </div>
      </div>
    </div>
  );
}
