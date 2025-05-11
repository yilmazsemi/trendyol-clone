import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyABUYlRdn_iz2FFMftSmUfBksRSi8f1_OM",
    authDomain: "trendyolclone-fa48b.firebaseapp.com",
    projectId: "trendyolclone-fa48b",
    storageBucket: "trendyolclone-fa48b.appspot.com",
    messagingSenderId: "457823103137",
    appId: "1:457823103137:web:abc123def456"
  };
  

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
