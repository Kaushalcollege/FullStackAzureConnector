import React from "react";
import "./ClientID.css";

const ClientID = ({ value, onChange }) => {
  return (
    <input
      className="input-field"
      type="text"
      placeholder="Application (client) ID"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export default ClientID;
