import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDgU5OwLsDBoTeq_jXS-frSAf9kDDwl6L0",
  authDomain: "dbr-ir.firebaseapp.com",
  projectId: "dbr-ir",
  storageBucket: "dbr-ir.firebasestorage.app",
  messagingSenderId: "464886830974",
  appId: "1:464886830974:web:f90d3605f62673136f052f",
  measurementId: "G-THHFG18D5G"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// すべてexportして他ページで使えるように
export {
  auth, db,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
  doc, getDoc, setDoc, collection, query, where, getDocs, deleteDoc
};
