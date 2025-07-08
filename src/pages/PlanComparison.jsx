import { useNavigate } from "react-router-dom";
import { useSubscription } from "../context/SubscriptionContext";
import Lottie from "lottie-react";
import premiumAnimation from "../assets/lottie/premium.json"; // Add your Lottie JSON here

export default function PlanComparison() {
  const navigate = useNavigate();
  const { subscriptionPlan } = useSubscription();

  const handleChoosePlan = (plan) => {
    alert(`Redirecting to payment for ${plan.toUpperCase()} plan...`);
    navigate("/payment", { state: { selectedPlan: plan } });
  };

  const features = [
    { feature: "Add Pets", free: "3", pro: "6", pro_plus: "10" },
    { feature: "Chat with Pet Parents Nearby", free: "❌", pro: "✅", pro_plus: "✅" },
    { feature: "Access to Events", free: "❌", pro: "✅", pro_plus: "✅" },
    { feature: "Pet Diet & Care Tips", free: "Basic", pro: "Advanced", pro_plus: "Premium" },
  ];

  const isPro = subscriptionPlan === "pro";
  const isProPlus = subscriptionPlan === "pro_plus";

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 py-10 px-4 overflow-hidden">
      {/* Lottie Background */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <Lottie animationData={premiumAnimation} loop autoPlay />
      </div>

      {/* Top Row: Home and Title */}
      <div className="z-10 relative flex justify-between items-center mb-6 px-2">
        <h1 className="text-3xl font-extrabold text-orange-700">Plans</h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-white text-orange-600 font-bold p-3 rounded-full shadow hover:bg-orange-50"
        >
          🏠
        </button>
      </div>

      {/* Pricing Table Overlay */}
      <div className="relative z-10 flex items-center justify-center">
        <div className="overflow-x-auto backdrop-blur-md bg-white/70 rounded-xl shadow-2xl max-w-5xl w-full pointer-events-auto">
          <table className="w-full text-center border-collapse">
            <thead className="bg-gradient-to-r from-yellow-300 to-orange-300 text-orange-900">
              <tr>
                <th className="p-4 text-lg">Features</th>
                <th className="p-4 text-lg">Free</th>
                <th className="p-4 text-lg">Pro ₹400/mo</th>
                <th className="p-4 text-lg">Pro Plus ₹800/mo</th>
              </tr>
            </thead>
            <tbody className="text-orange-800">
              {features.map((row) => (
                <tr key={row.feature} className="border-t border-orange-200">
                  <td className="p-4 font-semibold text-left">{row.feature}</td>
                  <td className="p-4">{row.free}</td>
                  <td className="p-4">{row.pro}</td>
                  <td className="p-4">{row.pro_plus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-6 mt-10 z-10 relative">
        {!isPro && !isProPlus && (
          <>
            <button
              onClick={() => handleChoosePlan("pro")}
              className="w-52 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg border border-yellow-300"
            >
              Upgrade to Pro
            </button>
            <button
              onClick={() => handleChoosePlan("pro_plus")}
              className="w-52 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg border border-yellow-300"
            >
              Upgrade to Pro Plus
            </button>
          </>
        )}
        {isPro && !isProPlus && (
          <button
            onClick={() => handleChoosePlan("pro_plus")}
            className="w-52 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg border border-yellow-300"
          >
            Upgrade to Pro Plus
          </button>
        )}
        {isProPlus && (
          <div className="text-xl font-semibold text-green-700">
            🎉 You’re already on the highest plan!
          </div>
        )}
      </div>
    </div>
  );
}