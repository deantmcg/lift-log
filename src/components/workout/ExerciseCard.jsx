import React from 'react';
import PropTypes from 'prop-types';
import { NumInput } from '../common/NumInput';
import { SetRow } from './SetRow';
import { constants } from '../../data/constants';
import { makeEntry, makeSet } from '../../utils/helpers';

export function ExerciseCard({ entry, allExercises, onUpdate, onRemove, addedIds, onStartRest, restRem, editMode, onMoveUp, onMoveDown }) {
  const mc = constants.MUSCLE_COLORS[entry.muscleGroup] || { bg:"#111", border:"#333", text:"#888" };
  const doneCt = entry.sets.filter(s => s.done).length;

  const upd = (id, field, val) => onUpdate({ ...entry, sets: entry.sets.map(s => s.id===id ? {...s,[field]:val} : s) });
  const tick = (id) => {
    if (editMode) return;
    onUpdate({ ...entry, sets: entry.sets.map(s => s.id===id ? {...s,done:!s.done} : s) });
  };
  const apply = () => onUpdate({ ...entry, sets: Array.from({length:entry.targetSets}, () => makeSet(entry.targetReps, entry.targetWeight)) });
  const addSet = () => onUpdate({ ...entry, sets: [...entry.sets, makeSet(entry.targetReps, entry.targetWeight)] });
  const rmSet = (id) => { if (entry.sets.length<=1) return; onUpdate({ ...entry, sets: entry.sets.filter(s=>s.id!==id) }); };

  // Dynamic swap: match by same muscleGroup AND category, exclude self and already-added
  const swapOpts = editMode ? [] : allExercises.filter(ex =>
    ex.muscleGroup === entry.muscleGroup &&
    ex.category === entry.category &&
    ex.id !== entry.exerciseId &&
    !addedIds.has(ex.id)
  );
  const doSwap = (ex) => { if (editMode) return; onUpdate({ ...makeEntry(ex), entryId: entry.entryId, expanded: true }); };

  return (
    <div className={`excard ${entry.expanded?"open":""}`}>
      <div className="exhdr" onClick={() => onUpdate({...entry, expanded:!entry.expanded, showSwap:false})}>
        <div className="exname">{entry.name}</div>
        <span className="mtag" style={{background:mc.bg, borderColor:mc.border, color:mc.text}}>{entry.muscleGroup}</span>
        <div className="hdr-r">
          {editMode && (
            <div className="reorder-btns" onClick={e => e.stopPropagation()}>
              <button className="hbtn ord" onClick={onMoveUp}>▲</button>
              <button className="hbtn ord" onClick={onMoveDown}>▼</button>
            </div>
          )}
          <div className="pips">{entry.sets.slice(0,8).map(s => <div key={s.id} className={`pip ${s.done?"on":""}`} />)}</div>
          <button className="hbtn sw" onClick={e=>{e.stopPropagation(); onUpdate({...entry,showSwap:!entry.showSwap,expanded:true});}}>⇄</button>
          <button className="hbtn dl red" onClick={e=>{e.stopPropagation(); onRemove();}}>🗑</button>
        </div>
      </div>

      {entry.expanded && <>
        {!editMode && entry.showSwap && (
          <div className="swappanel">
            <div className="swaplbl">Swap — same muscle & movement</div>
            {swapOpts.length===0
              ? <div style={{fontSize:10,color:"var(--muted)"}}>No alternatives available</div>
              : <div className="swaplist">{swapOpts.map(ex=>(
                  <div key={ex.id} className="swapitem" onClick={()=>doSwap(ex)}>
                    <span>{ex.name}</span><span className="swarr">→</span>
                  </div>
                ))}</div>
            }
          </div>
        )}

        <div className="trow">
          <span className="tlbl">Target</span>
          <NumInput className="nin" value={entry.targetSets} onChange={v=>onUpdate({...entry,targetSets:v})} onClick={e=>e.stopPropagation()} />
          <span className="sp">×</span>
          <NumInput className="nin" value={entry.targetReps} onChange={v=>onUpdate({...entry,targetReps:v})} onClick={e=>e.stopPropagation()} />
          <span className="sp">@</span>
          <NumInput className="nin w" value={entry.targetWeight} step={2.5} onChange={v=>onUpdate({...entry,targetWeight:v})} onClick={e=>e.stopPropagation()} />
          <span className="sp">kg</span>
          <button className="apbtn" onClick={e=>{e.stopPropagation();apply();}}>Apply to all</button>
        </div>

        <div className="slist">
          {entry.sets.map((set,i) => (
            <SetRow 
              key={set.id}
              set={set}
              index={i}
              editMode={editMode}
              restRem={restRem}
              onUpdate={upd}
              onRemove={rmSet}
              onToggleDone={tick}
              onStartRest={onStartRest}
            />
          ))}
          <button className="addbtn" onClick={addSet}>+ Add Set</button>
        </div>
      </>}
    </div>
  );
}

ExerciseCard.propTypes = {
  entry: PropTypes.object.isRequired,
  allExercises: PropTypes.array.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  addedIds: PropTypes.object.isRequired,
  onStartRest: PropTypes.func,
  restRem: PropTypes.number,
  editMode: PropTypes.bool,
  onMoveUp: PropTypes.func,
  onMoveDown: PropTypes.func,
};
