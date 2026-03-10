
'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, Firestore, doc, onSnapshot, DocumentData, Query, DocumentReference } from 'firebase/firestore';
import { useState, useEffect } from 'react';

// Your new web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB5E2bcxYpLFOj7v0tA4ryGKvZspDMQn4I",
  authDomain: "codeathon-ai-ff8c1.firebaseapp.com",
  databaseURL: "https://codeathon-ai-ff8c1-default-rtdb.firebaseio.com",
  projectId: "codeathon-ai-ff8c1",
  storageBucket: "codeathon-ai-ff8c1.firebasestorage.app",
  messagingSenderId: "297428971976",
  appId: "1:297428971976:web:ab31ef239109ddc03d50fd",
  measurementId: "G-45RBLM0RJX"
};

function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) return getApp();
  return initializeApp(firebaseConfig);
}

const app = getFirebaseApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

/**
 * Custom hook to manage Firebase user state.
 */
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { user, loading };
}

/**
 * Custom hook to fetch a single Firestore document in real-time.
 */
export function useDoc(docRef: DocumentReference | null) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!docRef) {
      setData(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        setData(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
        setLoading(false);
      },
      (err) => {
        console.error("useDoc error:", err);
        setError(err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [docRef]);

  return { data, loading, error };
}

/**
 * Custom hook to fetch a Firestore collection/query in real-time.
 */
export function useCollection(query: Query | null) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setData([]);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      query,
      (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setData(docs);
        setLoading(false);
      },
      (err) => {
        console.error("useCollection error:", err);
        setError(err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [query]);

  return { data, loading, error };
}

export function useAuth(): Auth {
  return auth;
}

export function useFirestore(): Firestore {
  return db;
}
