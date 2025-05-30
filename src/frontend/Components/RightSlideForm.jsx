import React, { useState } from "react";
import "./RightSlideForm.css";

const RightSlideForm = ({ isOpen, onClose }) => {
  const [tenantId, setTenantId] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [emailId, setEmailId] = useState("");
  const [createdBy, setCreatedBy] = useState("");

  const isFormValid =
    tenantId && clientId && clientSecret && emailId && createdBy;

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://localhost:8000/credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenant_id: tenantId,
          client_id: clientId,
          client_secret: clientSecret,
          email_id: emailId,
          created_by: createdBy,
        }),
      });

      if (response.ok) {
        alert("Submitted successfully!");
        setTenantId("");
        setClientId("");
        setClientSecret("");
        setEmailId("");
        setCreatedBy("");
      } else {
        const error = await response.json();
        alert(`Failed: ${error.detail}`);
      }
    } catch (err) {
      alert("Server error.");
      console.error(err);
    }
  };

  return (
    <div className={`right-slide-form ${isOpen ? "open" : ""}`}>
      <div className="form-header">
        <h3>Integrate Outlook with ViaEdge</h3>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="form-body">
        <label>Tenant ID *</label>
        <input value={tenantId} onChange={(e) => setTenantId(e.target.value)} />
        <label>Client ID</label>
        <input value={clientId} onChange={(e) => setClientId(e.target.value)} />
        <label>Client Secret</label>
        <input
          value={clientSecret}
          onChange={(e) => setClientSecret(e.target.value)}
        />
        <label>Email ID</label>
        <input value={emailId} onChange={(e) => setEmailId(e.target.value)} />
        <label>Created By</label>
        <input
          value={createdBy}
          onChange={(e) => setCreatedBy(e.target.value)}
        />
      </div>

      <div className="form-buttons">
        <button onClick={onClose}>Cancel</button>
        <button onClick={handleSubmit} disabled={!isFormValid}>
          Integrate
        </button>
      </div>
    </div>
  );
};

export default RightSlideForm;
