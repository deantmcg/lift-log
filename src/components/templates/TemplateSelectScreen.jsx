import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { storage } from '../../services/storage';

export function TemplateSelectScreen({ allExercises, onStart, onBack }) {
  const [systemWorkouts, setSystemWorkouts] = useState([]);
  const [userWorkouts, setUserWorkouts] = useState([]);
  useEffect(() => {
    storage.getUserTemplates().then(all => {
      setSystemWorkouts(all.filter(w => !w.isCustom));
      setUserWorkouts(all.filter(w => w.isCustom));
    });
  }, []);
  const exMap = new Map(allExercises.map(e => [e.id, e]));

  return (
    <div className="xscreen">
      <div className="xhdr">
        <button className="backbtn" onClick={onBack}>← Back</button>
        <span className="xtitle">Start Workout</span>
      </div>
      <div className="xscroll">
        <div className="grplbl">Quick Start</div>
        <div className="tmpl-item" onClick={()=>onStart(null)}>
          <div className="tmpl-info">
            <div className="tmpl-name">Empty Workout</div>
            <div className="tmpl-exes">Start fresh — add exercises manually</div>
          </div>
          <div className="tmpl-arr">+</div>
        </div>
        
        {userWorkouts.length > 0 && (
          <>
            <div className="grplbl" style={{marginTop:10}}>Your workouts</div>
            {userWorkouts.map(t=>{
              const names = t.exercises.map(te=>exMap.get(te.exerciseId)?.name).filter(Boolean);
              return (
                <div key={t.id} className="tmpl-item" onClick={()=>onStart(t)}>
                  <div className="tmpl-info">
                    <div className="tmpl-name">{t.name}</div>
                    <div className="tmpl-exes">{names.join(" · ")}</div>
                  </div>
                  <div className="tmpl-arr">→</div>
                </div>
              );
            })}
          </>
        )}
        
        <div className="grplbl" style={{marginTop:10}}>Preset workouts</div>
        {systemWorkouts.map(t=>{
          const names = t.exercises.map(te=>exMap.get(te.exerciseId)?.name).filter(Boolean);
          return (
            <div key={t.id} className="tmpl-item" onClick={()=>onStart(t)}>
              <div className="tmpl-info">
                <div className="tmpl-name">{t.name}</div>
                <div className="tmpl-exes">{names.join(" · ")}</div>
              </div>
              <div className="tmpl-arr">→</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

TemplateSelectScreen.propTypes = {
  allExercises: PropTypes.array.isRequired,
  onStart: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired
};
