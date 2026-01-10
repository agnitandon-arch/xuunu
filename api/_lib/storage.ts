import type { VercelResponse } from "@vercel/node";
import { Firestore, Timestamp } from "firebase-admin/firestore";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getFirestoreDb(): Firestore {
  if (getApps().length === 0) {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      console.error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set");
      throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is required");
    }
    
    try {
      const serviceAccount = JSON.parse(serviceAccountKey);
      
      // Validate required fields
      if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
        console.error("Invalid service account key: missing required fields");
        throw new Error("Invalid service account key: missing required fields (project_id, private_key, or client_email)");
      }
      
      // Fix private key if it has escaped newlines (common when stored as env var)
      if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
      
      initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
      
      console.log("Firebase Admin initialized successfully for project:", serviceAccount.project_id);
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY as JSON:", error.message);
        throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT_KEY format: must be valid JSON");
      }
      console.error("Failed to initialize Firebase Admin:", error);
      throw error;
    }
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
    try {
      const db = getFirestoreDb();
      // Clean user data - remove undefined values
      const cleanUser = Object.fromEntries(
        Object.entries(user).filter(([_, v]) => v !== undefined)
      );
      const docRef = db.collection("users").doc(user.id);
      await docRef.set({ ...cleanUser, createdAt: Timestamp.now() });
      console.log("User created successfully:", user.id, "email:", user.email);
      return { ...cleanUser, createdAt: new Date() };
    } catch (error: any) {
      console.error("Error creating user:", error);
      console.error("User data:", JSON.stringify(user, null, 2));
      throw error;
    }
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
    try {
      const db = getFirestoreDb();
      // Clean entry data - remove undefined values
      const cleanEntry = Object.fromEntries(
        Object.entries(entry).filter(([_, v]) => v !== undefined)
      );
      const docRef = await db.collection("healthEntries").add({ 
        ...cleanEntry, 
        timestamp: Timestamp.now() 
      });
      console.log("Health entry created successfully:", docRef.id, "for user:", entry.userId);
      return { id: docRef.id, ...cleanEntry, timestamp: new Date() };
    } catch (error: any) {
      console.error("Error creating health entry:", error);
      console.error("Entry data:", JSON.stringify(entry, null, 2));
      throw error;
    }
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
    try {
      const db = getFirestoreDb();
      // Clean reading data - remove undefined values
      const cleanReading = Object.fromEntries(
        Object.entries(reading).filter(([_, v]) => v !== undefined)
      );
      const docRef = await db.collection("environmentalReadings").add({ 
        ...cleanReading, 
        timestamp: Timestamp.now() 
      });
      console.log("Environmental reading created successfully:", docRef.id, "for user:", reading.userId);
      return { id: docRef.id, ...cleanReading, timestamp: new Date() };
    } catch (error: any) {
      console.error("Error creating environmental reading:", error);
      console.error("Reading data:", JSON.stringify(reading, null, 2));
      throw error;
    }
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
    try {
      const db = getFirestoreDb();
      const existing = await this.getUserApiCredentials(userId);
      if (existing) {
        await db.collection("userApiCredentials").doc(existing.id).update(credentials);
        console.log("User API credentials updated:", existing.id);
        return { ...existing, ...credentials };
      } else {
        const docRef = await db.collection("userApiCredentials").add({ userId, ...credentials });
        console.log("User API credentials created:", docRef.id);
        return { id: docRef.id, userId, ...credentials };
      }
    } catch (error) {
      console.error("Error upserting user API credentials:", error);
      throw error;
    }
  }
};
