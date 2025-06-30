import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";

function Login({ setUser }) {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Google Login Error", err);
    }
  };

  const handleEmailLogin = () => {
    navigate("/login/email");
  };

  const handleAppleLogin = () => {
    alert("Apple Login is currently not available."); // placeholder
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://img.freepik.com/free-photo/3d-rendering-cartoon-dog-portrait_23-2150907260.jpg"
          alt="Pet background"
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/80" />
      </div>

      {/* Login Box */}
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
  By continuing, you agree to our{" "}
  <a
    href="/terms"
    className="underline hover:text-white transition"
    target="_blank"
    rel="noopener noreferrer"
  >
    Terms of Service
  </a>{" "}
  and{" "}
  <a
    href="/privacy"
    className="underline hover:text-white transition"
    target="_blank"
    rel="noopener noreferrer"
  >
    Privacy Policy
  </a>.
</p>

      </div>
    </div>
  );
}

export default Login;
