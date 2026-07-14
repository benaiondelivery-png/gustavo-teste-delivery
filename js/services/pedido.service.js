// ========================================
// BENAION DELIVERY - PEDIDO SERVICE
// ========================================

import { firestoreService } from './firestore.service.js';
import { COLLECTIONS } from '../config/firebase.js';
import { PEDIDO_STATUS } from '../config/constants.js';
import { StringHelper } from '../helpers/string.helper.js';

class PedidoService {
  constructor() {
    this.collection = COLLECTIONS.PEDIDOS;
  }

  async criar(dados) {
    const pedido = {
      codigo: StringHelper.generateCode(6),
      clienteId: dados.clienteId,
      clienteNome: dados.clienteNome,
      clienteTel: dados.clienteTel || '',
      lojaId: dados.lojaId || null,
      lojaNome: dados.lojaNome || null,
      bairroRetirada: dados.bairroRetirada,
      retiradaLocal: dados.retiradaLocal,
      bairro: dados.bairro,
      entregaLocal: dados.entregaLocal,
      produto: dados.produto,
      taxaEntrega: dados.taxaEntrega,
      valorProdutos: dados.valorProdutos || 0,
      codigoConfirmacao: dados.codigoConfirmacao || StringHelper.generateCode(4),
      status: PEDIDO_STATUS.AGUARDANDO_ENTREGADOR,
      entregadorId: null,
      entregadorNome: null,
      created_at: Date.now(),
      aceito_em: null,
      finalizado_em: null,
      origem: dados.origem || 'CLIENTE'
    };

    const result = await firestoreService.create(this.collection, pedido);
    return { id: result.id, ...pedido };
  }

  async buscar(id) {
    return await firestoreService.read(this.collection, id);
  }

  async listarTodos() {
    return await firestoreService.query(this.collection, [], 'created_at');
  }

  async listarPorCliente(clienteId) {
    return await firestoreService.query(
      this.collection,
      [{ field: 'clienteId', operator: '==', value: clienteId }],
      'created_at'
    );
  }

  async listarPorEntregador(entregadorId) {
    return await firestoreService.query(
      this.collection,
      [{ field: 'entregadorId', operator: '==', value: entregadorId }],
      'created_at'
    );
  }

  async listarPorLoja(lojaId) {
    return await firestoreService.query(
      this.collection,
      [{ field: 'lojaId', operator: '==', value: lojaId }],
      'created_at'
    );
  }

  async listarPorStatus(status) {
    return await firestoreService.query(
      this.collection,
      [{ field: 'status', operator: '==', value: status }],
      'created_at'
    );
  }

  async atualizar(id, dados) {
    await firestoreService.update(this.collection, id, dados);
  }

  async atualizarStatus(id, status) {
    await this.atualizar(id, { status });
  }

  async aceitar(id, entregadorId, entregadorNome) {
    await this.atualizar(id, {
      status: PEDIDO_STATUS.ACEITO,
      entregadorId,
      entregadorNome,
      aceito_em: Date.now()
    });
  }

  async iniciarEntrega(id) {
    await this.atualizar(id, {
      status: PEDIDO_STATUS.EM_ENTREGA,
      saiu_em: Date.now()
    });
  }

  async finalizar(id) {
    await this.atualizar(id, {
      status: PEDIDO_STATUS.FINALIZADO,
      finalizado_em: Date.now()
    });
  }

  async cancelar(id, motivo = '') {
    await this.atualizar(id, {
      status: PEDIDO_STATUS.CANCELADO,
      cancelado_em: Date.now(),
      motivo_cancelamento: motivo
    });
  }

  async deletar(id) {
    await firestoreService.delete(this.collection, id);
  }

  listenAll(callback) {
    return firestoreService.listen(this.collection, callback, [], 'created_at');
  }

  listenByStatus(callback, status) {
    return firestoreService.listen(
      this.collection,
      callback,
      [{ field: 'status', operator: '==', value: status }],
      'created_at'
    );
  }

  listenByEntregador(callback, entregadorId) {
    return firestoreService.listen(
      this.collection,
      callback,
      [{ field: 'entregadorId', operator: '==', value: entregadorId }],
      'created_at'
    );
  }

  async getHistoricoEntregador(entregadorId) {
    return await firestoreService.query(
      this.collection,
      [
        { field: 'entregadorId', operator: '==', value: entregadorId },
        { field: 'status', operator: '==', value: PEDIDO_STATUS.FINALIZADO }
      ],
      'finalizado_em'
    );
  }

  async getPedidosAtivos() {
    const statusAtivos = [
      PEDIDO_STATUS.PENDENTE,
      PEDIDO_STATUS.PREPARANDO,
      PEDIDO_STATUS.PRONTO,
      PEDIDO_STATUS.AGUARDANDO_ENTREGADOR,
      PEDIDO_STATUS.ACEITO,
      PEDIDO_STATUS.EM_ENTREGA
    ];
    
    const results = await Promise.all(
      statusAtivos.map(status => this.listarPorStatus(status))
    );
    
    return results.flat();
  }

  async getStatsHoje() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const todos = await this.listarTodos();
    const hojePedidos = todos.filter(p => p.created_at >= hoje.getTime());
    const finalizadosHoje = hojePedidos.filter(p => p.status === PEDIDO_STATUS.FINALIZADO);
    const faturamento = finalizadosHoje.reduce((acc, p) => acc + (p.taxaEntrega || 0), 0);
    
    return {
      total: hojePedidos.length,
      finalizados: finalizadosHoje.length,
      faturamento,
      ativos: todos.filter(p => !['finalizado', 'cancelado'].includes(p.status)).length
    };
  }
}

export const pedidoService = new PedidoService();
