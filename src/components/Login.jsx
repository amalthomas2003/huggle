import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import { useNavigate } from "react-router-dom";

function Login({ setUser }) {
  const navigate = useNavigate(); // 👈 hook to navigate after login

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      navigate("/dashboard", { replace: true }); // 👈 go to dashboard & prevent back
    } catch (err) {
      console.error("Login Error", err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-10">
      <button
        onClick={handleLogin}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Sign in with Google
      </button>
    </div>
  );
}

export default Login;
