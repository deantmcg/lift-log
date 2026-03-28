import React from 'react';
import PropTypes from 'prop-types';
import { storage } from '../../services/storage';
import { NumInput } from '../common/NumInput';

export function SettingsScreen({ settings, setSettings, onBack }) {
  const updateSetting = (key, val) => {
    const next = { ...settings, [key]: val };
    setSettings(next);
    storage.saveSettings(next);
    if (key === 'theme') {
      document.documentElement.setAttribute('data-theme', val);
    }
  };

  const themes = [
    { id: 'green', name: 'Emerald', dot: '#3dff6e' },
    { id: 'blue', name: 'Sapphire', dot: '#3db8ff' },
    { id: 'red', name: 'Ruby', dot: '#ff3d5c' },
    { id: 'orange', name: 'Amber', dot: '#ffaa33' },
    { id: 'purple', name: 'Amethyst', dot: '#c03dff' },
  ];

  return (
    <div className="xscreen">
      <div className="xhdr">
        <button className="backbtn" onClick={onBack}>← Back</button>
        <span className="xtitle">Settings</span>
      </div>
      <div className="xscroll" style={{paddingTop: 16}}>
        
        {/* Theme Settings */}
        <div className="seclbl" style={{marginBottom: 8}}>Theme Color</div>
        <div style={{display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24}}>
          {themes.map(t => (
            <button key={t.id} 
              style={{
                flex: 1, minWidth: 80,
                background: 'var(--surf2)',
                border: `1px solid ${settings.theme === t.id ? 'var(--accent)' : 'var(--border2)'}`,
                color: settings.theme === t.id ? 'var(--accent)' : 'var(--text)',
                borderRadius: 'var(--r)',
                padding: '12px 6px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                cursor: 'pointer', transition: 'all 0.15s'
              }}
              onClick={() => updateSetting('theme', t.id)}
            >
              <div style={{width: 14, height: 14, borderRadius: '50%', background: t.dot, boxShadow: settings.theme === t.id ? `0 0 8px ${t.dot}80` : 'none'}} />
              <span style={{fontSize: 12, fontWeight: 700}}>{t.name}</span>
            </button>
          ))}
        </div>

        {/* Workout Settings */}
        <div className="seclbl" style={{marginBottom: 8}}>Workout Preferences</div>
        
        <div className="xitem" style={{justifyContent: 'space-between', padding: '12px', cursor: 'default'}}>
          <div>
            <div style={{fontSize: 14, fontWeight: 700}}>Default Rest Timer</div>
            <div style={{fontSize: 11, color: 'var(--muted)', marginTop: 2}}>Seconds to rest after a set</div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: 4}}>
            <NumInput 
              className="nin w" 
              value={settings.defaultRest} 
              onChange={v => updateSetting('defaultRest', Math.max(0, v))} 
            />
            <span style={{fontSize: 12, color: 'var(--muted)'}}>s</span>
          </div>
        </div>

        <div className="xitem" style={{justifyContent: 'space-between', padding: '12px', cursor: 'default'}}>
          <div style={{flex: 1, paddingRight: 10}}>
            <div style={{fontSize: 14, fontWeight: 700}}>Show Active Workout Timer</div>
            <div style={{fontSize: 11, color: 'var(--muted)', marginTop: 2, lineHeight: 1.3}}>
              Display the elapsed time constantly ticking at the top of the active workout screen.
            </div>
          </div>
          <button 
            style={{
              width: 44, height: 24, borderRadius: 12, border: 'none', position: 'relative',
              background: settings.showTimer ? 'var(--accent)' : 'var(--border2)',
              cursor: 'pointer', transition: 'background 0.2s'
            }}
            onClick={() => updateSetting('showTimer', !settings.showTimer)}
          >
            <div style={{
              width: 18, height: 18, borderRadius: '50%', background: settings.showTimer ? '#000' : 'var(--muted)',
              position: 'absolute', top: 3, left: settings.showTimer ? 23 : 3, transition: 'all 0.2s'
            }} />
          </button>
        </div>

      </div>
    </div>
  );
}

SettingsScreen.propTypes = {
  settings: PropTypes.shape({
    theme: PropTypes.string,
    defaultRest: PropTypes.number,
    showTimer: PropTypes.bool
  }).isRequired,
  setSettings: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired
};
