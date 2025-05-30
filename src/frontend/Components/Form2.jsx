import React, { useState, useEffect } from "react";
import ClientID from "./ClientID";
import TenantID from "./TenantID";
import ClientSecret from "./ClientSecret";
import AppID from "./AppID";
import CreatedBy from "./CreatedBy";
import SubmitButton from "./SubmitButton";
import "./Form.css";

const Form2 = () => {
  const [clientId, setClientId] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [appId, setAppId] = useState("");
  const [createdBy, setCreatedBy] = useState("");

  const isFormValid =
    clientId && tenantId && clientSecret && appId && createdBy;

  const handleSubmit = () => {
    const redirectUri = "http://localhost:5173";
    const scopes = "User.Read Mail.Read offline_access openid profile email";

    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&response_mode=query&scope=${scopes}`;

    // Save input values to localStorage before redirect
    localStorage.setItem("client_id", clientId);
    localStorage.setItem("tenant_id", tenantId);
    localStorage.setItem("client_secret", clientSecret);
    localStorage.setItem("app_id", appId);
    localStorage.setItem("created_by", createdBy);

    // Redirect to Microsoft login
    window.location.href = authUrl;
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      const client_id = localStorage.getItem("client_id");
      const tenant_id = localStorage.getItem("tenant_id");
      const client_secret = localStorage.getItem("client_secret");
      const app_id = localStorage.getItem("app_id");
      const created_by = localStorage.getItem("created_by");

      // Send to FastAPI backend
      fetch("http://localhost:8000/credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id,
          tenant_id,
          client_secret,
          app_id,
          created_by,
          code,
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const error = await res.json();
            throw error;
          }
          return res.json();
        })
        .then((data) => {
          alert("Credentials and tokens submitted successfully!");
          localStorage.clear();
          window.history.replaceState({}, document.title, "/"); // Clean up the URL
        })
        .catch((err) => {
          alert("Submission failed: " + (err?.detail || "Unknown error"));
          console.error(err);
        });
    }
  }, []);

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
      <CreatedBy value={createdBy} onChange={setCreatedBy} />
      <br />
      <div className="submit-button-wrapper">
        <SubmitButton onClick={handleSubmit} disabled={!isFormValid} />
      </div>
    </div>
  );
};

export default Form2;
