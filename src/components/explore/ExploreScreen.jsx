import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { constants } from '../../data/constants';

export function ExploreScreen({ allExercises, onBack }) {
  const [search, setSearch]   = useState("");
  const [cat, setCat]         = useState("all");
  const [muscle, setMuscle]   = useState("all");
  const [selected, setSelected] = useState(null);

  const cats    = ["all","push","pull","legs","upper","lower","full body"];
  const muscles = ["all","chest","back","shoulders","arms","legs","core"];

  const filtered = allExercises.filter(ex =>
    ex.name.toLowerCase().includes(search.toLowerCase())
    && (cat==="all" || ex.category===cat)
    && (muscle==="all" || ex.muscleGroup===muscle)
  );
  
  const grouped = filtered.reduce((a,ex) => { 
    (a[ex.muscleGroup]=a[ex.muscleGroup]||[]).push(ex); 
    return a; 
  }, {});

  return (
    <div className="xscreen">
      <div className="xhdr">
        <button className="backbtn" onClick={onBack}>← Back</button>
        <span className="xtitle">Exercise Library</span>
      </div>
      <div style={{flexShrink:0,padding:"8px 12px 0"}}>
        <div className="msearch" style={{margin:0}}>
          <span className="searchic">🔍</span>
          <input className="searchin" placeholder="Search exercises..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
      </div>
      <div className="frow" style={{padding:"8px 12px 0"}}>
        {cats.map(c=><button key={c} className={`fchip ${cat===c?"on":""}`} onClick={()=>setCat(c)}>{c==="all"?"ALL":c.toUpperCase()}</button>)}
      </div>
      <div className="frow" style={{paddingTop:4,paddingBottom:4}}>
        {muscles.map(m=>
          <button 
            key={m} 
            className={`fchip ${muscle===m?"on":""}`}
            style={muscle===m&&m!=="all"?{background:constants.MUSCLE_COLORS[m]?.bg,borderColor:constants.MUSCLE_COLORS[m]?.border,color:constants.MUSCLE_COLORS[m]?.text}:{}}
            onClick={()=>setMuscle(m)}
          >
            {m==="all"?"ALL":m.toUpperCase()}
          </button>
        )}
      </div>
      <div className="xscroll">
        {Object.keys(grouped).length===0 && <div className="empty"><div className="emico">🔍</div><div className="emtxt">No results</div></div>}
        {Object.entries(grouped).map(([grp,exs]) => {
          const mc = constants.MUSCLE_COLORS[grp]||{};
          return (
            <div key={grp}>
              <div className="grplbl" style={{color:mc.text||"var(--muted)"}}>{grp.toUpperCase()}</div>
              {exs.map(ex=>(
                <div key={ex.id} className="xitem" onClick={()=>setSelected(ex)}>
                  <div className="binfo">
                    <div className="bname">{ex.name}</div>
                    <div className="bmeta">
                      <span className="mtag" style={{background:mc.bg,borderColor:mc.border,color:mc.text,fontSize:7}}>{grp}</span>
                      <span className="bequip">{ex.equipment}</span>
                    </div>
                  </div>
                  <div className="xarr">›</div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="moverlay" onClick={()=>setSelected(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="mhandle" />
            <div className="mhdr">
              <span className="mtitle">{selected.name}</span>
              <button className="mclosebtn" onClick={()=>setSelected(null)}>✕</button>
            </div>
            <div className="exdetail">
              <div className="exdetail-tags">
                <span className="mtag" style={{background:constants.MUSCLE_COLORS[selected.muscleGroup]?.bg,borderColor:constants.MUSCLE_COLORS[selected.muscleGroup]?.border,color:constants.MUSCLE_COLORS[selected.muscleGroup]?.text}}>{selected.muscleGroup}</span>
                <span className="equiptag">{selected.equipment}</span>
                <span className="equiptag">{selected.category}</span>
              </div>
              {selected.description
                ? <div className="exdetail-desc">{selected.description}</div>
                : <div className="exdetail-desc" style={{color:"var(--muted)"}}>No description available.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

ExploreScreen.propTypes = {
  allExercises: PropTypes.array.isRequired,
  onBack: PropTypes.func.isRequired
};
