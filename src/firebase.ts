
'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, Firestore, doc, onSnapshot, DocumentData, collection, Query, DocumentReference } from 'firebase/firestore';
import { useState, useEffect } from 'react';

const firebaseConfig = {
  apiKey: "AIzaSyC3OkKB2A_lGnwlUci8Bt6wgS_9S15zHFc",
  authDomain: "codeathon-ai.firebaseapp.com",
  projectId: "codeathon-ai",
  storageBucket: "codeathon-ai.firebasestorage.app",
  messagingSenderId: "891748040035",
  appId: "1:891748040035:web:4ed0d0494054bda20a6756",
  measurementId: "G-6GQV6J0ZQW"
};

function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) return getApp();
  return initializeApp(firebaseConfig);
}

const app = getFirebaseApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

export function useAuth(): Auth {
  return auth;
}

export function useFirestore(): Firestore {
  return db;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  return { user, loading };
}

export function useDoc(docRef: DocumentReference | null) {
  const [data, setData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!docRef) {
      setLoading(false);
      return;
    }

    return onSnapshot(
      docRef,
      (snapshot) => {
        setData(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
  }, [docRef]);

  return { data, loading, error };
}

export function useCollection(query: Query | null) {
  const [data, setData] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      return;
    }

    return onSnapshot(
      query,
      (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setData(docs);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
  }, [query]);

  return { data, loading, error };
}
