import React from 'react';
import PropTypes from 'prop-types';
import { fmtMs } from '../../utils/helpers';

export function Topbar({ session, elapsed, setSession, onHome }) {
  return (
    <div className="topbar">
      <button className="homebtn-topbar" onClick={onHome}>← Home</button>
      <input 
        className="sname-input" 
        value={session?.name || ""} 
        placeholder="Session name..."
        onChange={e => setSession(s => ({...s, name: e.target.value}))} 
      />
      <div className="topbar-r">
        <div className="live-dot" />
        <div className="clock">{fmtMs(elapsed)}</div>
      </div>
    </div>
  );
}

Topbar.propTypes = {
  session: PropTypes.object,
  elapsed: PropTypes.number.isRequired,
  setSession: PropTypes.func.isRequired,
  onHome: PropTypes.func.isRequired
};
