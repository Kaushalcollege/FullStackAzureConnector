import React, { useState } from "react";
import ClientID from "./ClientID";
import TenantID from "./TenantID";
import ClientSecret from "./ClientSecret";
import AppID from "./AppID";
import CreatedBy from "./CreatedBy"; // 🆕 Import new component
import SubmitButton from "./SubmitButton";
import "./Form.css";

const Form = () => {
  const [clientId, setClientId] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [appId, setAppId] = useState("");
  const [createdBy, setCreatedBy] = useState(""); // 🆕 Use state

  const isFormValid =
    clientId && tenantId && clientSecret && appId && createdBy;

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://localhost:8000/credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          tenant_id: tenantId,
          client_secret: clientSecret,
          app_id: appId,
          created_by: createdBy,
        }),
      });

      if (response.ok) {
        alert("Credentials submitted successfully!");
        setClientId("");
        setTenantId("");
        setClientSecret("");
        setAppId("");
        setCreatedBy("");
      } else {
        const error = await response.json();
        alert(`Submission failed: ${error.detail}`);
      }
    } catch (err) {
      alert("Error connecting to server.");
      console.error(err);
    }
  };

  return (
    <div className="form-container">
      <h1>Your Application Details:</h1>
      <AppID value={appId} onChange={setAppId} />
      <br />
      <br />
      <ClientID value={clientId} onChange={setClientId} />
      <br />
      <br />
      <TenantID value={tenantId} onChange={setTenantId} />
      <br />
      <br />
      <ClientSecret value={clientSecret} onChange={setClientSecret} />
      <br />
      <br />
      <CreatedBy value={createdBy} onChange={setCreatedBy} />{" "}
      {/* 🆕 Use component */}
      <br />
      <div className="submit-button-wrapper">
        <SubmitButton onClick={handleSubmit} disabled={!isFormValid} />
      </div>
    </div>
  );
};

export default Form;
