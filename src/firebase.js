import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyC4snBq33USfcwL2ChMruTfyyVK-Hz2h3s",
  authDomain: "cqqrs-838fa.firebaseapp.com",
  projectId: "cqqrs-838fa",
  storageBucket: "cqqrs-838fa.firebasestorage.app",
  messagingSenderId: "963087744250",
  appId: "1:963087744250:web:763e259e17bb949fd65d43"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };