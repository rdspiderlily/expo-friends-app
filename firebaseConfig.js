import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBGEcluAwNc0wAA6cmxn6Fa14dqwZmxmqg",
  authDomain: "friendsapp-5a0d7.firebaseapp.com",
  projectId: "friendsapp-5a0d7",
  storageBucket: "friendsapp-5a0d7.firebasestorage.app",
  messagingSenderId: "741187440803",
  appId: "1:741187440803:web:03bb3087426c8eb419af16"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);