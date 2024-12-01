// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyALegOi2pOmQFDs0oJo6NxUeLirRyS-TZE",
  authDomain: "travellog-23e2a.firebaseapp.com",
  projectId: "travellog-23e2a",
  storageBucket: "travellog-23e2a.firebasestorage.app",
  messagingSenderId: "563970264237",
  appId: "1:563970264237:web:9e31830039c2574a814a24"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db=getFirestore(app);
export {app,db};