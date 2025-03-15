// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB4XdmP5R-CJl8-WKwocnl12xRs5WWsGRc",
  authDomain: "purdue-qa-hub.firebaseapp.com",
  projectId: "purdue-qa-hub",
  storageBucket: "purdue-qa-hub.firebasestorage.app",
  messagingSenderId: "822646522679",
  appId: "1:822646522679:web:5cd9837ca0c0dffe33d0b2",
  measurementId: "G-MDVYG6BJ7G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
