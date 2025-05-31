import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import RightSlideModal from "./Components/RightSlideModal";
import AuthRedirect from "./Components/AuthRedirect";

const SuccessPage = ({ openModal }) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const shouldShowForm = params.get("showForm") === "true";
    if (shouldShowForm) {
      openModal();
      // optionally remove the query param to clean the URL
      navigate("/"); // navigate back to home ("/") after modal opens
    }
  }, [location, openModal, navigate]);

  return <h2>Integration Successful</h2>;
};

const App = () => {
  const [showForm, setShowForm] = useState(false);

  const openModal = () => setShowForm(true);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              <button
                onClick={openModal}
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
        <Route path="/redirect/:clientId" element={<AuthRedirect />} />
        <Route
          path="/success"
          element={<SuccessPage openModal={openModal} />}
        />
        <Route path="/error" element={<h2>Integration Failed</h2>} />
      </Routes>
    </Router>
  );
};

export default App;
