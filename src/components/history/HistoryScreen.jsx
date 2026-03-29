import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { storage } from '../../services/storage';
import { fmtMs, fmtDate, makeEntry } from '../../utils/helpers';
import { constants } from '../../data/constants';
import { ExerciseCard } from '../workout/ExerciseCard';
import { Browser } from '../workout/Browser';
import { CustomModal } from '../workout/CustomModal';

function SessionEditScreen({ origSession, onSave, onCancel }) {
  const [session, setSession] = useState(() => ({ ...origSession }));
  const [exercises, setExercises] = useState(() => origSession.exercises.map(e => ({ ...e, sets: e.sets.map(s => ({...s})) })));
  
  const toDTL = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const [startTime, setStartTime] = useState(() => toDTL(origSession.startTime));
  const [endTime, setEndTime] = useState(() => toDTL(origSession.endTime));
  const [allExercises, setAllExercises] = useState([]);
  useEffect(() => { storage.getExercises().then(setAllExercises); }, []);
  const addedIds = new Set(exercises.map(e=>e.exerciseId));
  const updateExercise = (u) => setExercises(p=>p.map(e=>e.entryId===u.entryId?u:e));
  const removeExercise = (id) => setExercises(p=>p.filter(e=>e.entryId!==id));
  const addExercise = (ex) => setExercises(p=>[...p, makeEntry(ex)]);
  const [showBrowser, setShowBrowser] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const doneSets = exercises.reduce((a,e)=>a+e.sets.filter(s=>s.done).length,0);
  
  return (
    <div className="xscreen">
      <div className="xhdr">
        <button className="backbtn" onClick={onCancel}>Cancel</button>
        <input className="sname-input" value={session.name} placeholder="Session name..."
          onChange={e=>setSession(s=>({...s,name:e.target.value}))} style={{flex:1,marginLeft:8}} />
        <button className="hist-save-btn" onClick={async ()=>{
          const updated = { 
            ...session, 
            exercises, 
            startTime: new Date(startTime).getTime(),
            endTime: new Date(endTime).getTime()
          };
          await storage.saveSession(updated);
          onSave(updated);
        }}>Save</button>
      </div>
      <div className="xscroll">
        <div style={{padding: "0 12px", marginBottom: 12}}>
          <div className="flbl">Start Time</div>
          <input className="fin" type="datetime-local" value={startTime} onChange={e=>setStartTime(e.target.value)} />
          <div className="flbl" style={{marginTop:8}}>End Time</div>
          <input className="fin" type="datetime-local" value={endTime} onChange={e=>setEndTime(e.target.value)} />
        </div>
        <div className="secbar">
          <span className="seclbl">Exercises · {exercises.length}</span>
          <span className="secstat">{doneSets} sets done</span>
        </div>
        {exercises.length===0 && (
          <div className="empty"><div className="emico">💪</div><div className="emtxt">Add exercises to begin</div></div>
        )}
        {exercises.map(entry=>(
          <ExerciseCard
            key={entry.entryId}
            entry={entry}
            allExercises={allExercises}
            onUpdate={updateExercise}
            onRemove={()=>removeExercise(entry.entryId)}
            addedIds={addedIds}
            onStartRest={null}
            restRem={null}
            editMode={true}
          />
        ))}
        <div className="addwrap">
          <button className="addexbtn" onClick={()=>setShowBrowser(true)}>+ Add Exercise</button>
        </div>
      </div>
      {showBrowser && (
        <Browser allExercises={allExercises} addedIds={addedIds}
          onAdd={ex=>{addExercise(ex);setShowBrowser(false);}}
          onClose={()=>setShowBrowser(false)}
          onOpenCustom={()=>{setShowBrowser(false);setShowCustom(true);}}
        />
      )}
      {showCustom && (
        <div className="moverlay">
          <CustomModal
            onSave={async ex=>{await storage.saveCustomExercise(ex); setAllExercises(await storage.getExercises()); addExercise(ex); setShowCustom(false);}}
            onClose={()=>{setShowCustom(false);setShowBrowser(true);}}
          />
        </div>
      )}
    </div>
  );
}

