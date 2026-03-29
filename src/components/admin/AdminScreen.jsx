import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { storage } from '../../services/storage';

export function AdminScreen({ allExercises, onBack }) {
  const [exercises, setExercises] = useState(allExercises.filter(e => !e.isCustom));
  const [editing, setEditing] = useState(null); // null or exercise object
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', muscleGroup: '', equipment: '', category: '', description: '' });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const reload = async () => {
    const all = await storage.getExercises();
    setExercises(all.filter(e => !e.isCustom));
  };

  const openEdit = (ex) => {
    setEditing(ex);
    setCreating(false);
    setForm({ name: ex.name, muscleGroup: ex.muscleGroup, equipment: ex.equipment, category: ex.category, description: ex.description || '' });
    setError(null);
  };

  const openCreate = () => {
    setEditing(null);
    setCreating(true);
    setForm({ name: '', muscleGroup: '', equipment: '', category: '', description: '' });
    setError(null);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return setError('Name is required');
    setSaving(true);
    try {
      if (editing) {
        await storage.adminUpdateExercise(editing.id, form);
      } else {
        await storage.adminCreateExercise(form);
      }
      setEditing(null);
      setCreating(false);
      await reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this exercise? This cannot be undone.')) return;
    await storage.adminDeleteExercise(id);
    await reload();
  };

  const muscleGroups = [...new Set(allExercises.map(e => e.muscleGroup))].sort();
  const equipmentList = [...new Set(allExercises.map(e => e.equipment))].sort();
  const categories = [...new Set(allExercises.map(e => e.category))].sort();

  const isFormOpen = editing || creating;

  return (
    <div className="xscreen">
      <div className="xhdr">
        <button className="backbtn" onClick={onBack}>← Back</button>
        <span className="xtitle">⚙ Admin</span>
      </div>
      <div className="xscroll">

        {isFormOpen && (
          <div className="admin-form">
            <div className="flbl">{editing ? 'Edit Exercise' : 'New Exercise'}</div>
            {error && <div style={{color:'red',fontSize:11,marginBottom:6}}>{error}</div>}
            <input className="fin" placeholder="Name" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
            <select className="fin" value={form.muscleGroup} onChange={e => setForm(f => ({...f, muscleGroup: e.target.value}))}>
              <option value="">Muscle Group...</option>
              {muscleGroups.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select className="fin" value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}>
              <option value="">Category...</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="fin" value={form.equipment} onChange={e => setForm(f => ({...f, equipment: e.target.value}))}>
              <option value="">Equipment...</option>
              {equipmentList.map(eq => <option key={eq} value={eq}>{eq}</option>)}
            </select>
            <textarea className="fin" placeholder="Description..." value={form.description} rows={3}
              onChange={e => setForm(f => ({...f, description: e.target.value}))} style={{resize:'vertical'}} />
            <div style={{display:'flex',gap:8,marginTop:6}}>
              <button className="new-tmpl-btn" onClick={handleSave} disabled={saving} style={{flex:1}}>
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create'}
              </button>
              <button className="discbtn" onClick={() => { setEditing(null); setCreating(false); }} style={{flex:1}}>Cancel</button>
            </div>
          </div>
        )}

        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <div className="flbl" style={{margin:0}}>System Exercises ({exercises.length})</div>
          <button className="addexbtn" style={{padding:'4px 10px',fontSize:11}} onClick={openCreate}>+ New</button>
        </div>

        {exercises.map(ex => (
          <div key={ex.id} className="tmpl-edit-row">
            <div className="tmpl-edit-info">
              <div className="tmpl-edit-name">{ex.name}</div>
              <div className="tmpl-edit-meta">{ex.muscleGroup} · {ex.category} · {ex.equipment}</div>
            </div>
            <div className="tmpl-edit-btns">
              <button className="tmpl-edit-btn" onClick={() => openEdit(ex)}>Edit</button>
              <button className="tmpl-edit-btn del" onClick={() => handleDelete(ex.id)}>🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

AdminScreen.propTypes = {
  allExercises: PropTypes.array.isRequired,
  onBack: PropTypes.func.isRequired,
};
