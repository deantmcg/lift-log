import React, { useState, useEffect, useRef } from 'react';
import { storage } from './services/storage';
import { useTimer } from './hooks/useTimer';
import { useWorkouts } from './hooks/useWorkouts';

import { Topbar } from './components/common/Topbar';
import { Home } from './components/home/Home';
import { ExploreScreen } from './components/explore/ExploreScreen';
import { HistoryScreen } from './components/history/HistoryScreen';
import { MyTemplatesScreen } from './components/templates/MyTemplatesScreen';
import { TemplateSelectScreen } from './components/templates/TemplateSelectScreen';
import { Summary } from './components/history/Summary';
import { ExerciseCard } from './components/workout/ExerciseCard';
import { Browser } from './components/workout/Browser';
import { CustomModal } from './components/workout/CustomModal';
import { RestTimer } from './components/workout/RestTimer';

import './styles/index.css';

export default function App() {
  const [screen, setScreen]             = useState("home");
  const [showBrowser, setShowBrowser]   = useState(false);
  const [showCustom, setShowCustom]     = useState(false);
  
  const [showRest, setShowRest]         = useState(false);
  const [restEndTime, setRestEndTime]   = useState(null);
  const [restTotal, setRestTotal]       = useState(120);
  const [restRem, setRestRem]           = useState(null);
  const restTickRef                     = useRef(null);

  useEffect(() => {
    clearInterval(restTickRef.current);
    if (!restEndTime) { setRestRem(null); return; }
    const tick = () => {
      const rem = Math.max(0, Math.ceil((restEndTime - Date.now()) / 1000));
      setRestRem(rem);
      if (rem === 0) { clearInterval(restTickRef.current); setShowRest(true); }
    };
    tick();
    restTickRef.current = setInterval(tick, 500);
    return () => clearInterval(restTickRef.current);
  }, [restEndTime]);

  const [allExercises, setAllExercises] = useState([]);

  useEffect(() => { setAllExercises(storage.getExercises()); }, []);

  const { session, setSession, exercises, startSession, addExercise, updateExercise, removeExercise, finish, cancel } = useWorkouts(allExercises);

  const elapsed = useTimer(session?.startTime, screen === "session" && session);

  const handleRestButton = () => {
    if (restEndTime && restEndTime > Date.now() && showRest === false) {
      setShowRest(true);
    } else {
      setRestEndTime(Date.now() + restTotal * 1000);
      setShowRest(true);
    }
  };

  const handleStart = (t) => { startSession(t); setScreen("session"); };
  const handleFinish = () => { finish(); setScreen("summary"); setRestEndTime(null); setShowRest(false); };
  const handleCancel = () => { cancel(); setScreen("home"); setRestEndTime(null); setShowRest(false); };

  const addedIds = new Set(exercises.map(e=>e.exerciseId));
  const doneSets = exercises.reduce((a,e)=>a+e.sets.filter(s=>s.done).length,0);
  const hasActiveSession = session && !session.endTime;

  return (
    <div className="app">

      {screen==="session" && (
        <Topbar session={session} elapsed={elapsed} setSession={setSession} onHome={() => setScreen("home")} />
      )}

      {screen==="home" && (
        <Home
          onStart={()=>setScreen("templateselect")}
          onExplore={()=>setScreen("explore")}
          onHistory={()=>setScreen("history")}
          onMyTemplates={()=>setScreen("mytemplates")}
          hasActiveSession={hasActiveSession}
          onResume={()=>setScreen("session")}
        />
      )}
      
      {screen==="templateselect" && (
        <TemplateSelectScreen
          allExercises={allExercises}
          onStart={handleStart}
          onBack={()=>setScreen("home")}
        />
      )}
      
      {screen==="explore" && <ExploreScreen allExercises={allExercises} onBack={()=>setScreen("home")} />}
      {screen==="history" && <HistoryScreen onBack={()=>setScreen("home")} />}
      {screen==="mytemplates" && <MyTemplatesScreen allExercises={allExercises} onBack={()=>setScreen("home")} />}
      {screen==="summary" && session && <Summary session={session} onNew={()=>{setScreen("home");}} />}

      {screen==="session" && session && <>
        <div className="exsec">
          <div className="secbar">
            <span className="seclbl">Exercises · {exercises.length}</span>
            <span className="secstat">{doneSets} sets done</span>
          </div>
          {exercises.length===0 && (
            <div className="empty"><div className="emico">💪</div><div className="emtxt">Add exercises to begin</div></div>
          )}
          {exercises.map(entry=>(
            <ExerciseCard key={entry.entryId} entry={entry} allExercises={allExercises}
              onUpdate={updateExercise} onRemove={()=>removeExercise(entry.entryId)}
              addedIds={addedIds} onStartRest={handleRestButton} restRem={restRem} />
          ))}
        </div>
        <div className="addwrap">
          <button className="addexbtn" onClick={()=>setShowBrowser(true)}>+ Add Exercise</button>
        </div>
        <div className="botbar">
          <button className="discbtn" onClick={handleCancel}>Cancel</button>
          <button className="finbtn" onClick={handleFinish} disabled={exercises.length===0}>Finish Workout</button>
        </div>
      </>}

      {showBrowser && (
        <Browser allExercises={allExercises} addedIds={addedIds}
          onAdd={ex=>{addExercise(ex);}}
          onClose={()=>setShowBrowser(false)}
          onOpenCustom={()=>{setShowBrowser(false);setShowCustom(true);}}
        />
      )}
      
      {showCustom && (
        <div className="moverlay">
          <CustomModal
            onSave={ex=>{setAllExercises(storage.getExercises());addExercise(ex);setShowCustom(false);}}
            onClose={()=>{setShowCustom(false);setShowBrowser(true);}}
          />
        </div>
      )}
      
      {showRest && restEndTime && (
        <RestTimer
          endTime={restEndTime}
          total={restTotal}
          onSetTotal={(s) => { setRestTotal(s); setRestEndTime(Date.now() + s * 1000); }}
          onClose={() => setShowRest(false)}
          onSkip={() => { setRestEndTime(null); setShowRest(false); }}
        />
      )}
    </div>
  );
}