SessionEditScreen.propTypes = {
  origSession: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

function HistoryDetail({ session, onBack }) {
  const totalSets = session.exercises.reduce((a,e)=>a+e.sets.filter(s=>s.done).length,0);
  const totalVol  = session.exercises.reduce((a,e)=>a+e.sets.filter(s=>s.done).reduce((b,s)=>b+s.reps*s.weight,0),0);
  const startTs   = new Date(session.startTime).getTime();
  const endTs     = new Date(session.endTime).getTime();
  const dur       = (startTs && endTs) ? endTs - startTs : 0;
  const [editing, setEditing] = useState(false);
  
  if (editing) {
    return (
      <SessionEditScreen
        origSession={session}
        onSave={(updated) => { setEditing(false); onBack(updated); }}
        onCancel={() => setEditing(false)}
      />
    );
  }
  
  return (
    <div className="xscreen">
      <div className="xhdr">
        <button className="backbtn" onClick={() => onBack()}>← Back</button>
        <span className="xtitle" style={{fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{session.name}</span>
        <button className="hist-edit-btn" onClick={()=>setEditing(true)} style={{marginLeft:'auto'}}>Edit</button>
      </div>
      <div className="xscroll">
        <div className="statgrid" style={{marginBottom:12}}>
          <div className="statcard"><div className="statval">{fmtMs(dur)}</div><div className="statlbl">Duration</div></div>
          <div className="statcard"><div className="statval">{totalSets}</div><div className="statlbl">Sets Done</div></div>
          <div className="statcard"><div className="statval">{session.exercises.length}</div><div className="statlbl">Exercises</div></div>
          <div className="statcard"><div className="statval">{totalVol>0?`${(totalVol/1000).toFixed(1)}t`:"—"}</div><div className="statlbl">Volume</div></div>
        </div>
        <div className="sumexes">
          {session.exercises.map(e=>{
            const done=e.sets.filter(s=>s.done);
            const top=done.length?Math.max(...done.map(s=>s.weight)):0;
            const mc=constants.MUSCLE_COLORS[e.muscleGroup]||{};
            return (
              <div key={e.entryId} className="seitem">
                <div>
                  <div className="sename">{e.name}</div>
                  <div className="semeta">{done.length} sets{top>0?` · ${top}kg`:""}</div>
                </div>
                <span className="mtag" style={{background:mc.bg,borderColor:mc.border,color:mc.text}}>{e.muscleGroup}</span>
              </div>
            );
          })}
        </div>
        <div style={{padding: "16px 12px"}}>
          <button className="discbtn" style={{width:"100%", background:"#221111", color:"#ff4444", borderColor:"#442222"}} 
            onClick={async ()=>{
              if (!confirm("Delete this session forever?")) return;
              await storage.deleteSession(session.id);
              onBack(null); // signal deletion
            }}>Delete Session</button>
        </div>
      </div>
    </div>
  );
}

HistoryDetail.propTypes = {
  session: PropTypes.object.isRequired,
  onBack: PropTypes.func.isRequired
};

export function HistoryScreen({ onBack }) {
  const [sessions, setSessions] = useState([]);
  const [selected, setSelected] = useState(null);
  
  useEffect(() => { 
    storage.getSessions().then(setSessions); 
  }, []);

  if (selected) {
    return (
      <HistoryDetail
        session={selected}
        onBack={(updated) => {
          if (updated === null) {
            // Deleted
            setSessions(s => s.filter(x => x.id !== selected.id));
            setSelected(null);
          } else if (updated && updated.id) {
            setSessions(s => s.map(x => x.id === updated.id ? updated : x));
            setSelected(updated);
          } else {
            setSelected(null);
          }
        }}
      />
    );
  }

  return (
    <div className="xscreen">
      <div className="xhdr">
        <button className="backbtn" onClick={onBack}>← Back</button>
        <span className="xtitle">History</span>
      </div>
      <div className="xscroll">
        {sessions.length===0 && (
          <div className="empty" style={{marginTop:40}}>
            <div className="emico">📋</div>
            <div className="emtxt">No completed workouts yet</div>
          </div>
        )}
        {sessions.map(s=>{
          const vol=s.exercises?.reduce((a,e)=>a+(e.sets||[]).filter(x=>x.done).reduce((b,x)=>b+x.reps*x.weight,0),0)||0;
          const sTs = new Date(s.startTime).getTime();
          const eTs = new Date(s.endTime).getTime();
          const dur = (sTs && eTs) ? eTs - sTs : 0;
          const totalSets=s.exercises?.reduce((a,e)=>a+(e.sets||[]).filter(x=>x.done).length,0)||0;
          return (
            <div key={s.id} className="histitem" onClick={()=>setSelected(s)}>
              <div style={{flex:1,minWidth:0}}>
                <div className="recname">{s.name}</div>
                <div className="recmeta">
                  {fmtDate(new Date(s.startTime))} · {s.exercises?.length||0} exercises · {totalSets} sets{dur>0?` · ${fmtMs(dur)}`:""}
                </div>
              </div>
              {vol>0 && <div className="recvol">{(vol/1000).toFixed(1)}t</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

HistoryScreen.propTypes = {
  onBack: PropTypes.func.isRequired
};
