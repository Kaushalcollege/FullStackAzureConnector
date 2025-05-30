import React from "react";
import "./EmailID.css";

const EmailID = ({ value, onChange }) => {
  return (
    <input
      className="input-field"
      type="text"
      placeholder="EmailID"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export default EmailID;
