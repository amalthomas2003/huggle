import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

import PaymentPage from "./pages/PaymentPage";
import Login from "./components/Login";
import CustomerDashboard from "./pages/CustomerDashboard";
import AddPet from "./pages/AddPet";
import VaccinationForm from "./pages/VaccinationForm";
import VaccinationCalendar from "./pages/VaccinationCalendar";
import ServicesMenu from "./pages/ServicesMenu";
import FindVet from "./pages/FindVet";
import FindGroomer from "./pages/FindGroomer";
import DietPlan from "./pages/DietPlan";
import SocialMedia from "./pages/SocialMedia";
import PetParentsNearby from "./pages/PetParentsNearby";
import Events from "./pages/Events";
import Shop from "./pages/Shop";

import { TermsPage } from "./pages/TermsPage";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";
import PlanComparison from "./pages/PlanComparison";

import GroomerDashboard from "./pages/GroomerDashboard";
import VetDashboard from "./pages/VetDashboard";
import TrainerDashboard from "./pages/TrainerDashboard";
import CareCentreDashboard from "./pages/CareCentreDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import EventHostDashboard from "./pages/EventHostDashboard";
import ContactUs from "./pages/ContactUs";
import Settings from "./pages/Settings";
import Profile from "./pages/CustromerProfile";

import Lottie from "lottie-react";
import loadingAnimation from "./assets/lottie/loading-paws.json";

import { SubscriptionProvider } from "./context/SubscriptionContext"; // ✅ added

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Optional: Load subscription plan into context on app start
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.exists() ? userSnap.data() : {};
        const plan = userData.subscription?.plan || "free";

        // Optional: If you also want to update context here, you'll need to lift context usage here too
        // This is mostly handled in Login.jsx already, so not required unless you're skipping login
      }

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
    <SubscriptionProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />

          {/* Customer */}
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
          <Route path="/plans" element={user ? <PlanComparison user={user} /> : <Navigate to="/login" />} />
          <Route path="/payment" element={user ? <PaymentPage user={user} /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/login" />} />
          <Route path="/settings" element={user ? <Settings user={user} /> : <Navigate to="/login" />} />  
          <Route path="/contact" element={user ? <ContactUs user={user} /> : <Navigate to="/login" />} />
          {/* Other Roles */}
          <Route path="/groomer-dashboard" element={<GroomerDashboard />} />
          <Route path="/vet-dashboard" element={<VetDashboard />} />
          <Route path="/trainer-dashboard" element={<TrainerDashboard />} />
          <Route path="/care-centre-dashboard" element={<CareCentreDashboard />} />
          <Route path="/event-host-dashboard" element={<EventHostDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />

          {/* Legal */}
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </SubscriptionProvider>
  );
}

export default App;
