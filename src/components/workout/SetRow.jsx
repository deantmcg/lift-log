import React from 'react';
import PropTypes from 'prop-types';
import { NumInput } from '../common/NumInput';
import { pad } from '../../utils/helpers';

export function SetRow({ set, index, editMode, restRem, onUpdate, onRemove, onToggleDone, onStartRest }) {
  return (
    <div className={`srow ${set.done ? "done" : ""}`}>
      <span className="snum">S{index + 1}</span>
      <div className="sinputs">
        <NumInput className="sin" value={set.reps} onChange={v => onUpdate(set.id, "reps", v)} />
        <span className="ssep">×</span>
        <NumInput className="sin w" value={set.weight} step={2.5} onChange={v => onUpdate(set.id, "weight", v)} placeholder="—" />
        <span className="sunit">kg</span>
      </div>
      {!editMode && onStartRest && (
        <button className="restbtn" onClick={onStartRest}>
          {restRem != null && restRem > 0 ? `⏱ ${pad(Math.floor(restRem/60))}:${pad(restRem%60)}` : "⏱ Rest"}
        </button>
      )}
      <button className="rmbtn" onClick={() => onRemove(set.id)}>−</button>
      {!editMode && (
        <button className={`tickbtn ${set.done ? "on" : ""}`} onClick={() => onToggleDone(set.id)}>✓</button>
      )}
    </div>
  );
}

SetRow.propTypes = {
  set: PropTypes.shape({
    id: PropTypes.string.isRequired,
    reps: PropTypes.number,
    weight: PropTypes.number,
    done: PropTypes.bool.isRequired
  }).isRequired,
  index: PropTypes.number.isRequired,
  editMode: PropTypes.bool,
  restRem: PropTypes.number,
  onUpdate: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onToggleDone: PropTypes.func.isRequired,
  onStartRest: PropTypes.func
};
