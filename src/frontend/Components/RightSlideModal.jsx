import React, { useState } from "react";
import FormField from "./FormField";
import "./RightSlideModal.css";

const RightSlideModal = ({ onClose }) => {
  const [clientId, setClientId] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [emailId, setEmailId] = useState("");

  const isFormValid = clientId && tenantId && clientSecret && emailId;

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
        const redirectUri = `http://localhost:5173/redirect/${clientId}`;
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
            <svg
              width="40"
              height="36"
              viewBox="0 0 40 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="12.5"
                y="0.5"
                width="25"
                height="35"
                rx="2"
                fill="#1066B5"
              />
              <rect
                x="12.5"
                y="0.5"
                width="25"
                height="35"
                rx="2"
                fill="url(#paint0_linear_615_673)"
              />
              <rect
                x="12.5"
                y="4.25"
                width="12.5"
                height="12.5"
                fill="#32A9E7"
              />
              <rect
                x="12.5"
                y="16.75"
                width="12.5"
                height="12.5"
                fill="#167EB4"
              />
              <rect
                x="25"
                y="16.75"
                width="12.5"
                height="12.5"
                fill="#32A9E7"
              />
              <rect x="25" y="4.25" width="12.5" height="12.5" fill="#58D9FD" />
              <mask
                id="mask0_615_673"
                style={{ maskType: "alpha" }}
                maskUnits="userSpaceOnUse"
                x="10"
                y="15"
                width="30"
                height="21"
              >
                <path
                  d="M10 15.5H38C39.1046 15.5 40 16.3954 40 17.5V33.5C40 34.6046 39.1046 35.5 38 35.5H12C10.8954 35.5 10 34.6046 10 33.5V15.5Z"
                  fill="url(#paint1_linear_615_673)"
                />
              </mask>
              <g mask="url(#mask0_615_673)">
                <path d="M40 15.5V20.5H37.5V15.5H40Z" fill="#135298" />
                <path
                  d="M40 35.5V18L8.75 35.5H40Z"
                  fill="url(#paint2_linear_615_673)"
                />
                <path
                  d="M10 35.5V18L41.25 35.5H10Z"
                  fill="url(#paint3_linear_615_673)"
                />
              </g>
              <path
                d="M10 12.25C10 10.5931 11.3431 9.25 13 9.25H22C23.6569 9.25 25 10.5931 25 12.25V28.75C25 30.4069 23.6569 31.75 22 31.75H10V12.25Z"
                fill="black"
                fillOpacity="0.3"
              />
              <rect
                y="6.75"
                width="22.5"
                height="22.5"
                rx="2"
                fill="url(#paint4_linear_615_673)"
              />
              <path
                d="M17.5 18.0866V17.8788C17.5 14.2777 14.909 11.75 11.2698 11.75C7.61076 11.75 5 14.295 5 17.9134V18.1212C5 21.7223 7.59098 24.25 11.25 24.25C14.8892 24.25 17.5 21.705 17.5 18.0866ZM14.553 18.1212C14.553 20.5104 13.2081 21.9474 11.2698 21.9474C9.33149 21.9474 7.96677 20.4758 7.96677 18.0866V17.8788C7.96677 15.4896 9.31171 14.0526 11.25 14.0526C13.1685 14.0526 14.553 15.5242 14.553 17.9134V18.1212Z"
                fill="white"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_615_673"
                  x1="12.5"
                  y1="18"
                  x2="37.5"
                  y2="18"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#064484" />
                  <stop offset="1" stopColor="#0F65B5" />
                </linearGradient>
                <linearGradient
                  id="paint1_linear_615_673"
                  x1="10"
                  y1="31.4615"
                  x2="40"
                  y2="31.4615"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#1B366F" />
                  <stop offset="1" stopColor="#2657B0" />
                </linearGradient>
                <linearGradient
                  id="paint2_linear_615_673"
                  x1="40"
                  y1="26.75"
                  x2="10"
                  y2="26.75"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#44DCFD" />
                  <stop offset="0.453125" stopColor="#259ED0" />
                </linearGradient>
                <linearGradient
                  id="paint3_linear_615_673"
                  x1="10"
                  y1="26.75"
                  x2="40"
                  y2="26.75"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#259ED0" />
                  <stop offset="1" stopColor="#44DCFD" />
                </linearGradient>
                <linearGradient
                  id="paint4_linear_615_673"
                  x1="0"
                  y1="18"
                  x2="22.5"
                  y2="18"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#064484" />
                  <stop offset="1" stopColor="#0F65B5" />
                </linearGradient>
              </defs>
            </svg>

            <h3
              style={{
                fontSize: "16px",
                width: "239px",
                height: "24px",
                fontWeight: 500,
                lineHeight: "24px",
              }}
            >
              Integrate Outlook with ViaEdge
            </h3>
            <button className="close-button" onClick={onClose}>
              <svg
                width="36"
                height="36"
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M23 13L13 23M13 13L23 23"
                  stroke="#535862"
                  strokeWidth="1.66667"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
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

            <p
              style={{
                fontFamily: "Inter",
                fontWeight: 400,
                fontSize: "12px",
                lineHeight: "14px",
                letterSpacing: "0%",
                margin: 0,
                padding: 0,
              }}
            >
              Enter your redirect URI as local host in the Platform
              configurations in:
              <br />
              <span style={{ fontStyle: "italic", color: "#667085" }}>
                “https://localhost:5173/redirect/(Client ID)”
              </span>
            </p>
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
