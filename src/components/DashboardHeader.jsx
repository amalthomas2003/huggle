// src/components/DashboardHeader.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { Menu } from "lucide-react"; // You can use any icon library

const DashboardHeader = ({ username, userPhoto }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-4 bg-white shadow-sm relative">
      <div className="flex items-center gap-3">
        <img
          src={userPhoto}
          alt="User"
          className="w-10 h-10 rounded-full border"
        />
        <h2 className="text-lg font-bold text-gray-800">Hi, {username}</h2>
      </div>
      <button
        onClick={() => setMenuOpen((prev) => !prev)}
        className="hover:text-orange-600 transition"
      >
        <Menu />
      </button>

      {menuOpen && (
        <div className="absolute top-16 right-4 bg-white border border-orange-300 rounded-lg shadow-xl z-50 w-40">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-left hover:bg-orange-100 text-sm"
          >
            Log Out
          </button>
          <button
            onClick={() => navigate("/contact")}
            className="w-full px-4 py-2 text-left hover:bg-orange-100 text-sm"
          >
            Contact Us
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;
