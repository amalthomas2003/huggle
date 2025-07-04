import DashboardHeader from "../components/DashboardHeader";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

function VetDashboard() {
  const [user] = useAuthState(auth);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader username={user.displayName} userPhoto={user.photoURL} />

      {/* Your vet dashboard content here */}
      <div className="p-4">Welcome to the Vet Dashboard</div>
    </div>
  );
}

export default VetDashboard;
