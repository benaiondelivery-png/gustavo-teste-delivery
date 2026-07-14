// ========================================
// BENAION DELIVERY - CORE API (V5.0)
// ========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, collection, addDoc, getDocs, query, where, orderBy, limit, startAfter,
  doc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot, 
  enableIndexedDbPersistence
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
  getAuth, signInWithRedirect, getRedirectResult, GoogleAuthProvider, 
  createUserWithEmailAndPassword, signInWithEmailAndPassword, 
  sendPasswordResetEmail, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// ========================================
// CONFIGURAÇÃO FIREBASE
// ========================================
const firebaseConfig = {
  apiKey: "AIzaSyCl-U9X9qxohjDpgr8y2pdkS3j-qNm19pk",
  authDomain: "benaion-delivery.firebaseapp.com",
  projectId: "benaion-delivery",
  storageBucket: "benaion-delivery.firebasestorage.app",
  messagingSenderId: "309927409217",
  appId: "1:309927409217:web:7a105cb5237b2294b1b8c0",
  measurementId: "G-TK1KNW14WH"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Persistência offline
try { enableIndexedDbPersistence(db).catch(() => {}); } catch(e) {}

// ========================================
// CACHE EM MEMÓRIA
// ========================================
const memoryCache = new Map();
const CACHE_TTL = 30000;

function getCache(key) {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  memoryCache.set(key, { data, timestamp: Date.now() });
}

function clearCache() {
  memoryCache.clear();
  console.log("🧹 Cache limpo");
}

// ========================================
// RETRY AUTOMÁTICO
// ========================================
async function withRetry(fn, maxRetries = 3) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (i === maxRetries - 1) throw e;
      await new Promise(r => setTimeout(r, 500 * (i + 1)));
    }
  }
  throw lastError;
}

// ========================================
// TAXAS PADRÃO
// ========================================
const TAXAS_PADRAO = {
  "Agreste": 6, "Nova Esperança": 6, "Prosperidade": 6,
  "Castanheira": 6, "Centro": 6, "José Cesário": 6,
  "Rio Branco": 7, "Cajari": 7, "Buritizal": 7,
  "Rodovia do Gogó": 8, "Sarney": 8, "Malvinas": 8,
  "Nazaré Mineiro": 10, "Samaúma": 15, "Monte Dourado": 30
};

let taxasCache = { ...TAXAS_PADRAO };

