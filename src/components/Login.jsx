import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaEllipsisV } from "react-icons/fa";
import Lottie from "lottie-react";
import loadingAnimation from "../assets/lottie/loading-paws.json";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";

function Login({ setUser }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedRole, setSelectedRole] = useState("customer");
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (selectedRole === "admin") {
        setShowAdminPrompt(true);
        setLoading(false); // Temporarily stop loading until password is entered
        return;
      }

      await handleRoleLogic(user);
    } catch (err) {
      console.error("Login error:", err);
      setLoading(false);
    }
  };

  const handleAdminPasswordSubmit = async () => {
    try {
      setLoading(true);

      const configRef = doc(db, "config", "admin");
      const configSnap = await getDoc(configRef);

      if (!configSnap.exists()) {
        alert("Admin configuration not found.");
        setLoading(false);
        return;
      }

      const correctPassword = configSnap.data().password;
      if (adminPassword !== correctPassword) {
        alert("Incorrect admin password.");
        setLoading(false);
        return;
      }

      const user = auth.currentUser;
      if (!user) {
        alert("User not found after sign-in.");
        return;
      }

      await handleRoleLogic(user);
    } catch (err) {
      console.error("Admin password check failed:", err);
      setLoading(false);
    }
  };

  const handleRoleLogic = async (user) => {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const userData = userSnap.data();

    // 🔥 New: Fetch subscription status and store it (optional)
    const subscriptionStatus = userData.subscription?.plan ?? "free";
    // You can pass this up via props or context
    // Example: setUserSubscriptionStatus(subscriptionStatus); (you’ll need to define this)

    if (!userData.roles.includes(selectedRole)) {
      await updateDoc(userRef, {
        roles: arrayUnion(selectedRole),
        lastUsedRole: selectedRole,
      });
    } else {
      await updateDoc(userRef, {
        lastUsedRole: selectedRole,
      });
    }
  } else {
    await setDoc(userRef, {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      roles: [selectedRole],
      lastUsedRole: selectedRole,
      subscription: {
        active: false,
        plan: null,
        startDate: null,
        expiryDate: null,
      },
      createdAt: new Date().toISOString(),
    });
  }

  setUser(user); // sets the Firebase user
  setTimeout(() => redirectToDashboard(selectedRole), 1200);
};


  const redirectToDashboard = (role) => {
    switch (role) {
      case "groomer":
        navigate("/groomer-dashboard");
        break;
      case "vet":
        navigate("/vet-dashboard");
        break;
      case "trainer":
        navigate("/trainer-dashboard");
        break;
      case "careCentre":
        navigate("/care-centre-dashboard");
        break;
      case "eventHost":
        navigate("/event-host-dashboard");
        break;
      case "admin":
        navigate("/admin-dashboard");
        break;
      default:
        navigate("/dashboard");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-48 h-48">
          <Lottie animationData={loadingAnimation} loop={true} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="https://img.freepik.com/free-photo/3d-rendering-cartoon-dog-portrait_23-2150907260.jpg"
          alt="Pet background"
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80" />
      </div>

      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => setShowDropdown((prev) => !prev)}
          className="text-white p-2 hover:bg-white/10 rounded-full"
        >
          <FaEllipsisV className="w-5 h-5" />
        </button>

        {showDropdown && (
          <div className="mt-2 w-56 bg-white text-black rounded-lg shadow-xl absolute right-0 top-10 z-30 text-sm">
            <div className="px-4 py-2 font-semibold text-gray-700 border-b">Select Role</div>
            {[
  { key: "customer", label: "Pet Owner Login" },
  { key: "eventHost", label: "Advertise Your Product/Service" },
  { key: "admin", label: "Admin" },
].map(({ key, label }) => (

              <button
                key={key}
                onClick={() => {
                  setSelectedRole(key);
                  setShowDropdown(false);
                }}
                className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${
                  selectedRole === key ? "bg-gray-100 font-medium" : ""
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative z-10 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-10 w-[90%] max-w-md shadow-2xl text-white">
        <h2 className="text-3xl font-bold text-center mb-6">Welcome to PetPal</h2>
        <p className="text-center text-sm text-gray-300 mb-8">
          Sign in to manage your pet's health, grooming, and more.
        </p>

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-100 transition"
          >
            <FcGoogle className="w-5 h-5" />
            Sign in with Google
          </button>
        </div>

        <p className="mt-6 text-xs text-gray-400 text-center">
          By continuing, you agree to our {" "}
          <a
            href="/terms"
            className="underline hover:text-white transition"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms of Service
          </a>{" "}
          and {" "}
          <a
            href="/privacy"
            className="underline hover:text-white transition"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </a>.
        </p>

        {showAdminPrompt && (
          <div className="mt-6 bg-white text-black p-4 rounded-xl shadow-lg">
            <label className="block mb-2 font-semibold">Enter Admin Password</label>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={() => {
                  setShowAdminPrompt(false);
                  setAdminPassword("");
                }}
                className="text-sm text-gray-500 hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={handleAdminPasswordSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
