import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { storage } from '../../services/storage';
import { fmtMs, fmtDate } from '../../utils/helpers';

export function Summary({ session, onNew }) {
  const [prev, setPrev] = useState([]);
  useEffect(() => {
    storage.getSessions().then(sess => setPrev(sess.filter(s => s.id !== session.id)));
  }, [session.id]);

  const totalSets = session.exercises.reduce((a,e)=>a+e.sets.filter(s=>s.done).length,0);
  const totalVol  = session.exercises.reduce((a,e)=>a+e.sets.filter(s=>s.done).reduce((b,s)=>b+s.reps*s.weight,0),0);
  const dur = session.endTime - session.startTime;
  const prs = [];
  
  session.exercises.forEach(entry => {
    const maxNow = Math.max(...entry.sets.filter(s=>s.done).map(s=>s.weight),0);
    if (!maxNow) return;
    const prevMax = prev.reduce((best,sess) => {
      const m = sess.exercises?.find(e=>e.exerciseId===entry.exerciseId);
      if (!m) return best;
      return Math.max(best,...(m.sets||[]).filter(s=>s.done).map(s=>s.weight),0);
    },0);
    if (maxNow>prevMax) prs.push({name:entry.name,weight:maxNow});
  });

  return (
    <div className="summary">
      <div className="sumhdr">
        <div className="sumicon">🏆</div>
        <div className="sumtitle">Complete</div>
        <div className="sumdate">{session.name} · {fmtDate(new Date(session.startTime))}</div>
      </div>
      <div className="statgrid">
        <div className="statcard"><div className="statval">{fmtMs(dur)}</div><div className="statlbl">Duration</div></div>
        <div className="statcard"><div className="statval">{totalSets}</div><div className="statlbl">Sets Done</div></div>
        <div className="statcard"><div className="statval">{session.exercises.length}</div><div className="statlbl">Exercises</div></div>
        <div className="statcard"><div className="statval">{totalVol>0?`${(totalVol/1000).toFixed(1)}t`:"—"}</div><div className="statlbl">Volume</div></div>
      </div>
      {prs.length>0 && (
        <div className="prsec">
          <div className="seclbl" style={{marginBottom:5}}>🎉 New PRs</div>
          {prs.map((pr,i)=>(
            <div key={i} className="pritem">
              <span>🥇</span><span className="prname">{pr.name}</span>
              <span className="prw">{pr.weight}kg</span>
            </div>
          ))}
        </div>
      )}
      <div className="sumexes">
        {session.exercises.map(e=>{
          const done=e.sets.filter(s=>s.done);
          const top=done.length?Math.max(...done.map(s=>s.weight)):0;
          return (
            <div key={e.entryId} className="seitem">
              <div className="sename">{e.name}</div>
              <div className="semeta">{done.length} sets{top>0?` · ${top}kg`:""}</div>
            </div>
          );
        })}
      </div>
      <button className="newbtn" onClick={onNew}>New Workout</button>
    </div>
  );
}

Summary.propTypes = {
  session: PropTypes.object.isRequired,
  onNew: PropTypes.func.isRequired
};
