import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { CalendarDays, Dog, LocateFixed, LogOut, PlusCircle, UtensilsCrossed } from "lucide-react";
import Lottie from "lottie-react";
import pawAnimation from "../assets/lottie/paw.json"; // 👈 You’ll add this below

function CustomerDashboard({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const today = new Date().toDateString();
  const nextVaccine = "July 10, 2025"; // Replace this with dynamic date later

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-blue-100 p-4">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-700">Welcome, {user.displayName.split(" ")[0]}</h1>
        <button onClick={handleLogout} className="flex items-center gap-1 text-red-500 hover:text-red-700">
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </header>

      <div className="bg-white rounded-2xl shadow-xl p-4 flex flex-col items-center text-center mb-6">
        <Lottie animationData={pawAnimation} className="w-28 h-28" />
        <p className="text-lg font-semibold text-gray-800 mb-1">Next Vaccination</p>
        <p className="text-sm text-gray-600">{nextVaccine}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <DashboardCard
          icon={<PlusCircle className="w-8 h-8 text-blue-500" />}
          title="Add Pet"
          onClick={() => navigate("/add-pet")}
        />
        <DashboardCard
          icon={<CalendarDays className="w-8 h-8 text-green-500" />}
          title="View Calendar"
          onClick={() => navigate("/calendar")}
        />
        <DashboardCard
          icon={<LocateFixed className="w-8 h-8 text-purple-500" />}
          title="Find Vets Nearby"
          onClick={() => navigate("/services?type=vet")}
        />
        <DashboardCard
          icon={<Dog className="w-8 h-8 text-yellow-600" />}
          title="Find Groomers"
          onClick={() => navigate("/services?type=groomer")}
        />
        <DashboardCard
          icon={<UtensilsCrossed className="w-8 h-8 text-pink-600" />}
          title="Diet Plan"
          onClick={() => navigate("/services?type=diet")}
        />
      </div>
    </div>
  );
}

function DashboardCard({ icon, title, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white shadow-md rounded-2xl flex flex-col items-center justify-center py-6 cursor-pointer transition hover:scale-105"
    >
      {icon}
      <p className="mt-2 text-sm font-medium text-gray-800">{title}</p>
    </div>
  );
}

export default CustomerDashboard;
