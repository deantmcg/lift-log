import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { storage } from '../../services/storage';
import { TemplateEditorScreen } from './TemplateEditorScreen';

export function MyTemplatesScreen({ allExercises, onBack }) {
  const [templates, setTemplates] = useState([]);
  const [editing, setEditing] = useState(null); // null = list, false = new, obj = edit

  const reload = () => storage.getUserTemplates().then(all => setTemplates(all.filter(w => w.isCustom)));
  
  useEffect(() => { 
    reload(); 
  }, []);

  if (editing !== null) {
    return (
      <TemplateEditorScreen
        allExercises={allExercises}
        template={editing || undefined}
        onSave={() => { reload(); setEditing(null); }}
        onBack={() => setEditing(null)}
      />
    );
  }

  return (
    <div className="xscreen">
      <div className="xhdr">
        <button className="backbtn" onClick={onBack}>← Back</button>
        <span className="xtitle">My Workouts</span>
      </div>
      <div className="xscroll">
        {templates.length === 0 ? (
          <div className="tmpl-empty-state">
            <div className="tmpl-empty-icon">📋</div>
            <div className="tmpl-empty-txt">No templates yet</div>
            <button className="new-tmpl-btn" style={{maxWidth:220,margin:"0 auto",display:"block"}} onClick={()=>setEditing(false)}>
              + Create Template
            </button>
          </div>
        ) : (
          <>
            {(() => {
              const exMap = new Map(allExercises.map(e => [e.id, e]));
              return templates.map(t => {
                const names = t.exercises.map(te => exMap.get(te.exerciseId)?.name).filter(Boolean);
                return (
                  <div key={t.id} className="tmpl-edit-row">
                    <div className="tmpl-edit-info">
                      <div className="tmpl-edit-name">{t.name}</div>
                      <div className="tmpl-edit-meta">{names.join(" · ") || "No exercises"}</div>
                    </div>
                    <div className="tmpl-edit-btns">
                      <button className="tmpl-edit-btn" onClick={()=>setEditing(t)}>Edit</button>
                      <button className="tmpl-edit-btn del" onClick={async ()=>{ await storage.deleteUserTemplate(t.id); reload(); }}>Delete</button>
                    </div>
                  </div>
                );
              });
            })()}
            <button className="new-tmpl-btn" onClick={()=>setEditing(false)}>+ New Template</button>
          </>
        )}
      </div>
    </div>
  );
}

MyTemplatesScreen.propTypes = {
  allExercises: PropTypes.array.isRequired,
  onBack: PropTypes.func.isRequired
};
