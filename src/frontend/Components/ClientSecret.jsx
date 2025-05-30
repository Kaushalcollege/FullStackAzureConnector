import React from "react";
import "./ClientSecret.css";

const ClientSecret = ({ value, onChange }) => {
  return (
    <input
      className="input-field"
      type="text"
      placeholder="Client Secret Value"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export default ClientSecret;
