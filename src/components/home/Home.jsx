import React from 'react';
import PropTypes from 'prop-types';
import { storage } from '../../services/storage';
import { fmtDate } from '../../utils/helpers';

export function Home({ onStart, onExplore, onHistory, onMyTemplates, hasActiveSession, onResume }) {
  const recent = storage.getSessions().slice(-3).reverse();
  return (
    <div className="home">
      <div className="homelogo">Lift<br/>Log</div>
      <div className="homesub">Track your gains</div>
      {hasActiveSession && (
        <button className="resumebtn" onClick={onResume}>▶ Resume Workout</button>
      )}
      <button className="startbtn" onClick={onStart}>
        {hasActiveSession ? "New Workout" : "Start Workout"}
      </button>
      <div className="home-actions">
        <button className="homebtn" onClick={onHistory}>Past Sessions</button>
        <button className="homebtn" onClick={onMyTemplates}>My Workouts</button>
        <button className="homebtn" onClick={onExplore}>Exercises</button>
      </div>
      {recent.length > 0 && (
        <div className="recent">
          <div className="reclbl">Recent</div>
          {recent.map(s => {
            const vol = s.exercises?.reduce((a,e) => Math.max(0, a + (e.sets||[]).filter(x=>x.done).reduce((b,x)=>b+x.reps*x.weight,0)), 0) || 0;
            return (
              <div key={s.id} className="recitem">
                <div>
                  <div className="recname">{s.name}</div>
                  <div className="recmeta">{fmtDate(new Date(s.startTime))} · {s.exercises?.length||0} exercises</div>
                </div>
                {vol > 0 && <div className="recvol">{(vol/1000).toFixed(1)}t</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

Home.propTypes = {
  onStart: PropTypes.func.isRequired,
  onExplore: PropTypes.func.isRequired,
  onHistory: PropTypes.func.isRequired,
  onMyTemplates: PropTypes.func.isRequired,
  hasActiveSession: PropTypes.bool.isRequired,
  onResume: PropTypes.func.isRequired
};
