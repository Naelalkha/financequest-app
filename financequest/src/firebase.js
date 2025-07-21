// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCnZ3gWmJZYS2UzJMz9p-l0y_jrP4IMxdI",
  authDomain: "financequest-pwa.firebaseapp.com",
  projectId: "financequest-pwa",
  storageBucket: "financequest-pwa.firebasestorage.app",
  messagingSenderId: "131538371852",
  appId: "1:131538371852:web:fa4c91813ec0beed097529",
  measurementId: "G-73ZEYJKER0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);