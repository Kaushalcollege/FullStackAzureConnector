import React, { useState } from "react";
import FormField from "./FormField";
import "./RightSlideModal.css";
import OutlookLogo from "./icons/OutlookLogo";
import CloseIcon from "./icons/CloseIcon";

const RightSlideModal = ({ onClose }) => {
  const [appId, setAppId] = useState("");
  const [clientId, setClientId] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [emailId, setEmailId] = useState("");

  const isFormValid = clientId && tenantId && clientSecret && emailId && appId;

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
          app_id: appId,
        }),
      });

      if (response.ok) {
        const scopes = [
          "openid",
          "profile",
          "email",
          "offline_access",
          "Mail.Read",
          "User.Read",
        ];
        const redirectUri = `http://localhost:5173/redirect/${appId}`;
        const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
          redirectUri
        )}&response_mode=query&scope=${scopes.join(
          " "
        )}&state=${encodeURIComponent(emailId)}`;

        window.location.href = authUrl;
      } else {
        const error = await response.json();
        alert(`Failed: ${error.detail}`);
      }
    } catch (err) {
      alert("Server error.");
      console.error(err);
    }
  };

  const fields = [
    {
      label: "App ID *",
      placeholder: "App ID",
      value: appId,
      onChange: setAppId,
    },
    {
      label: "Tenant ID *",
      placeholder: "Tenant ID",
      value: tenantId,
      onChange: setTenantId,
    },
    {
      label: "Client ID",
      placeholder: "Client ID",
      value: clientId,
      onChange: setClientId,
    },
    {
      label: "Client Secret",
      placeholder: "Client Secret",
      value: clientSecret,
      onChange: setClientSecret,
    },
    {
      label: "Email ID",
      placeholder: "Email ID",
      value: emailId,
      onChange: setEmailId,
    },
  ];

  return (
    <div className="overlay">
      <div className="modal-slide">
        <div className="modal-content">
          <div className="modal-header">
            <div className="modal-heading">
              <OutlookLogo />
              <h3 className="modal-title">Integrate Outlook with ViaEdge</h3>
            </div>
            <button className="close-button" onClick={onClose}>
              <CloseIcon />
            </button>
          </div>

          <div className="modal-body">
            {fields.map((field, idx) => (
              <FormField
                key={idx}
                label={field.label}
                placeholder={field.placeholder}
                value={field.value}
                onChange={field.onChange}
              />
            ))}

            <div className="modal-text-group">
              <p className="modal-instruction">
                Please copy the below URL and add as "Redirect URL" in your
                Azure app:
              </p>
              <p className="modal-url">
                https://localhost:3000/redirect/(App ID)
              </p>
            </div>
          </div>

          <div className="modal-footer">
            <button className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={!isFormValid}
            >
              Integrate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightSlideModal;
