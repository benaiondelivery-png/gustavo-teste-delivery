// ========================================
// BENAION DELIVERY - FORMATTER HELPER
// ========================================

export const FormatterHelper = {
  currency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  },

  date(timestamp) {
    if (!timestamp) return '---';
    const d = new Date(timestamp);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  shortDate(timestamp) {
    if (!timestamp) return '---';
    const d = new Date(timestamp);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit'
    });
  },

  time(timestamp) {
    if (!timestamp) return '---';
    const d = new Date(timestamp);
    return d.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  phone(phone) {
    const clean = phone.replace(/\D/g, '');
    if (clean.length === 11) {
      return `(${clean.slice(0,2)}) ${clean.slice(2,7)}-${clean.slice(7)}`;
    }
    if (clean.length === 10) {
      return `(${clean.slice(0,2)}) ${clean.slice(2,6)}-${clean.slice(6)}`;
    }
    return phone;
  },

  statusText(status) {
    const map = {
      'pendente': '📝 Pendente',
      'preparando': '👨‍🍳 Preparando',
      'pronto': '📦 Pronto',
      'aguardando_entregador': '🔍 No Radar',
      'aceito': '🛵 Motoboy a Caminho',
      'em_entrega': '🚀 Em Entrega',
      'finalizado': '✅ Entregue',
      'cancelado': '❌ Cancelado'
    };
    return map[status] || status;
  },

  statusColor(status) {
    const map = {
      'pendente': '#f1c40f',
      'preparando': '#3498db',
      'pronto': '#9b59b6',
      'aguardando_entregador': '#e67e22',
      'aceito': '#2ecc71',
      'em_entrega': '#e91e63',
      'finalizado': '#27ae60',
      'cancelado': '#e30613'
    };
    return map[status] || '#ccc';
  },

  shortId(id) {
    if (!id) return 'N/A';
    return id.substring(0, 6).toUpperCase();
  }
};
