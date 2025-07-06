// src/firebase.js

// Import Firebase core and required services
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ✅ Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDyTc5UHH7yH3e-FSLOJGtACc1zAE5MphI",
  authDomain: "pet-care-app-7f23d.firebaseapp.com",
  projectId: "pet-care-app-7f23d",
  storageBucket: "pet-care-app-7f23d.firebasestorage.app", // ✅ Corrected domain
  messagingSenderId: "478960090418",
  appId: "1:478960090418:web:9e0ab227c7839b026bab2b",
  measurementId: "G-44KD9FFBDX"
};

// ✅ Initialize Firebase App
const app = initializeApp(firebaseConfig);

// ✅ Set up Firebase services
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

// ✅ Export all Firebase services for use in other files
export { auth, provider, db, storage };
