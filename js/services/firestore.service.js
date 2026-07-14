// ========================================
// BENAION DELIVERY - FIRESTORE SERVICE
// ========================================

import { 
  getFirestore,
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  onSnapshot,
  enableIndexedDbPersistence
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import { db } from '../config/firebase.js';
import { COLLECTIONS } from '../config/firebase.js';

class FirestoreService {
  constructor() {
    this.db = db;
    this.enableOffline();
  }

  enableOffline() {
    try {
      enableIndexedDbPersistence(this.db).catch(() => {});
    } catch (e) {}
  }

  // ---- CRUD ----
  async create(collectionName, data) {
    return await addDoc(collection(this.db, collectionName), {
      ...data,
      created_at: data.created_at || Date.now(),
      updated_at: Date.now()
    });
  }

  async read(collectionName, id) {
    const snap = await getDoc(doc(this.db, collectionName, id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  }

  async update(collectionName, id, data) {
    await updateDoc(doc(this.db, collectionName, id), {
      ...data,
      updated_at: Date.now()
    });
  }

  async delete(collectionName, id) {
    await deleteDoc(doc(this.db, collectionName, id));
  }

  async set(collectionName, id, data) {
    await setDoc(doc(this.db, collectionName, id), {
      ...data,
      updated_at: Date.now()
    }, { merge: true });
  }

  // ---- QUERIES ----
  async query(collectionName, conditions = [], orderByField = null, orderDirection = 'desc', limitCount = null) {
    let q = collection(this.db, collectionName);
    
    if (conditions.length > 0) {
      conditions.forEach(cond => {
        q = query(q, where(cond.field, cond.operator, cond.value));
      });
    }
    
    if (orderByField) {
      q = query(q, orderBy(orderByField, orderDirection));
    }
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  // ---- LISTENER ----
  listen(collectionName, callback, conditions = [], orderByField = null) {
    let q = collection(this.db, collectionName);
    
    if (conditions.length > 0) {
      conditions.forEach(cond => {
        q = query(q, where(cond.field, cond.operator, cond.value));
      });
    }
    
    if (orderByField) {
      q = query(q, orderBy(orderByField, 'desc'));
    }
    
    return onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      callback(data);
    }, (error) => {
      console.error('❌ Erro no listener:', error);
    });
  }

  // ---- PAGINATION ----
  async paginate(collectionName, pageSize = 20, lastDoc = null, conditions = [], orderByField = null) {
    let q = collection(this.db, collectionName);
    
    if (conditions.length > 0) {
      conditions.forEach(cond => {
        q = query(q, where(cond.field, cond.operator, cond.value));
      });
    }
    
    if (orderByField) {
      q = query(q, orderBy(orderByField, 'desc'));
    }
    
    q = query(q, limit(pageSize));
    
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }
    
    const snap = await getDocs(q);
    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const last = snap.docs[snap.docs.length - 1] || null;
    
    return { data, lastDoc: last, hasMore: snap.docs.length === pageSize };
  }
}

export const firestoreService = new FirestoreService();
