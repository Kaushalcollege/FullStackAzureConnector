import React from "react";
import "./AppID.css";

const AppID = ({ value, onChange }) => {
  return (
    <input
      className="input-field"
      type="text"
      placeholder="AppID"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export default AppID;
