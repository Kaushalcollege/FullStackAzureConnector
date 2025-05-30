import React from "react";
import "./TenantID.css";

const TenantID = ({ value, onChange }) => {
  return (
    <input
      className="input-field"
      type="text"
      placeholder="Directory (tenant) ID"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export default TenantID;
