import React from "react";
import "./CreatedBy.css";

const CreatedBy = ({ value, onChange }) => {
  return (
    <input
      className="input-field"
      type="text"
      placeholder="Created By"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export default CreatedBy;
