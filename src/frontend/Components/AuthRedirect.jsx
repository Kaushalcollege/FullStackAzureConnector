import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    console.log("Window location search:", window.location.search);
    const code = params.get("code");
    const email_id = params.get("state"); // 'state' carries email

    console.log("AuthRedirect mounted");
    console.log("Extracted code:", code);
    console.log("Extracted email_id (state):", email_id);
    debugger; // Pause here to inspect code and email_id

    if (code && email_id) {
      fetch("http://localhost:8000/exchange-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auth_code: code,
          email_id: email_id,
        }),
      })
        .then((res) => {
          console.log("Response status:", res.status);
          if (!res.ok) {
            console.error("Response not OK");
            throw new Error("Token exchange failed");
          }
          return res.json();
        })
        .then((data) => {
          console.log("Token exchange success:", data);
          debugger; // Pause here to inspect the response data
          navigate("/success");
        })
        .catch((err) => {
          console.error("Error during token exchange:", err);
          debugger; // Pause here on error
          navigate("/error");
        });
    } else {
      console.warn("Missing code or email_id - cannot exchange token");
    }
  }, [navigate]);

  return <div>Exchanging token with Microsoft...</div>;
};

export default AuthRedirect;
