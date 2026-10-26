import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, RefreshCw, Award, ShieldCheck, History } from 'lucide-react';
import api from '../services/api';
import { getInterpolatedColor } from '../utils/ulasColors';

export default function ULASScoreHistoryChart({ applicationId, refreshTrigger = 0 }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const fetchHistory = async () => {
    if (!applicationId) return;
    setLoading(true);
    try {
      const res = await api.getUlasHistory(applicationId);
      setHistory(res.history || []);
      setLoading(false);
    } catch (err) {
      console.warn('[CreditLens] History fetch note:', err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [applicationId, refreshTrigger]);

  if (loading) {
    return (
      <div
        style={{
          padding: '24px',
          textAlign: 'center',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #DCE3EA'
        }}
      >
        <span style={{ fontSize: '13px', color: '#5B6B79' }}>
          Loading ULAS score audit history...
        </span>
      </div>
    );
  }

  // Chart dimensions
  const width = 680;
  const height = 180;
  const padding = { top: 20, right: 30, bottom: 40, left: 45 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Single record or empty history handling
  if (!history || history.length === 0) {
    return (
      <div
        style={{
          padding: '24px',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #DCE3EA',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            backgroundColor: '#E6F4F1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0F766E'
          }}
        >
          <History size={20} />
        </div>
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#173B57', margin: 0 }}>
            Initial Baseline Evaluation Recorded
          </h4>
          <p style={{ fontSize: '12px', color: '#5B6B79', margin: '4px 0 0' }}>
            Subsequent evaluations, document updates, and counterfactual runs will be charted here longitudinally.
          </p>
        </div>
      </div>
    );
  }

  // Calculate coordinates
  const points = history.map((item, idx) => {
    const x =
      history.length === 1
        ? padding.left + innerWidth / 2
        : padding.left + (idx / (history.length - 1)) * innerWidth;
    const y = padding.top + innerHeight - (item.ulas_score / 100) * innerHeight;
    return { ...item, x, y };
  });

  // SVG path strings
  const linePath = points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');
  const areaPath =
    points.length > 1
      ? `${linePath} L ${points[points.length - 1].x} ${padding.top + innerHeight} L ${points[0].x} ${
          padding.top + innerHeight
        } Z`
      : '';

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #DCE3EA',
        padding: '20px 24px',
        boxShadow: '0 2px 6px rgba(23,43,58,0.03)',
        position: 'relative'
      }}
    >
      {/* Title & Stats Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={16} color="#0F766E" />
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#173B57', margin: 0 }}>
              ULAS Score History &amp; Audit Trail
            </h3>
            <span
              style={{
                fontSize: '11px',
                fontWeight: '700',
                color: '#0F766E',
                backgroundColor: '#E6F4F1',
                padding: '1px 8px',
                borderRadius: '12px'
              }}
            >
              {history.length} {history.length === 1 ? 'Record' : 'Recorded Evaluations'}
            </span>
          </div>
          <p style={{ fontSize: '12px', color: '#5B6B79', margin: '4px 0 0' }}>
            Longitudinal track of verified underwriting runs stored in database. Hover over any point to inspect historical decision data.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchHistory}
          style={{
            background: 'none',
            border: '1px solid #DCE3EA',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '11px',
            fontWeight: '600',
            color: '#173B57',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RefreshCw size={11} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Interactive SVG Trend Chart */}
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', minWidth: '480px', height: 'auto', display: 'block' }}
        >
          <defs>
            <linearGradient id="ulasHistoryAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0F766E" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#0F766E" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines & Y-Axis Labels */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = padding.top + innerHeight - (val / 100) * innerHeight;
            return (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#EDF2F7"
                  strokeWidth="1"
                  strokeDasharray={val === 0 || val === 100 ? 'none' : '3 3'}
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="#748391"
                  fontWeight="600"
                  fontFamily="Inter, system-ui, sans-serif"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area Fill Under Curve */}
          {areaPath && <path d={areaPath} fill="url(#ulasHistoryAreaGrad)" />}

          {/* Main Trend Line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#0F766E"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points */}
          {points.map((pt, idx) => {
            const ptColor = getInterpolatedColor(pt.ulas_score);
            const isHovered = hoveredPoint?.assessment_id === pt.assessment_id;

            return (
              <g
                key={pt.assessment_id || idx}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Outer halo */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 8 : 5}
                  fill="#FFFFFF"
                  stroke={ptColor}
                  strokeWidth={isHovered ? 3.5 : 2.5}
                  style={{ transition: 'r 0.15s ease, stroke-width 0.15s ease' }}
                />
                {/* Inner center dot */}
                <circle cx={pt.x} cy={pt.y} r={isHovered ? 3 : 2} fill={ptColor} />

                {/* Date Label on X Axis */}
                <text
                  x={pt.x}
                  y={height - 12}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight={isHovered ? '700' : '500'}
                  fill={isHovered ? '#173B57' : '#748391'}
                  fontFamily="Inter, system-ui, sans-serif"
                >
                  {pt.formatted_date ? pt.formatted_date.split(' ')[0] : `Run #${idx + 1}`}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Card */}
        {hoveredPoint && (
          <div
            style={{
              position: 'absolute',
              top: `${Math.max(10, (hoveredPoint.y / height) * 100 - 35)}%`,
              left: `${Math.min(85, Math.max(15, (hoveredPoint.x / width) * 100))}%`,
              transform: 'translate(-50%, -100%)',
              backgroundColor: '#173B57',
              color: '#FFFFFF',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '11px',
              boxShadow: '0 4px 16px rgba(23,43,58,0.25)',
              pointerEvents: 'none',
              zIndex: 30,
              whiteSpace: 'nowrap'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '13px' }}>
              <span style={{ color: getInterpolatedColor(hoveredPoint.ulas_score) }}>
                {Math.round(hoveredPoint.ulas_score)} / 100
              </span>
              <span style={{ fontSize: '10px', color: '#94A3B8' }}>•</span>
              <span style={{ color: '#E2E8F0' }}>Band {hoveredPoint.band}</span>
            </div>
            <div style={{ color: '#CBD5E1', fontSize: '10px', marginTop: '2px' }}>
              {hoveredPoint.formatted_date || 'Baseline'}
            </div>
            <div style={{ color: '#6EE7B7', fontSize: '10px', marginTop: '2px' }}>
              {hoveredPoint.decision_recommendation.replace(/_/g, ' ')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
