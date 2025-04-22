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
  storageBucket: "purdue-qa-hub.appspot.com",
  messagingSenderId: "822646522679",
  appId: "1:822646522679:web:5cd9837ca0c0dffe33d0b2",
  measurementId: "G-MDVYG6BJ7G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// 연결 확인을 위한 디버깅 코드
console.log("Firebase initialized with project:", firebaseConfig.projectId);

// 인증 상태 디버깅
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log("User is authenticated with UID:", user.uid);
  } else {
    console.log("User is not authenticated");
  }
});

// 로컬 Firebase 에뮬레이터 연결 (개발 환경에서만 사용)
// 로컬 에뮬레이터를 사용하는 경우 주석 해제
// if (window.location.hostname === "localhost") {
//   connectFirestoreEmulator(db, 'localhost', 8080);
//   connectAuthEmulator(auth, 'http://localhost:9099');
//   console.log("Using Firebase emulators");
// }
