import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
  doc,
  getAggregateFromServer,
  sum,
  count,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Bundle, OrderRecord } from "@/types";

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

// ── Collection references ─────────────────────────────────────────────────────
const ordersCol = () => collection(db, "orders");
const bundlesCol = () => collection(db, "bundles");

// ── Bundle functions ──────────────────────────────────────────────────────────

export async function getBundleById(id: string): Promise<Bundle | null> {
  const snap = await getDoc(doc(db, "bundles", id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Bundle;
}

export async function getBundlesByNetwork(network: string): Promise<Bundle[]> {
  const q = query(
    bundlesCol(),
    where("network", "==", network),
    where("active", "==", true),
    orderBy("dataSize", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Bundle));
}

export async function upsertBundle(id: string, data: Omit<Bundle, "id">): Promise<void> {
  await setDoc(doc(db, "bundles", id), data);
}

// ── Order functions ───────────────────────────────────────────────────────────

export async function createOrder(data: Omit<OrderRecord, "id">) {
  const docRef = await addDoc(ordersCol(), {
    ...data,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateOrderById(
  docId: string,
  updates: Partial<OrderRecord>
) {
  const ref = doc(db, "orders", docId);
  await updateDoc(ref, { ...updates, updatedAt: Timestamp.now() });
}

export async function findOrderByRef(paystackRef: string) {
  const q = query(ordersCol(), where("paystackRef", "==", paystackRef), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as OrderRecord;
}

export async function getRecentOrdersByEmail(email: string, n = 10) {
  const q = query(
    ordersCol(),
    where("email", "==", email),
    orderBy("createdAt", "desc"),
    limit(n)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as OrderRecord));
}

// ── Analytics aggregations ────────────────────────────────────────────────────

export interface OrderStats {
  total: number;
  completed: number;
  failed: number;
  pending: number;
  revenue: number;
  todayCompleted: number;
  todayRevenue: number;
  monthCompleted: number;
  monthRevenue: number;
}

export async function getOrderStats(): Promise<OrderStats> {
  const col = ordersCol();

  const startOfToday = Timestamp.fromDate(
    new Date(new Date().setHours(0, 0, 0, 0))
  );
  const startOfMonth = Timestamp.fromDate(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );

  const [totalAgg, completedAgg, failedAgg, pendingAgg, todayAgg, monthAgg] =
    await Promise.all([
      getAggregateFromServer(col, { total: count() }),

      getAggregateFromServer(
        query(col, where("status", "==", "Completed")),
        { completed: count(), revenue: sum("amount") }
      ),

      getAggregateFromServer(
        query(col, where("status", "==", "Failed")),
        { failed: count() }
      ),

      getAggregateFromServer(
        query(col, where("status", "==", "Pending")),
        { pending: count() }
      ),

      getAggregateFromServer(
        query(
          col,
          where("status", "==", "Completed"),
          where("createdAt", ">=", startOfToday)
        ),
        { completed: count(), revenue: sum("amount") }
      ),

      getAggregateFromServer(
        query(
          col,
          where("status", "==", "Completed"),
          where("createdAt", ">=", startOfMonth)
        ),
        { completed: count(), revenue: sum("amount") }
      ),
    ]);

  return {
    total: totalAgg.data().total,
    completed: completedAgg.data().completed,
    failed: failedAgg.data().failed,
    pending: pendingAgg.data().pending,
    revenue: completedAgg.data().revenue ?? 0,
    todayCompleted: todayAgg.data().completed,
    todayRevenue: todayAgg.data().revenue ?? 0,
    monthCompleted: monthAgg.data().completed,
    monthRevenue: monthAgg.data().revenue ?? 0,
  };
}
