import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBo92_PV54UzVwfWamlGqz94-cMiHwIPwk",
  authDomain: "faida-soko.firebaseapp.com",
  projectId: "faida-soko",
  storageBucket: "faida-soko.firebasestorage.app",
  messagingSenderId: "700272156879",
  appId: "1:700272156879:web:fac2558232d91d9b34d7ba",
  measurementId: "G-N4BLC3BG7L"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
