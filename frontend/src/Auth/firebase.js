import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA7jWyaZrnUW-bUvPO3rUemcGodEOLTsfg",
  authDomain: "osdag-web.firebaseapp.com",
  projectId: "osdag-web",
  storageBucket: "osdag-web.firebasestorage.app",
  messagingSenderId: "626332992229",
  appId: "1:626332992229:web:55ba0732271dad426c0a0c",
  measurementId: "G-THD12GCPGB"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);