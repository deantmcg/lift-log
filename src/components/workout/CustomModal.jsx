import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { constants } from '../../data/constants';
import { uid } from '../../utils/helpers';
import { storage } from '../../services/storage';

export function CustomModal({ onSave, onClose }) {
  const [name, setName]           = useState("");
  const [category, setCategory]   = useState("push");
  const [muscleGroup, setMG]      = useState("chest");
  const [equipment, setEquip]     = useState("barbell");

  const cats    = ["push","pull","legs","upper","lower","full body"];
  const muscles = ["chest","back","shoulders","arms","legs","core"];
  const equips  = ["barbell","dumbbell","cable","machine","bodyweight"];

  const save = () => {
    if (!name.trim()) return;
    const ex = { id:"c_"+uid(), name:name.trim(), category, muscleGroup, equipment, similarExercises:[], custom:true };
    storage.saveCustomExercise(ex);
    onSave(ex);
  };

  return (
    <div className="moverlay" onClick={onClose}>
      <div className="cmodal" onClick={e=>e.stopPropagation()}>
        <div className="mhandle" style={{margin:"0 auto 10px"}} />
        <div className="ctitle">New Exercise</div>
        <div className="flbl">Name</div>
        <input className="fin" placeholder="e.g. Close Grip Bench" value={name} onChange={e=>setName(e.target.value)} autoFocus />
        <div className="flbl">Category</div>
        <div className="chipgrp">{cats.map(c=><button key={c} className={`selchip ${category===c?"on":""}`} onClick={()=>setCategory(c)}>{c}</button>)}</div>
        <div className="flbl">Muscle Group</div>
        <div className="chipgrp">{muscles.map(m=><button key={m} className={`selchip ${muscleGroup===m?"on":""}`}
          style={muscleGroup===m?{background:constants.MUSCLE_COLORS[m]?.bg,borderColor:constants.MUSCLE_COLORS[m]?.border,color:constants.MUSCLE_COLORS[m]?.text}:{}}
          onClick={()=>setMG(m)}>{m}</button>)}</div>
        <div className="flbl">Equipment</div>
        <div className="chipgrp">{equips.map(e=><button key={e} className={`selchip ${equipment===e?"on":""}`} onClick={()=>setEquip(e)}>{e}</button>)}</div>
        <button className="creatbtn" onClick={save}>Create Exercise</button>
        <button className="cancbtn" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

CustomModal.propTypes = {
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};
