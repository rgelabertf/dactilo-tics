import { initializeApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBgX7wUj9sIlpeG71XJ0H7YxIbIYC1ecmk",
  authDomain: "dactilo-tics-app.firebaseapp.com",
  projectId: "dactilo-tics-app",
  storageBucket: "dactilo-tics-app.firebasestorage.app",
  messagingSenderId: "153316735522",
  appId: "1:153316735522:web:eb0b65199519bcb0cc287b",
  measurementId: "G-V68593W033"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence);
