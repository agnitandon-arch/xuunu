import type { VercelResponse } from "@vercel/node";
import { Firestore, Timestamp } from "firebase-admin/firestore";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getFirestoreDb(): Firestore {
  if (getApps().length === 0) {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is required");
    }
    const serviceAccount = JSON.parse(serviceAccountKey);
    initializeApp({
      credential: cert(serviceAccount),
    });
  }
  return getFirestore();
}

function toDate(timestamp: any): Date | null {
  if (!timestamp) return null;
  if (timestamp.toDate) return timestamp.toDate();
  if (timestamp instanceof Date) return timestamp;
  return null;
}

export function cors(res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export const storage = {
  async getUser(id: string) {
    const db = getFirestoreDb();
    const doc = await db.collection("users").doc(id).get();
    if (!doc.exists) return undefined;
    const data = doc.data()!;
    return { id: doc.id, ...data, createdAt: toDate(data.createdAt) };
  },

  async getUserByUsername(username: string) {
    const db = getFirestoreDb();
    const snapshot = await db.collection("users").where("username", "==", username).limit(1).get();
    if (snapshot.empty) return undefined;
    const doc = snapshot.docs[0];
    const data = doc.data();
    return { id: doc.id, ...data, createdAt: toDate(data.createdAt) };
  },

  async createUser(user: any) {
    const db = getFirestoreDb();
    const docRef = db.collection("users").doc(user.id);
    await docRef.set({ ...user, createdAt: Timestamp.now() });
    return { ...user, createdAt: new Date() };
  },

  async updateUser(id: string, updates: any) {
    const db = getFirestoreDb();
    await db.collection("users").doc(id).update(updates);
    return this.getUser(id);
  },

  async getUserHealthEntries(userId: string, limit: number = 50) {
    const db = getFirestoreDb();
    const snapshot = await db.collection("healthEntries")
      .where("userId", "==", userId)
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), timestamp: toDate(doc.data().timestamp) }));
  },

  async createHealthEntry(entry: any) {
    const db = getFirestoreDb();
    const docRef = await db.collection("healthEntries").add({ ...entry, timestamp: Timestamp.now() });
    return { id: docRef.id, ...entry, timestamp: new Date() };
  },

  async getLatestHealthEntry(userId: string) {
    const entries = await this.getUserHealthEntries(userId, 1);
    return entries[0] || null;
  },

  async getUserEnvironmentalReadings(userId: string, limit: number = 50) {
    const db = getFirestoreDb();
    const snapshot = await db.collection("environmentalReadings")
      .where("userId", "==", userId)
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), timestamp: toDate(doc.data().timestamp) }));
  },

  async createEnvironmentalReading(reading: any) {
    const db = getFirestoreDb();
    const docRef = await db.collection("environmentalReadings").add({ ...reading, timestamp: Timestamp.now() });
    return { id: docRef.id, ...reading, timestamp: new Date() };
  },

  async getUserNotes(userId: string, limit: number = 50) {
    const db = getFirestoreDb();
    const snapshot = await db.collection("notes")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: toDate(doc.data().createdAt) }));
  },

  async createNote(note: any) {
    const db = getFirestoreDb();
    const docRef = await db.collection("notes").add({ ...note, createdAt: Timestamp.now(), updatedAt: Timestamp.now() });
    return { id: docRef.id, ...note, createdAt: new Date() };
  },

  async getNote(id: string) {
    const db = getFirestoreDb();
    const doc = await db.collection("notes").doc(id).get();
    if (!doc.exists) return undefined;
    return { id: doc.id, ...doc.data() };
  },

  async updateNote(id: string, updates: any) {
    const db = getFirestoreDb();
    await db.collection("notes").doc(id).update({ ...updates, updatedAt: Timestamp.now() });
    return this.getNote(id);
  },

  async deleteNote(id: string) {
    const db = getFirestoreDb();
    await db.collection("notes").doc(id).delete();
  },

  async getUserReminders(userId: string, limit: number = 50) {
    const db = getFirestoreDb();
    const snapshot = await db.collection("reminders")
      .where("userId", "==", userId)
      .orderBy("scheduledAt", "desc")
      .limit(limit)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), scheduledAt: toDate(doc.data().scheduledAt) }));
  },

  async createReminder(reminder: any) {
    const db = getFirestoreDb();
    const scheduledAt = typeof reminder.scheduledAt === "string" 
      ? Timestamp.fromDate(new Date(reminder.scheduledAt))
      : Timestamp.now();
    const docRef = await db.collection("reminders").add({ 
      ...reminder, 
      scheduledAt,
      createdAt: Timestamp.now(), 
      updatedAt: Timestamp.now() 
    });
    return { id: docRef.id, ...reminder, createdAt: new Date() };
  },

  async getReminder(id: string) {
    const db = getFirestoreDb();
    const doc = await db.collection("reminders").doc(id).get();
    if (!doc.exists) return undefined;
    return { id: doc.id, ...doc.data() };
  },

  async updateReminder(id: string, updates: any) {
    const db = getFirestoreDb();
    await db.collection("reminders").doc(id).update({ ...updates, updatedAt: Timestamp.now() });
    return this.getReminder(id);
  },

  async deleteReminder(id: string) {
    const db = getFirestoreDb();
    await db.collection("reminders").doc(id).delete();
  },

  async getLatestBioSignatureSnapshot(userId: string) {
    const db = getFirestoreDb();
    const snapshot = await db.collection("bioSignatureSnapshots")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data(), createdAt: toDate(doc.data().createdAt) };
  },

  async createBioSignatureSnapshot(snapshot: any) {
    const db = getFirestoreDb();
    const docRef = await db.collection("bioSignatureSnapshots").add({ ...snapshot, createdAt: Timestamp.now() });
    return { id: docRef.id, ...snapshot, createdAt: new Date() };
  },

  async getBioSignatureHistory(userId: string, limit: number = 30) {
    const db = getFirestoreDb();
    const snapshot = await db.collection("bioSignatureSnapshots")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: toDate(doc.data().createdAt) }));
  },

  async getUserApiCredentials(userId: string) {
    const db = getFirestoreDb();
    const snapshot = await db.collection("userApiCredentials")
      .where("userId", "==", userId)
      .limit(1)
      .get();
    if (snapshot.empty) return undefined;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  },

  async upsertUserApiCredentials(userId: string, credentials: any) {
    const db = getFirestoreDb();
    const existing = await this.getUserApiCredentials(userId);
    if (existing) {
      await db.collection("userApiCredentials").doc(existing.id).update(credentials);
      return { ...existing, ...credentials };
    } else {
      const docRef = await db.collection("userApiCredentials").add({ userId, ...credentials });
      return { id: docRef.id, userId, ...credentials };
    }
  }
};
