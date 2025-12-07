// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAYL1gU_wpczVfaC5g7U9tOhh23HWrA9WY",
  authDomain: "movieflixgpt-624bf.firebaseapp.com",
  projectId: "movieflixgpt-624bf",
  storageBucket: "movieflixgpt-624bf.firebasestorage.app",
  messagingSenderId: "671653934774",
  appId: "1:671653934774:web:265370ca99c2ada47a5817",
  measurementId: "G-JK4XLQL2TE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const analytics = getAnalytics(app);