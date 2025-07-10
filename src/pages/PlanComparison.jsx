import { useNavigate } from "react-router-dom";
import { useSubscription } from "../context/SubscriptionContext"; // Import useSubscription
import Lottie from "lottie-react";
import premiumAnimation from "../assets/lottie/premium.json";
import { Home } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase";
import { addMonths } from 'date-fns';

export default function PlanComparison() {
  const navigate = useNavigate();
  // Get the full 'subscription' object and loading state from your context
  const { subscription, loadingSubscription } = useSubscription();

  // Derive current plan status from the subscription object
  const currentPlan = subscription?.plan; 
  const isSubscriptionActive = subscription?.active; 

  const handleChoosePlan = async (plan) => {
    const amount = plan === "pro" ? 400 : plan === "pro_plus" ? 800 : null;

    if (!amount) {
      alert("Invalid plan selected.");
      return;
    }

    try {
      console.log("⏳ Attempting to create Razorpay order for:", { plan, amount });

      const functionURL = "https://us-central1-pet-care-app-7f23d.cloudfunctions.net/createOrder"; 
      const response = await fetch(functionURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount, plan }),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (parseError) {
          errorData = { error: `Non-JSON response: ${await response.text()}` };
        }
        console.error("❌ Backend Error Response:", errorData);
        throw new Error(
          `Failed to create order: ${errorData.error || response.statusText}. Details: ${errorData.details || "No further details."}`
        );
      }

      const result = await response.json();
      console.log("✅ Razorpay order creation response from backend:", result);

      if (!result.success || !result.orderId || !result.keyId || !result.amount || !result.currency) {
        console.error("❌ Invalid or incomplete order object received from backend:", result);
        throw new Error("Invalid Razorpay order object: Missing required data from backend.");
      }

      const options = {
        key: result.keyId,
        amount: result.amount,
        currency: result.currency,
        name: "Huggle Premium",
        description: `Upgrade to ${plan.toUpperCase()} Plan`,
        order_id: result.orderId,
        handler: async function (response) {
          console.log("🎉 Payment successful! Razorpay response:", response);

          const user = getAuth().currentUser;
          if (!user) {
            console.error("No authenticated user found after payment.");
            alert("Payment successful, but user data update failed. Please contact support.");
            navigate("/dashboard");
            return;
          }

          const userRef = doc(db, "users", user.uid);
          try {
            const now = new Date();
            const expiry = addMonths(now, 3); // Calculate expiry 3 months from now

            await updateDoc(userRef, {
              subscription: {
                plan: plan,
                active: true,
                startDate: now.toISOString(), // Set current date as start date
                expiryDate: expiry.toISOString(), // Set calculated expiry date
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              },
            });
            console.log("✅ User subscription updated in Firestore.");

            alert(`🎉 Payment Successful! You are now on the ${plan.toUpperCase()} plan.`);
            navigate("/dashboard");
          } catch (firestoreError) {
            console.error("❌ Failed to update Firestore after successful payment:", firestoreError);
            alert("Payment successful, but failed to update your subscription. Please contact support.");
            navigate("/dashboard");
          }
        },
        prefill: {
          name: getAuth().currentUser?.displayName || "",
          email: getAuth().currentUser?.email || "",
          contact: getAuth().currentUser?.phoneNumber || "",
        },
        theme: {
          color: "#f97316",
        },
        modal: {
          ondismiss: function () {
            console.log('Payment modal dismissed by user.');
          }
        }
      };

      if (typeof window.Razorpay === 'undefined') {
        console.error("❌ Razorpay SDK not loaded. Please ensure the script is included in your HTML.");
        alert("Payment gateway not available. Please try again later or contact support.");
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("❌ Error during Razorpay flow:", err);
      alert(`Something went wrong: ${err.message || "An unexpected error occurred. Please try again."}`);
    }
  };

  const features = [
    { feature: "Add Pets", free: "3", pro: "6", pro_plus: "10" },
    { feature: "Chat with Pet Parents Nearby", free: "❌", pro: "✅", pro_plus: "✅" },
    { feature: "Access to Events", free: "❌", pro: "✅", pro_plus: "✅" },
    { feature: "Pet Diet & Care Tips", free: "Basic", pro: "Advanced", pro_plus: "Premium" },
  ];

  // Derive plan status for UI rendering
  // The useSubscription hook should set `subscription.plan` to "expired" if the date passes,
  // so we can rely on `currentPlan` to be "free", "pro", "pro_plus", or "expired".
  const isFree = currentPlan === "free" || currentPlan === null; // New users start with null or 'free'
  const isPro = currentPlan === "pro" && isSubscriptionActive;
  const isProPlus = currentPlan === "pro_plus" && isSubscriptionActive;
  const isExpired = currentPlan === "expired"; // Assuming context sets "expired" when appropriate

  if (loadingSubscription) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-orange-50">
        <p className="text-xl text-orange-700">Loading subscription plans...</p>
      </div>
    );
  }

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
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-full shadow flex items-center gap-1"
        >
          <Home size={18} /> Home
        </button>
      </div>

      {/* Pricing Table */}
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

      {/* Buttons for Plan Selection/Upgrade */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-6 mt-10 z-10 relative">
        {/* If user is Free or Expired, show both Pro and Pro Plus options */}
        {(isFree || isExpired) && (
          <>
            <button
              onClick={() => handleChoosePlan("pro")}
              className="w-52 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg border border-yellow-300"
            >
              Go Pro
            </button>
            <button
              onClick={() => handleChoosePlan("pro_plus")}
              className="w-52 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg border border-yellow-300"
            >
              Go Pro Plus
            </button>
          </>
        )}
        
        {/* If user is Pro, show only the Upgrade to Pro Plus option */}
        {isPro && (
          <button
            onClick={() => handleChoosePlan("pro_plus")}
            className="w-52 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg border border-yellow-300"
          >
            Upgrade to Pro Plus
          </button>
        )}

        {/* If user is Pro Plus (highest plan), display a message */}
        {isProPlus && (
          <div className="text-xl font-semibold text-green-700">
            🎉 You’re already on the highest plan!
          </div>
        )}
      </div>
    </div>
  );
}