// ========================================
// API PRINCIPAL
// ========================================
const API = {
  taxasCache,

  // ---- TAXAS ----
  calcularTaxa(origem, destino) {
    const normalize = str => (str || '').trim().toLowerCase();
    const chave = normalize(destino) || normalize(origem);
    
    for (const [key, value] of Object.entries(this.taxasCache)) {
      if (normalize(key) === chave) return Number(value);
    }
    for (const [key, value] of Object.entries(TAXAS_PADRAO)) {
      if (normalize(key) === chave) return Number(value);
    }
    return 6;
  },

  async carregarTaxas() {
    try {
      const docSnap = await withRetry(() => getDoc(doc(db, "config", "taxas")));
      if (docSnap.exists()) {
        taxasCache = { ...TAXAS_PADRAO, ...docSnap.data() };
      }
      window.TAXAS_LOCAIS = taxasCache;
      return taxasCache;
    } catch(e) {
      taxasCache = { ...TAXAS_PADRAO };
      window.TAXAS_LOCAIS = taxasCache;
      return taxasCache;
    }
  },

  async salvarTaxas(taxas) {
    await withRetry(() => setDoc(doc(db, "config", "taxas"), taxas));
    taxasCache = { ...TAXAS_PADRAO, ...taxas };
    window.TAXAS_LOCAIS = taxasCache;
    window.Utils?.showToast?.("✅ Taxas atualizadas!", "success");
    return true;
  },

  // ---- USUÁRIOS ----
  async getUserProfile(uid) {
    const cached = getCache(`user_${uid}`);
    if (cached) return cached;
    
    try {
      const docSnap = await withRetry(() => getDoc(doc(db, "users", uid)));
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };
        setCache(`user_${uid}`, data);
        return data;
      }
      return null;
    } catch(e) { return null; }
  },

  async saveUserToFirestore(uid, userData) {
    setCache(`user_${uid}`, { id: uid, ...userData });
    return await withRetry(() => 
      setDoc(doc(db, "users", uid), { ...userData, updated_at: Date.now() }, { merge: true })
    );
  },

  async updateUser(uid, data) {
    memoryCache.delete(`user_${uid}`);
    return await withRetry(() => updateDoc(doc(db, "users", uid), { ...data, updated_at: Date.now() }));
  },

  async getUsersByType(userType) {
    const cached = getCache(`users_type_${userType}`);
    if (cached) return cached;
    
    try {
      const q = query(collection(db, "users"), where("userType", "==", userType));
      const snap = await withRetry(() => getDocs(q));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setCache(`users_type_${userType}`, data);
      return data;
    } catch(e) { return []; }
  },

  async getAllUsers() {
    try {
      const snap = await withRetry(() => getDocs(collection(db, "users")));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) { return []; }
  },

  // ---- PEDIDOS ----
  async createPedido(data) {
    const pedido = {
      ...data,
      bairro: data.bairro || data.bairroEntrega,
      created_at: data.created_at || Date.now(),
      updated_at: Date.now()
    };
    return await withRetry(() => addDoc(collection(db, "pedidos"), pedido));
  },

  async updatePedido(id, data) {
    const updateData = { ...data, updated_at: Date.now() };
    if (data.status === 'finalizado') updateData.finalizado_em = Date.now();
    return await withRetry(() => updateDoc(doc(db, "pedidos", id), updateData));
  },

  async deletePedido(id) {
    return await withRetry(() => deleteDoc(doc(db, "pedidos", id)));
  },

  async getPedido(id) {
    try {
      const snap = await withRetry(() => getDoc(doc(db, "pedidos", id)));
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch(e) { return null; }
  },

  escutarTodosPedidos(callback) {
    return onSnapshot(collection(db, "pedidos"), (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => console.error("❌ Erro listener:", error.code));
  },

  async getHistoricoEntregador(entregadorId) {
    try {
      const q = query(
        collection(db, "pedidos"),
        where("entregadorId", "==", entregadorId),
        where("status", "==", "finalizado"),
        orderBy("finalizado_em", "desc"),
        limit(50)
      );
      const snap = await withRetry(() => getDocs(q));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) { return []; }
  },

  // ---- PRODUTOS ----
  async getProdutosLoja(lojaId) {
    try {
      const q = query(collection(db, "produtos"), where("lojaId", "==", lojaId));
      const snap = await withRetry(() => getDocs(q));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch(e) { return []; }
  },

  async addProduto(produto) {
    return await withRetry(() => addDoc(collection(db, "produtos"), { 
      ...produto, created_at: Date.now(), updated_at: Date.now()
    }));
  },

  async deleteProduto(id) {
    return await withRetry(() => deleteDoc(doc(db, "produtos", id)));
  },

  // ---- AVALIAÇÕES ----
  async addAvaliacao(data) {
    return await withRetry(() => addDoc(collection(db, "avaliacoes"), { 
      ...data, created_at: Date.now() 
    }));
  },

  async getAvaliacoesEntregador(entregadorId) {
    try {
      const q = query(collection(db, "avaliacoes"), where("entregadorId", "==", entregadorId));
      const snap = await withRetry(() => getDocs(q));
      const avaliacoes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const media = avaliacoes.length > 0 
        ? (avaliacoes.reduce((a,b) => a + b.nota, 0) / avaliacoes.length).toFixed(1)
        : 0;
      return { avaliacoes, media, total: avaliacoes.length };
    } catch(e) { return { avaliacoes: [], media: 0, total: 0 }; }
  },

  clearCache() { clearCache(); }
};

// ========================================
// AUTENTICAÇÃO
// ========================================
const Auth = {
  async loginWithGoogle() {
    await signInWithRedirect(auth, googleProvider);
  },

  async handleRedirect() {
    try {
      const result = await getRedirectResult(auth);
      if (result?.user) {
        let profile = await API.getUserProfile(result.user.uid);
        if (!profile) {
          profile = { 
            name: result.user.displayName || "Usuário", 
            email: result.user.email, 
            userType: 'cliente', 
            online: false,
            created_at: Date.now()
          };
          await API.saveUserToFirestore(result.user.uid, profile);
        }
        localStorage.setItem('benaion_user', JSON.stringify({ id: result.user.uid, ...profile }));
        window.location.href = `${profile.userType}.html`;
        return true;
      }
      return false;
    } catch(e) { return false; }
  },

  async loginWithEmail(email, password) {
    if (!email || !password) throw new Error("E-mail e senha são obrigatórios");
    return await signInWithEmailAndPassword(auth, email, password);
  },

  async register(email, password) {
    if (password.length < 6) throw new Error("Senha deve ter no mínimo 6 caracteres");
    return await createUserWithEmailAndPassword(auth, email, password);
  },

  async resetPassword(email) {
    await sendPasswordResetEmail(auth, email);
  },

  logout() {
    signOut(auth);
    localStorage.removeItem('benaion_user');
    localStorage.removeItem('benaion_enderecos');
    API.clearCache();
    window.location.href = 'index.html';
  },

  getCurrentUser() {
    try { return JSON.parse(localStorage.getItem('benaion_user')); } 
    catch(e) { return null; }
  },

  isAuthenticated() { return !!this.getCurrentUser(); },

  requireAuth(allowedTypes = []) {
    const user = this.getCurrentUser();
    if (!user) { window.location.href = 'index.html'; return false; }
    if (allowedTypes.length > 0 && !allowedTypes.includes(user.userType)) {
      window.location.href = `${user.userType}.html`;
      return false;
    }
    return true;
  },

  onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
  }
};

// ========================================
// EXPORTAÇÕES GLOBAIS
// ========================================
window.API = API;
window.Auth = Auth;
window.db = db;
window.auth = auth;

API.carregarTaxas();

export { API, Auth, db, auth };
