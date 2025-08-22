// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "attendease-key0m",
  "appId": "1:1010729430974:web:4c9c683adc2c7af89e53ef",
  "storageBucket": "attendease-key0m.firebasestorage.app",
  "apiKey": "AIzaSyCdxKtdYlpEC2HJYzHaNgS1SjPOOKGIjvM",
  "authDomain": "attendease-key0m.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1010729430974"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
