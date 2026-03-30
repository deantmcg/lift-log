import React from 'react';
import PropTypes from 'prop-types';
import { storage } from '../../services/storage';
import { NumInput } from '../common/NumInput';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';
import { updateManifestTheme } from '../../utils/updateManifest';

export function SettingsScreen({ settings, setSettings, onBack }) {
  const { installPrompt, isInstalled, prompt } = useInstallPrompt();

  // Detect iOS Safari (no beforeinstallprompt support)
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const showIosTutorial = isIos && !isInstalled;

  const updateSetting = async (key, val) => {
    const next = { ...settings, [key]: val };
    setSettings(next);
    await storage.saveSettings(next);
    if (key === 'theme') {
      document.documentElement.setAttribute('data-theme', val);
      updateManifestTheme(val);
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

        <div className="seclbl" style={{marginBottom: 8, marginTop: 32}}>Install App</div>

        {isInstalled ? (
          <div className="xitem" style={{padding: '14px', cursor: 'default', gap: 10}}>
            <span style={{fontSize: 18}}>✅</span>
            <div>
              <div style={{fontSize: 14, fontWeight: 700}}>App Installed</div>
              <div style={{fontSize: 11, color: 'var(--muted)', marginTop: 2}}>Lift Log is running as an installed app.</div>
            </div>
          </div>
        ) : installPrompt ? (
          <div>
            <div className="xitem" style={{padding: '12px', cursor: 'default', marginBottom: 8}}>
              <div style={{flex: 1, paddingRight: 10}}>
                <div style={{fontSize: 14, fontWeight: 700}}>Add to Home Screen</div>
                <div style={{fontSize: 11, color: 'var(--muted)', marginTop: 2, lineHeight: 1.3}}>
                  Install Lift Log for a full-screen, app-like experience.
                </div>
              </div>
            </div>
            <button
              onClick={prompt}
              style={{
                width: '100%', padding: '14px',
                background: 'var(--accent)', color: '#000',
                border: 'none', borderRadius: 'var(--r)',
                fontWeight: 700, fontSize: 14, cursor: 'pointer'
              }}
            >
              Install App
            </button>
          </div>
        ) : showIosTutorial ? (
          <div className="xitem" style={{padding: '14px', cursor: 'default', flexDirection: 'column', alignItems: 'flex-start', gap: 10}}>
            <div style={{fontSize: 14, fontWeight: 700}}>Add to Home Screen (iOS)</div>
            <div style={{fontSize: 12, color: 'var(--muted)', lineHeight: 1.5}}>
              To install Lift Log on your iPhone or iPad:
            </div>
            <ol style={{margin: 0, paddingLeft: 18, fontSize: 12, color: 'var(--text)', lineHeight: 2}}>
              <li>Tap the <strong>Share</strong> button <span style={{fontSize: 14}}>⬆</span> at the bottom of Safari</li>
              <li>Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong></li>
              <li>Tap <strong>&quot;Add&quot;</strong> to confirm</li>
            </ol>
          </div>
        ) : (
          <div className="xitem" style={{padding: '14px', cursor: 'default', flexDirection: 'column', alignItems: 'flex-start', gap: 8}}>
            <div style={{fontSize: 14, fontWeight: 700}}>Add to Home Screen</div>
            <div style={{fontSize: 12, color: 'var(--muted)', lineHeight: 1.5}}>
              To install Lift Log, open this page in your browser and look for the <strong>Add to Home Screen</strong> or <strong>Install App</strong> option in the browser menu.
            </div>
          </div>
        )}

        <div className="seclbl" style={{marginBottom: 8, marginTop: 32}}>Account</div>
        <button 
          onClick={() => storage.logout()}
          style={{ width: '100%', padding: '14px', background: '#ff3d5c20', color: '#ff3d5c', border: '1px solid #ff3d5c40', borderRadius: 'var(--r)', fontWeight: 700, cursor: 'pointer' }}
        >
          Log Out
        </button>

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
