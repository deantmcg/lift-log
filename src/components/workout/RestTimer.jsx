import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { pad } from '../../utils/helpers';
import { constants } from '../../data/constants';

const fmtPreset = (s) => s === 120 ? "2 min" : s === 180 ? "3 min" : `${s}s`;

export function RestTimer({ endTime, total, onSetTotal, onClose, onSkip }) {
  const [rem, setRem] = useState(() => Math.max(0, Math.ceil((endTime - Date.now()) / 1000)));
  const tickRef = useRef(null);

  useEffect(() => {
    const tick = () => setRem(Math.max(0, Math.ceil((endTime - Date.now()) / 1000)));
    tick();
    tickRef.current = setInterval(tick, 500);
    return () => clearInterval(tickRef.current);
  }, [endTime]);

  const r = 76, circ = 2 * Math.PI * r;
  const pct = total > 0 ? rem / total : 0;
  const offset = circ * (1 - pct);
  const urgent = rem <= 10 && rem > 0;
  const overtime = rem === 0;

  return (
    <div className="rest-overlay" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
        <div className="rest-lbl">Rest Timer</div>
        <div className="rest-ring">
          <svg className="rest-svg" width="170" height="170" viewBox="0 0 170 170">
            <circle className="rest-bg" cx="85" cy="85" r={r} />
            <circle className={`rest-arc ${urgent?"urgent":""} ${overtime?"overtime":""}`}
              cx="85" cy="85" r={r} strokeDasharray={circ} strokeDashoffset={offset} />
          </svg>
          <div className={`rest-num ${urgent?"urgent":""} ${overtime?"overtime":""}`}>
            {pad(Math.floor(rem/60))}:{pad(rem%60)}
          </div>
        </div>
        {overtime && <div className="rest-done">▶ Next Set</div>}
        <div className="rest-presets">
          {constants.REST_PRESETS.map(p => (
            <button key={p} className={`rp-btn ${total===p?"active":""}`} onClick={() => onSetTotal(p)}>{fmtPreset(p)}</button>
          ))}
        </div>
        <div className="rest-btns">
          <button className="rb rb-close" onClick={onClose}>Close</button>
          <button className="rb rb-skip" onClick={onSkip}>
            {overtime ? "Done" : "Skip"}
          </button>
        </div>
      </div>
    </div>
  );
}

RestTimer.propTypes = {
  endTime: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  onSetTotal: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onSkip: PropTypes.func.isRequired
};
