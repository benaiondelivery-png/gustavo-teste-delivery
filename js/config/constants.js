// ========================================
// BENAION DELIVERY - CONSTANTS
// ========================================

export const USER_TYPES = {
  CLIENTE: 'cliente',
  ENTREGADOR: 'entregador',
  PARCEIRO: 'parceiro',
  ADMIN: 'admin'
};

export const PEDIDO_STATUS = {
  PENDENTE: 'pendente',
  PREPARANDO: 'preparando',
  PRONTO: 'pronto',
  AGUARDANDO_ENTREGADOR: 'aguardando_entregador',
  ACEITO: 'aceito',
  EM_ENTREGA: 'em_entrega',
  FINALIZADO: 'finalizado',
  CANCELADO: 'cancelado'
};

export const STATUS_LABELS = {
  [PEDIDO_STATUS.PENDENTE]: '📝 Pendente',
  [PEDIDO_STATUS.PREPARANDO]: '👨‍🍳 Preparando',
  [PEDIDO_STATUS.PRONTO]: '📦 Pronto',
  [PEDIDO_STATUS.AGUARDANDO_ENTREGADOR]: '🔍 No Radar',
  [PEDIDO_STATUS.ACEITO]: '🛵 Motoboy a Caminho',
  [PEDIDO_STATUS.EM_ENTREGA]: '🚀 Em Entrega',
  [PEDIDO_STATUS.FINALIZADO]: '✅ Entregue',
  [PEDIDO_STATUS.CANCELADO]: '❌ Cancelado'
};

export const STATUS_COLORS = {
  [PEDIDO_STATUS.PENDENTE]: '#f1c40f',
  [PEDIDO_STATUS.PREPARANDO]: '#3498db',
  [PEDIDO_STATUS.PRONTO]: '#9b59b6',
  [PEDIDO_STATUS.AGUARDANDO_ENTREGADOR]: '#e67e22',
  [PEDIDO_STATUS.ACEITO]: '#2ecc71',
  [PEDIDO_STATUS.EM_ENTREGA]: '#e91e63',
  [PEDIDO_STATUS.FINALIZADO]: '#27ae60',
  [PEDIDO_STATUS.CANCELADO]: '#e30613'
};

export const STEPS_ICONS = ['📝', '👨‍🍳', '📦', '🔍', '🛵', '🚀', '✅'];
export const STEPS_LABELS = ['Pend', 'Prep', 'Pront', 'Radar', 'Aceit', 'Entrega', 'Fim'];
