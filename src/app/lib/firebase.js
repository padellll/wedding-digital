import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "API_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "PROJECT_ID",
  storageBucket: "STORAGE",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);