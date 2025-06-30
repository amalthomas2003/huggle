import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import Login from "./components/Login";
import CustomerDashboard from "./pages/CustomerDashboard";
import AddPet from "./pages/AddPet";
import VaccinationForm from "./pages/VaccinationForm";
import VaccinationCalendar from "./pages/VaccinationCalendar";
import ServicesMenu from "./pages/ServicesMenu";

// 👉 Import legal pages
import { TermsPage } from "./pages/TermsPage";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login setUser={setUser} />} />
        <Route path="/dashboard" element={user ? <CustomerDashboard user={user} setUser={setUser} /> : <Navigate to="/login" />} />
        <Route path="/add-pet" element={user ? <AddPet user={user} /> : <Navigate to="/login" />} />
        <Route path="/vaccination-form" element={user ? <VaccinationForm user={user} /> : <Navigate to="/login" />} />
        <Route path="/calendar" element={user ? <VaccinationCalendar user={user} /> : <Navigate to="/login" />} />
        <Route path="/services" element={user ? <ServicesMenu user={user} /> : <Navigate to="/login" />} />

        {/* ✅ Legal Pages - Publicly Accessible */}
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
