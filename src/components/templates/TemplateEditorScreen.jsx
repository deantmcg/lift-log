import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { storage } from '../../services/storage';
import { uid } from '../../utils/helpers';
import { constants } from '../../data/constants';
import { NumInput } from '../common/NumInput';
import { Browser } from '../workout/Browser';

export function TemplateEditorScreen({ allExercises, template, onSave, onBack }) {
  const isNew = !template;
  const exMap = new Map(allExercises.map(e => [e.id, e]));
  const [name, setName] = useState(template?.name || "");
  const [entries, setEntries] = useState(
    (template?.exercises || []).map(te => ({
      ...te,
      _name: exMap.get(te.exerciseId)?.name || te.exerciseId,
      _muscleGroup: exMap.get(te.exerciseId)?.muscleGroup || "",
    }))
  );
  const [showPicker, setShowPicker] = useState(false);

  const addExercise = (ex) => {
    setEntries(p => [...p, { 
      exerciseId: ex.id, 
      _name: ex.name, 
      _muscleGroup: ex.muscleGroup, 
      targetSets: constants.DEFAULT_TARGET_SETS, 
      targetReps: constants.DEFAULT_TARGET_REPS, 
      targetWeight: constants.DEFAULT_TARGET_WEIGHT 
    }]);
    setShowPicker(false);
  };
  const removeEntry = (idx) => setEntries(p => p.filter((_, i) => i !== idx));
  const updateEntry = (idx, field, val) => setEntries(p => p.map((e, i) => i === idx ? { ...e, [field]: +val || 0 } : e));

  const save = async () => {
    if (!name.trim() || entries.length === 0) return;
    const t = {
      id: template?.id,
      name: name.trim(),
      exercises: entries.map(({ exerciseId, targetSets, targetReps, targetWeight }) => ({ exerciseId, targetSets, targetReps, targetWeight })),
    };
    await storage.saveUserTemplate(t);
    onSave();
  };

  const addedIds = new Set(entries.map(e => e.exerciseId));

  return (
    <div className="xscreen">
      <div className="xhdr">
        <button className="backbtn" onClick={onBack}>← Back</button>
        <span className="xtitle">{isNew ? "New Template" : "Edit Template"}</span>
      </div>
      <div className="xscroll">
        <div style={{marginBottom:12}}>
          <div className="flbl">Template name</div>
          <input className="fin" placeholder="e.g. Monday Push..." value={name} onChange={e=>setName(e.target.value)} autoFocus />
        </div>

        <div className="flbl" style={{marginBottom:5}}>Exercises · {entries.length}</div>
        {entries.length === 0 && (
          <div style={{textAlign:"center",padding:"16px 0",color:"var(--muted)",fontSize:11}}>Add exercises below</div>
        )}
        {entries.map((te, idx) => {
          const mc = constants.MUSCLE_COLORS[te._muscleGroup] || {};
          return (
            <div key={idx} className="tpe-row">
              <div className="tpe-info">
                <div className="tpe-name">{te._name}</div>
                {te._muscleGroup && <span className="mtag" style={{background:mc.bg,borderColor:mc.border,color:mc.text,fontSize:7,marginTop:3,display:"inline-block"}}>{te._muscleGroup}</span>}
              </div>
              <div className="tpe-inputs">
                <NumInput className="nin" value={te.targetSets} onChange={v=>updateEntry(idx,"targetSets",v)} />
                <span className="sp">×</span>
                <NumInput className="nin" value={te.targetReps} onChange={v=>updateEntry(idx,"targetReps",v)} />
                <span className="sp">@</span>
                <NumInput className="nin w" value={te.targetWeight} step={2.5} onChange={v=>updateEntry(idx,"targetWeight",v)} />
                <span className="sp" style={{marginLeft:1}}>kg</span>
              </div>
              <button className="tpe-rm" onClick={()=>removeEntry(idx)}>−</button>
            </div>
          );
        })}

        <button className="addexbtn" style={{marginTop:4}} onClick={()=>setShowPicker(true)}>+ Add Exercise</button>

        <button className="new-tmpl-btn" onClick={save} disabled={!name.trim() || entries.length === 0}>
          {isNew ? "Create Template" : "Save Changes"}
        </button>
      </div>

      {showPicker && (
        <Browser
          allExercises={allExercises}
          addedIds={addedIds}
          onAdd={addExercise}
          onClose={()=>setShowPicker(false)}
          onOpenCustom={()=>setShowPicker(false)}
        />
      )}
    </div>
  );
}

TemplateEditorScreen.propTypes = {
  allExercises: PropTypes.array.isRequired,
  template: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired
};
