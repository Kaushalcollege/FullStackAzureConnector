// IntegrationModal.jsx
import React, { useState } from "react";
import "./form.css"; // Make sure this is the CSS I gave earlier

const IntegrationModal = ({ isOpen, onClose }) => {
  const [clientId, setClientId] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [emailId, setEmailId] = useState("");

  const isFormValid = clientId && tenantId && clientSecret && emailId;

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="right-slide-form open">
        <div className="form-header">
          <h3>
            <img src="/outlook-icon.png" alt="Outlook" />
            Integrate Outlook with ViaEdge
          </h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="form-body">
          <label>Tenant ID *</label>
          <input
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
          />
          <label>Client ID</label>
          <input
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          />
          <label>Client Secret</label>
          <input
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
          />
          <label>Email ID</label>
          <input value={emailId} onChange={(e) => setEmailId(e.target.value)} />
        </div>

        <div className="form-buttons">
          <button onClick={onClose}>Cancel</button>
          <button disabled={!isFormValid}>Integrate</button>
        </div>
      </div>
    </div>
  );
};

export default IntegrationModal;
