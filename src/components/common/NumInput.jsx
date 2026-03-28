import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

export function NumInput({ className, value, step, onChange, onClick }) {
  const [str, setStr] = useState(String(value ?? 0));
  const extRef = useRef(value);

  useEffect(() => {
    if (value !== extRef.current) {
      extRef.current = value;
      setStr(String(value ?? 0));
    }
  }, [value]);

  const commit = (raw) => {
    const n = parseFloat(raw);
    const safe = isNaN(n) ? 0 : n;
    extRef.current = safe;
    setStr(String(safe));
    onChange(safe);
  };

  return (
    <input
      className={className}
      type="text"
      inputMode={step && step !== 1 ? "decimal" : "numeric"}
      value={str}
      onClick={onClick}
      onFocus={(e) => e.target.select()}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.target.blur();
      }}
      onChange={(e) => {
        const raw = e.target.value.replace(/[^0-9.]/g, "");
        setStr(raw);
        const n = parseFloat(raw);
        if (!isNaN(n)) {
          extRef.current = n;
          onChange(n);
        }
      }}
      onBlur={(e) => commit(e.target.value)}
    />
  );
}

NumInput.propTypes = {
  className: PropTypes.string,
  value: PropTypes.number,
  step: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  onClick: PropTypes.func,
};
