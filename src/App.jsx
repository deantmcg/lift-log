import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
import { SettingsScreen } from './components/settings/SettingsScreen';
import { LoginScreen } from './components/auth/LoginScreen';
import { AdminScreen } from './components/admin/AdminScreen';

import './styles/index.css';

const ADMIN_EMAIL = 'deanmcguigan@hotmail.com';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showBrowser, setShowBrowser] = useState(false);
  const [showCustom, setShowCustom] = useState(false);

  const [showRest, setShowRest] = useState(false);
  const [restEndTime, setRestEndTime] = useState(null);
  const [restTotal, setRestTotal] = useState(120);
  // Track which exercise entry started the timer so other rows don't show it as running
  const [timerEntryId, setTimerEntryId] = useState(null);

  const [settings, setSettings] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('ll_token'));
  const [loading, setLoading] = useState(true);

  const loadInitialData = () => {
    setLoading(true);
    Promise.all([storage.getSettings(), storage.getExercises()]).then(([sets, exes]) => {
      setSettings(sets);
      setAllExercises(exes);
      setRestTotal(sets.defaultRest);
      document.documentElement.setAttribute('data-theme', sets.theme);
      setLoading(false);
    }).catch(e => console.error(e));
  };

  useEffect(() => {
    if (isAuthenticated) loadInitialData();
  }, [isAuthenticated]);
  const [restRem, setRestRem] = useState(null);
  const restTickRef = useRef(null);

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

  const { session, setSession, exercises, startSession, addExercise, updateExercise, removeExercise, moveExercise, finish, cancel } = useWorkouts(allExercises);

  const isSessionRoute = location.pathname === "/session";
  const elapsed = useTimer(session?.startTime, isSessionRoute && session);

  const handleRestButton = (entryId) => {
    if (timerEntryId === entryId && restEndTime && restEndTime > Date.now() && showRest === false) {
      // Same entry, timer already running — just re-open the overlay
      setShowRest(true);
    } else {
      // New entry ticked, or same entry but timer expired — start fresh
      const dr = settings ? settings.defaultRest : 120;
      setRestEndTime(Date.now() + dr * 1000);
      setRestTotal(dr);
      setTimerEntryId(entryId);
      setShowRest(true);
    }
  };

  const handleStart = (t) => { startSession(t); navigate("/session"); };
  const handleFinish = async () => { 
    await finish(); 
    loadInitialData(); 
    navigate("/summary"); 
    setRestEndTime(null); 
    setShowRest(false); 
    setTimerEntryId(null); 
  };
  const handleCancel = () => { cancel(); navigate("/"); setRestEndTime(null); setShowRest(false); setTimerEntryId(null); };

  const addedIds = new Set(exercises.map(e => e.exerciseId));
  const doneSets = exercises.reduce((a, e) => a + e.sets.filter(s => s.done).length, 0);
  const hasActiveSession = session && !session.endTime;
  const isAdmin = settings?.email === ADMIN_EMAIL;

  if (!isAuthenticated) return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
  if (loading) return <div className="app"><div className="empty" style={{ marginTop: "50%" }}>Loading data...</div></div>;

  return (
    <div className="app">

      {isSessionRoute && session && (
        <Topbar session={session} elapsed={elapsed} setSession={setSession} onHome={() => navigate("/")} showTimer={settings.showTimer} />
      )}

      <Routes>
        <Route path="/" element={
          <Home
            onStart={() => navigate("/workouts/select")}
            onExplore={() => navigate("/explore")}
            onHistory={() => navigate("/history")}
            onMyTemplates={() => navigate("/workouts")}
            hasActiveSession={hasActiveSession}
            onResume={() => navigate("/session")}
            onSettings={() => navigate("/settings")}
            isAdmin={isAdmin}
            onAdmin={() => navigate("/admin")}
          />
        } />

        <Route path="/settings" element={
          <SettingsScreen
            settings={settings}
            setSettings={setSettings}
            onBack={() => navigate("/")}
          />
        } />

        <Route path="/workouts/select" element={
          <TemplateSelectScreen
            allExercises={allExercises}
            onStart={handleStart}
            onBack={() => navigate("/")}
          />
        } />

        <Route path="/explore" element={<ExploreScreen allExercises={allExercises} onBack={() => navigate("/")} />} />
        <Route path="/history" element={<HistoryScreen onBack={() => navigate("/")} />} />
        <Route path="/workouts" element={<MyTemplatesScreen allExercises={allExercises} onBack={() => navigate("/")} />} />

        <Route path="/summary" element={
          session
            ? <Summary session={session} onNew={() => { navigate("/"); }} />
            : <Navigate to="/" replace />
        } />

        <Route path="/admin" element={
          <AdminScreen allExercises={allExercises} onBack={() => { navigate("/"); loadInitialData(); }} />
        } />

        <Route path="/session" element={
          session
            ? <>
                <div className="exsec">
                  <div className="secbar">
                    <span className="seclbl">Exercises · {exercises.length}</span>
                    <span className="secstat">{doneSets} sets done</span>
                  </div>
                  {exercises.length === 0 && (
                    <div className="empty"><div className="emico">💪</div><div className="emtxt">Add exercises to begin</div></div>
                  )}
                  {exercises.map((entry, idx) => (
                    <ExerciseCard key={entry.entryId} entry={entry} allExercises={allExercises}
                      onUpdate={updateExercise} onRemove={() => removeExercise(entry.entryId)}
                      addedIds={addedIds}
                      onStartRest={() => handleRestButton(entry.entryId)}
                      restRem={timerEntryId === entry.entryId ? restRem : null}
                      onMoveUp={() => moveExercise(idx, -1)}
                      onMoveDown={() => moveExercise(idx, 1)}
                    />
                  ))}
                </div>
                <div className="addwrap">
                  <button className="addexbtn" onClick={() => setShowBrowser(true)}>+ Add Exercise</button>
                </div>
                <div className="botbar">
                  <button className="discbtn" onClick={handleCancel}>Cancel</button>
                  <button className="finbtn" onClick={handleFinish} disabled={exercises.length === 0}>Finish Workout</button>
                </div>
              </>
            : <Navigate to="/" replace />
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {showBrowser && (
        <Browser allExercises={allExercises} addedIds={addedIds}
          onAdd={ex => { addExercise(ex); }}
          onClose={() => setShowBrowser(false)}
          onOpenCustom={() => { setShowBrowser(false); setShowCustom(true); }}
        />
      )}

      {showCustom && (
        <div className="moverlay">
          <CustomModal
            onSave={async ex => { await storage.saveCustomExercise(ex); setAllExercises(await storage.getExercises()); addExercise(ex); setShowCustom(false); }}
            onClose={() => { setShowCustom(false); setShowBrowser(true); }}
          />
        </div>
      )}

      {showRest && restEndTime && (
        <RestTimer
          endTime={restEndTime}
          total={restTotal}
          onSetTotal={(s) => { setRestTotal(s); setRestEndTime(Date.now() + s * 1000); }}
          onClose={() => setShowRest(false)}
          onSkip={() => { setRestEndTime(null); setShowRest(false); setTimerEntryId(null); }}
        />
      )}
    </div>
  );
}

