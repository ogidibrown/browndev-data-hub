import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
  doc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { OrderRecord } from "@/types";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// ── Collection reference ──────────────────────────────────────────────────────
const ordersCol = () => collection(db, "orders");

// ── Create order ──────────────────────────────────────────────────────────────
export async function createOrder(data: Omit<OrderRecord, "id">) {
  const docRef = await addDoc(ordersCol(), {
    ...data,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

// ── Update order by Firestore document id ────────────────────────────────────
export async function updateOrderById(
  docId: string,
  updates: Partial<OrderRecord>
) {
  const ref = doc(db, "orders", docId);
  await updateDoc(ref, { ...updates, updatedAt: Timestamp.now() });
}

// ── Find order by Paystack reference ─────────────────────────────────────────
export async function findOrderByRef(paystackRef: string) {
  const q = query(ordersCol(), where("paystackRef", "==", paystackRef), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as OrderRecord;
}

// ── Recent orders by email ────────────────────────────────────────────────────
export async function getRecentOrdersByEmail(email: string, count = 10) {
  const q = query(
    ordersCol(),
    where("email", "==", email),
    orderBy("createdAt", "desc"),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as OrderRecord));
}
