import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 🔹 Firebase web app config
const firebaseConfig = {
  apiKey: "AIzaSyABUYlRdn_iz2FFMftSmUfBksRSi8f1_OM",
  authDomain: "trendyolclone-fa48b.firebaseapp.com",
  projectId: "trendyolclone-fa48b",
  storageBucket: "trendyolclone-fa48b.appspot.com",
  messagingSenderId: "457823103137",
  appId: "1:457823103137:web:bc2c0a1a55986fcc5aa8e0",
  measurementId: "G-1PWDJCMD5F"
};

// 🔹 Firebase başlat
const app = initializeApp(firebaseConfig);

// 🔹 Servisleri dışa aktar
export const auth = getAuth(app);
export const db = getFirestore(app);
