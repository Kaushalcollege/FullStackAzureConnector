import React from "react";
import "./SubmitButton.css";

const SubmitButton = ({ onClick, disabled }) => {
  return (
    <button className="submit-button" onClick={onClick} disabled={disabled}>
      Submit
    </button>
  );
};

export default SubmitButton;
