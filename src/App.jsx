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
import FindVet from "./pages/FindVet";
import FindGroomer from "./pages/FindGroomer";
import DietPlan from "./pages/DietPlan"; // New Diet Plan Page
import SocialMedia from "./pages/SocialMedia"; // New Social Media Page
import PetParentsNearby from "./pages/PetParentsNearby"; // New Pet Parents Nearby Page   
import Events from "./pages/Events"; // New Events Page
import Shop from "./pages/Shop"; // New Shop Page

import { TermsPage } from "./pages/TermsPage";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";

// New Dashboards for Other User Roles
import GroomerDashboard from "./pages/GroomerDashboard";
import VetDashboard from "./pages/VetDashboard";
import TrainerDashboard from "./pages/TrainerDashboard";
import CareCentreDashboard from "./pages/CareCentreDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import EventHostDashboard from "./pages/EventHostDashboard";
import Lottie from "lottie-react";
import loadingAnimation from "./assets/lottie/loading-paws.json";

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
    <div className="min-h-screen flex justify-center items-center bg-white">
      <div className="w-48 h-48">
        <Lottie animationData={loadingAnimation} loop={true} />
      </div>
    </div>
  );
}


  return (
    <Router>
      <Routes>
        {/* Default redirect to login or customer dashboard */}
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />

        {/* Login Page */}
        <Route path="/login" element={<Login setUser={setUser} />} />

        {/* Customer Routes */}
        <Route path="/dashboard" element={user ? <CustomerDashboard user={user} setUser={setUser} /> : <Navigate to="/login" />} />
        <Route path="/add-pet" element={user ? <AddPet user={user} /> : <Navigate to="/login" />} />
        <Route path="/vaccination-form" element={user ? <VaccinationForm user={user} /> : <Navigate to="/login" />} />
        <Route path="/calendar" element={user ? <VaccinationCalendar user={user} /> : <Navigate to="/login" />} />
        <Route path="/services" element={user ? <ServicesMenu user={user} /> : <Navigate to="/login" />} />
        <Route path="/find-groomer" element={user ? <FindGroomer user={user} /> : <Navigate to="/login" />} />
        <Route path="/find-vet" element={user ? <FindVet user={user} /> : <Navigate to="/login" />} />
        <Route path="/diet-plan" element={user ? <DietPlan user={user} /> : <Navigate to="/login" />} />
        <Route path="/social-media" element={user ? <SocialMedia user={user} /> : <Navigate to="/login" />} />
        <Route path="/pet-parents-nearby" element={user ? <PetParentsNearby user={user} /> : <Navigate to="/login" />} />
        <Route path="/events" element={user ? <Events user={user} /> : <Navigate to="/login" />} />
        <Route path="/shop" element={user ? <Shop user={user} /> : <Navigate to="/login" />} />

        {/* Dashboards for Other User Roles */}
        <Route path="/groomer-dashboard" element={<GroomerDashboard />} />
        <Route path="/vet-dashboard" element={<VetDashboard />} />
        <Route path="/trainer-dashboard" element={<TrainerDashboard />} />
        <Route path="/care-centre-dashboard" element={<CareCentreDashboard />} />
        <Route path="/event-host-dashboard" element={<EventHostDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        {/* Legal Pages - Public */}
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
