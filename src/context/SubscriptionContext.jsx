import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export const SubscriptionContext = createContext();

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider = ({ children }) => {
  const [subscriptionPlan, setSubscriptionPlan] = useState("free");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            const plan = userData.subscription?.plan || "free";
            setSubscriptionPlan(plan);
          } else {
            setSubscriptionPlan("free");
          }
        } catch (err) {
          console.error("Failed to fetch subscription:", err);
          setSubscriptionPlan("free");
        }
      } else {
        setSubscriptionPlan("free");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <SubscriptionContext.Provider value={{ subscriptionPlan, setSubscriptionPlan }}>
      {children}
    </SubscriptionContext.Provider>
  );
};
