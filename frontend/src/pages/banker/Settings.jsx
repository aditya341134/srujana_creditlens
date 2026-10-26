import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  ShieldCheck,
  User,
  Sliders,
  CheckCircle2,
  Lock,
  Building2,
  FileText,
  Mail,
  Phone,
  Layers,
  Save
} from 'lucide-react';
import BankerLayout from '../../components/layout/BankerLayout';
import { useAuth } from '../../context/AuthContext';

export default function Settings() {
  const { user } = useAuth();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [benchmarks, setBenchmarks] = useState({
    maxDti: 50.0,
    minDscr: 1.25,
    minBureauScore: 680,
    minVintageYears: 2.0,
    primeRateFloor: 8.5
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <BankerLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header Breadcrumb */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#5B6B79', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <span>Banker Portal</span>
            <span>/</span>
            <span style={{ color: '#173B57', fontWeight: '700' }}>Settings &amp; Policies</span>
          </div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: '800',
              color: '#173B57',
              margin: '6px 0 6px 0',
              letterSpacing: '-0.02em'
            }}
          >
            Underwriting Policy &amp; Officer Desk Settings
          </h1>
          <p style={{ fontSize: '14px', color: '#5B6B79', margin: 0, maxWidth: '720px', lineHeight: 1.5 }}>
            Configure institutional debt-to-income benchmarks, verify credit officer credentials, and review fair lending policy governance.
          </p>
        </div>

        {savedSuccess && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#E8F5EE',
              border: '1px solid #A6F4C5',
              borderRadius: '8px',
              color: '#18794E',
              fontSize: '13px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <CheckCircle2 size={16} />
            <span>Underwriting policy benchmarks updated successfully for current session!</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Column 1: Credit Officer Profile Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #DCE3EA',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(23, 43, 58, 0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  backgroundColor: '#173B57',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: '700'
                }}
              >
                DV
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#173B57', margin: 0 }}>
                  {user?.name || 'David Vance'}
                </h2>
                <div style={{ fontSize: '12px', color: '#0F766E', fontWeight: '600', marginTop: '2px' }}>
                  Senior Underwriting Officer &bull; Staff ID #CL-301
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid #F0F4F8', paddingTop: '16px', fontSize: '13px' }}>
              <div>
                <span style={{ color: '#5B6B79', display: 'block', fontSize: '11px' }}>Department / Division</span>
                <strong style={{ color: '#173B57' }}>Institutional Retail &amp; SME Credit Risk</strong>
              </div>
              <div>
                <span style={{ color: '#5B6B79', display: 'block', fontSize: '11px' }}>Officer Email</span>
                <strong style={{ color: '#173B57' }}>{user?.email || 'd.vance@creditlens.bank'}</strong>
              </div>
              <div>
                <span style={{ color: '#5B6B79', display: 'block', fontSize: '11px' }}>Sanction Delegation Authority</span>
                <strong style={{ color: '#18794E' }}>Up to ₹1,50,00,000 (Tier 1 Authority)</strong>
              </div>
              <div>
                <span style={{ color: '#5B6B79', display: 'block', fontSize: '11px' }}>Credit Assessment Architecture</span>
                <strong style={{ color: '#173B57' }}>Rule-Based Prudential Engine v2.0 (Zero ML)</strong>
              </div>
            </div>
          </div>

          {/* Column 2: Policy Benchmarks Form */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #DCE3EA',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(23, 43, 58, 0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <ShieldCheck size={20} color="#0F766E" />
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#173B57', margin: 0 }}>
                Rule-Based Underwriting Policy Thresholds
              </h2>
            </div>
            <p style={{ fontSize: '12px', color: '#5B6B79', margin: '0 0 16px 0', lineHeight: 1.4 }}>
              These benchmarks establish regulatory thresholds for automated warning tags and adverse action triggers across the portal.
            </p>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#173B57', marginBottom: '4px' }}>
                  Maximum Permissible DTI Ceiling (% Gross Inflow)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={benchmarks.maxDti}
                  onChange={(e) => setBenchmarks({ ...benchmarks, maxDti: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #DCE3EA',
                    fontSize: '13px',
                    color: '#172B3A',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#173B57', marginBottom: '4px' }}>
                  Minimum Debt Service Coverage Ratio (DSCR Buffer)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={benchmarks.minDscr}
                  onChange={(e) => setBenchmarks({ ...benchmarks, minDscr: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #DCE3EA',
                    fontSize: '13px',
                    color: '#172B3A',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#173B57', marginBottom: '4px' }}>
                  Minimum Bureau Credit Score Floor
                </label>
                <input
                  type="number"
                  value={benchmarks.minBureauScore}
                  onChange={(e) => setBenchmarks({ ...benchmarks, minBureauScore: Number(e.target.value) })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #DCE3EA',
                    fontSize: '13px',
                    color: '#172B3A',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="submit"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 20px',
                    backgroundColor: '#173B57',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  <Save size={15} />
                  <span>Update Policy Benchmarks</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </BankerLayout>
  );
}
