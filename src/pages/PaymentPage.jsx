import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getApp } from "firebase/app";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedPlan = location.state?.selectedPlan;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initiatePayment = async () => {
      if (!selectedPlan) {
        navigate("/plans");
        return;
      }

      try {
        // 1. Fetch Razorpay Key from Firestore
        const keyDoc = await getDoc(doc(db, "payment", "razorpayKey"));
        const razorpayKey = keyDoc.exists() ? keyDoc.data().key : null;

        if (!razorpayKey) throw new Error("Razorpay key not found");

        // 2. Call Firebase Function to Create Order
        const functions = getFunctions(getApp());
        const createOrder = httpsCallable(functions, "createOrder");
        const result = await createOrder({ plan: selectedPlan });

        const { amount, id: order_id, currency } = result.data;

        // 3. Open Razorpay Checkout
        const options = {
          key: razorpayKey,
          amount,
          currency,
          name: "Huggle Premium",
          description: `Subscription: ${selectedPlan}`,
          order_id,
          handler: async function (response) {
            const userRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(userRef, {
              subscription: {
                active: "true",
                plan: selectedPlan,
                startDate: new Date().toISOString(),
                expiryDate: null,
              },
            });
            alert("🎉 Payment successful! Plan upgraded.");
            navigate("/dashboard");
          },
          prefill: {
            name: auth.currentUser.displayName,
            email: auth.currentUser.email,
          },
          theme: {
            color: "#fb923c",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        console.error("Payment initiation failed:", err);
        alert("Payment failed. Try again later.");
        navigate("/plans");
      } finally {
        setLoading(false);
      }
    };

    initiatePayment();
  }, [selectedPlan, navigate]);

  return (
    <div className="min-h-screen flex justify-center items-center text-orange-600 font-semibold text-xl">
      {loading ? "Please wait while we redirect to Razorpay..." : null}
    </div>
  );
}
