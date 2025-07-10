import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore"; // Import onSnapshot
import { isAfter, parseISO } from 'date-fns'; // Import date-fns utilities

export const SubscriptionContext = createContext();

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider = ({ children }) => {
  // We'll now store the entire subscription object, or null if no subscription/user
  const [subscription, setSubscription] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true); // New loading state

  useEffect(() => {
    let unsubscribeFirestore = () => {}; // Initialize as a no-op function for cleanup

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoadingSubscription(true); // Start loading when user is found
        const userDocRef = doc(db, "users", user.uid);

        // Set up real-time listener for the user's document
        unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists() && docSnap.data().subscription) {
            const fetchedSubscription = docSnap.data().subscription;
            let currentSubscriptionState = { ...fetchedSubscription }; // Create a mutable copy

            // --- IMPORTANT: Client-side check for expiry ---
            // This ensures immediate UI reaction even before the backend function runs.
            if (currentSubscriptionState.active && currentSubscriptionState.expiryDate) {
              const expiryDateTime = parseISO(currentSubscriptionState.expiryDate);
              const now = new Date(); // Get current time at the moment of check

              if (isAfter(now, expiryDateTime)) {
                console.warn(`Subscription for user ${user.uid} (plan: ${currentSubscriptionState.plan}) has expired on client-side.`);
                // Mark as expired for UI purposes
                currentSubscriptionState.active = false;
                currentSubscriptionState.plan = "expired"; // Use a specific string for expired state
              }
            }
            setSubscription(currentSubscriptionState);

          } else {
            // User exists but has no subscription data, or doc doesn't exist
            setSubscription({ active: false, plan: "free", expiryDate: null }); // Default to free
          }
          setLoadingSubscription(false); // Done loading
        }, (error) => {
          console.error("Error fetching real-time subscription:", error);
          setSubscription({ active: false, plan: "free", expiryDate: null }); // Default to free on error
          setLoadingSubscription(false); // Done loading
        });

      } else {
        // No user logged in
        setSubscription({ active: false, plan: "free", expiryDate: null }); // Default to free
        setLoadingSubscription(false); // Done loading
      }
    });

    // Cleanup function for both auth and firestore listeners
    return () => {
      unsubscribeAuth();
      unsubscribeFirestore(); // Clean up the Firestore listener
    };
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    // Provide the full 'subscription' object and 'loadingSubscription' state
    <SubscriptionContext.Provider value={{ subscription, loadingSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
};