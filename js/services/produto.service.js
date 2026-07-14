// ========================================
// BENAION DELIVERY - PRODUTO SERVICE
// ========================================

import { firestoreService } from './firestore.service.js';
import { COLLECTIONS } from '../config/firebase.js';

class ProdutoService {
  constructor() {
    this.collection = COLLECTIONS.PRODUTOS;
  }

  async criar(produto) {
    const result = await firestoreService.create(this.collection, {
      ...produto,
      created_at: Date.now()
    });
    return { id: result.id, ...produto };
  }

  async buscar(id) {
    return await firestoreService.read(this.collection, id);
  }

  async listarPorLoja(lojaId) {
    return await firestoreService.query(
      this.collection,
      [{ field: 'lojaId', operator: '==', value: lojaId }],
      'created_at'
    );
  }

  async atualizar(id, dados) {
    await firestoreService.update(this.collection, id, dados);
  }

  async deletar(id) {
    await firestoreService.delete(this.collection, id);
  }

  async listarTodos() {
    return await firestoreService.query(this.collection);
  }
}

export const produtoService = new ProdutoService();
