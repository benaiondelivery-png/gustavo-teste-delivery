// ========================================
// BENAION DELIVERY - AUTH SERVICE
// ========================================

import { 
  getAuth, 
  signInWithRedirect, 
  getRedirectResult, 
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import { db } from '../config/firebase.js';
import { UsuarioService } from './usuario.service.js';
import { StorageHelper } from '../helpers/storage.helper.js';

class AuthService {
  constructor() {
    this.auth = getAuth();
    this.googleProvider = new GoogleAuthProvider();
    this.googleProvider.setCustomParameters({ prompt: 'select_account' });
  }

  async loginWithGoogle() {
    await signInWithRedirect(this.auth, this.googleProvider);
  }

  async handleRedirect() {
    try {
      const result = await getRedirectResult(this.auth);
      if (result?.user) {
        let profile = await UsuarioService.getProfile(result.user.uid);
        if (!profile) {
          profile = {
            name: result.user.displayName || 'Usuário',
            email: result.user.email,
            userType: 'cliente',
            online: false,
            created_at: Date.now()
          };
          await UsuarioService.save(result.user.uid, profile);
        }
        StorageHelper.setUser({ id: result.user.uid, ...profile });
        window.location.href = `${profile.userType}.html`;
        return true;
      }
      return false;
    } catch (e) {
      console.error('❌ Erro no redirect:', e);
      return false;
    }
  }

  async loginWithEmail(email, password) {
    if (!email || !password) {
      throw new Error('E-mail e senha são obrigatórios');
    }
    return await signInWithEmailAndPassword(this.auth, email, password);
  }

  async register(email, password) {
    if (password.length < 6) {
      throw new Error('Senha deve ter no mínimo 6 caracteres');
    }
    return await createUserWithEmailAndPassword(this.auth, email, password);
  }

  async resetPassword(email) {
    if (!email) throw new Error('E-mail é obrigatório');
    await sendPasswordResetEmail(this.auth, email);
  }

  logout() {
    signOut(this.auth);
    StorageHelper.removeUser();
    StorageHelper.removeEnderecos();
    window.location.href = 'index.html';
  }

  getCurrentUser() {
    return StorageHelper.getUser();
  }

  isAuthenticated() {
    return !!this.getCurrentUser();
  }

  requireAuth(allowedTypes = []) {
    const user = this.getCurrentUser();
    if (!user) {
      window.location.href = 'index.html';
      return false;
    }
    if (allowedTypes.length > 0 && !allowedTypes.includes(user.userType)) {
      window.location.href = `${user.userType}.html`;
      return false;
    }
    return true;
  }

  onAuthChange(callback) {
    return onAuthStateChanged(this.auth, callback);
  }
}

export const authService = new AuthService();
