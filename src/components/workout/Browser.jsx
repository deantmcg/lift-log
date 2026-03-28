import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { constants } from '../../data/constants';

export function Browser({ allExercises, addedIds, onAdd, onClose, onOpenCustom }) {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");
  const [muscle, setMuscle] = useState("all");

  const cats    = ["all","push","pull","legs","upper","lower","full body"];
  const muscles = ["all","chest","back","shoulders","arms","legs","core"];

  const filtered = allExercises.filter(ex => {
    return ex.name.toLowerCase().includes(search.toLowerCase())
      && (cat==="all" || ex.category===cat)
      && (muscle==="all" || ex.muscleGroup===muscle);
  });
  const grouped = filtered.reduce((a,ex) => { (a[ex.muscleGroup]=a[ex.muscleGroup]||[]).push(ex); return a; }, {});

  return (
    <div className="moverlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="mhandle" />
        <div className="mhdr">
          <span className="mtitle">Add Exercise</span>
          <button className="mclosebtn" onClick={onClose}>✕</button>
        </div>
        <div className="msearch">
          <span className="searchic">🔍</span>
          <input className="searchin" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} autoFocus />
        </div>
        <div className="frow">
          {cats.map(c=><button key={c} className={`fchip ${cat===c?"on":""}`} onClick={()=>setCat(c)}>{c==="all"?"ALL":c.toUpperCase()}</button>)}
        </div>
        <div className="frow" style={{paddingTop:0}}>
          {muscles.map(m=><button key={m} className={`fchip ${muscle===m?"on":""}`}
            style={muscle===m&&m!=="all"?{background:constants.MUSCLE_COLORS[m]?.bg,borderColor:constants.MUSCLE_COLORS[m]?.border,color:constants.MUSCLE_COLORS[m]?.text}:{}}
            onClick={()=>setMuscle(m)}>{m==="all"?"ALL":m.toUpperCase()}</button>)}
        </div>
        <div className="blist">
          {Object.keys(grouped).length===0 && <div className="empty"><div className="emico">🔍</div><div className="emtxt">No results</div></div>}
          {Object.entries(grouped).map(([grp,exs]) => {
            const mc = constants.MUSCLE_COLORS[grp]||{};
            return (
              <div key={grp}>
                <div className="grplbl" style={{color:mc.text||"var(--muted)"}}>{grp.toUpperCase()}</div>
                {exs.map(ex => {
                  const isAdded = addedIds.has(ex.id);
                  return (
                    <div key={ex.id} className={`bitem ${isAdded?"added":""}`} onClick={()=>!isAdded&&onAdd(ex)}>
                      <div className="binfo">
                        <div className="bname">{ex.name}</div>
                        <div className="bmeta">
                          <span className="mtag" style={{background:mc.bg,borderColor:mc.border,color:mc.text,fontSize:7}}>{grp}</span>
                          <span className="bequip">{ex.equipment}</span>
                        </div>
                      </div>
                      <div className="bstatus">{isAdded?"✓":"+"}</div>
                    </div>
                  );
                })}
              </div>
            );
          })}
          <div style={{marginTop:8}}>
            <button className="addexbtn" onClick={onOpenCustom}>+ Create Custom</button>
          </div>
        </div>
      </div>
    </div>
  );
}

Browser.propTypes = {
  allExercises: PropTypes.array.isRequired,
  addedIds: PropTypes.object.isRequired,
  onAdd: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onOpenCustom: PropTypes.func.isRequired
};
