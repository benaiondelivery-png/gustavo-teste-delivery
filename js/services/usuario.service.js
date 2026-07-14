// ========================================
// BENAION DELIVERY - USUARIO SERVICE
// ========================================

import { firestoreService } from './firestore.service.js';
import { COLLECTIONS } from '../config/firebase.js';

class UsuarioService {
  constructor() {
    this.collection = COLLECTIONS.USERS;
  }

  async save(uid, data) {
    await firestoreService.set(this.collection, uid, data);
    return { id: uid, ...data };
  }

  async getProfile(uid) {
    return await firestoreService.read(this.collection, uid);
  }

  async update(uid, data) {
    await firestoreService.update(this.collection, uid, data);
  }

  async getByType(userType) {
    return await firestoreService.query(
      this.collection,
      [{ field: 'userType', operator: '==', value: userType }]
    );
  }

  async getAll() {
    return await firestoreService.query(this.collection);
  }

  async toggleOnline(uid, online) {
    await this.update(uid, { online });
  }

  async getEntregadoresOnline() {
    return await firestoreService.query(
      this.collection,
      [
        { field: 'userType', operator: '==', value: 'entregador' },
        { field: 'online', operator: '==', value: true }
      ]
    );
  }

  async getClientes() {
    return await this.getByType('cliente');
  }

  async getEntregadores() {
    return await this.getByType('entregador');
  }

  async getParceiros() {
    return await this.getByType('parceiro');
  }
}

export const usuarioService = new UsuarioService();
