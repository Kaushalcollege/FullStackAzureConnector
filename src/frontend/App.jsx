import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RightSlideModal from "./Components/RightSlideModal";
import AuthRedirect from "./Components/AuthRedirect"; // Create this file

const App = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              <button
                onClick={() => setShowForm(true)}
                style={{ padding: "10px 20px", fontSize: "16px" }}
              >
                Open Integration Form
              </button>
              {showForm && (
                <RightSlideModal onClose={() => setShowForm(false)} />
              )}
            </div>
          }
        />
        <Route path="/auth/callback" element={<AuthRedirect />} />
        <Route path="/success" element={<h2>Integration Successful</h2>} />
        <Route path="/error" element={<h2>Integration Failed</h2>} />
      </Routes>
    </Router>
  );
};

export default App;
