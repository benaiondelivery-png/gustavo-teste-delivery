// ========================================
// BENAION DELIVERY - BADGE COMPONENT
// ========================================

class BadgeComponent {
  constructor(options = {}) {
    this.options = {
      text: '',
      type: 'default',
      size: 'medium',
      className: '',
      ...options
    };
    this.element = null;
  }

  render() {
    const badge = document.createElement('span');
    badge.className = `badge ${this.options.className}`;
    
    // Estilos base
    badge.style.cssText = `
      display: inline-block;
      padding: ${this.getPadding()};
      border-radius: ${this.getRadius()};
      font-size: ${this.getFontSize()};
      font-weight: 700;
      letter-spacing: 0.5px;
      ${this.getColors()}
    `;
    
    badge.textContent = this.options.text;
    this.element = badge;
    return badge;
  }

  getPadding() {
    const sizes = {
      small: '2px 8px',
      medium: '4px 12px',
      large: '6px 16px'
    };
    return sizes[this.options.size] || sizes.medium;
  }

  getRadius() {
    return '20px';
  }

  getFontSize() {
    const sizes = {
      small: '9px',
      medium: '10px',
      large: '12px'
    };
    return sizes[this.options.size] || sizes.medium;
  }

  getColors() {
    const colors = {
      default: 'background: #eee; color: #666;',
      primary: 'background: var(--primary-red); color: white;',
      success: 'background: #2ecc71; color: white;',
      warning: 'background: #f39c12; color: white;',
      danger: 'background: #ff4757; color: white;',
      info: 'background: #3498db; color: white;'
    };
    return colors[this.options.type] || colors.default;
  }

  setText(text) {
    this.options.text = text;
    if (this.element) {
      this.element.textContent = text;
    }
    return this;
  }

  setType(type) {
    this.options.type = type;
    if (this.element) {
      const colors = this.getColors();
      this.element.style.cssText += colors;
    }
    return this;
  }

  appendTo(parent) {
    if (this.element && parent) {
      parent.appendChild(this.element);
    }
    return this;
  }

  remove() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    return this;
  }
}

// Factory
export const Badge = {
  create(options) {
    return new BadgeComponent(options);
  },

  status(status) {
    const types = {
      'pendente': 'warning',
      'preparando': 'info',
      'pronto': 'primary',
      'aguardando_entregador': 'default',
      'aceito': 'success',
      'em_entrega': 'info',
      'finalizado': 'success',
      'cancelado': 'danger'
    };
    
    const labels = {
      'pendente': '📝 Pendente',
      'preparando': '👨‍🍳 Preparando',
      'pronto': '📦 Pronto',
      'aguardando_entregador': '🔍 No Radar',
      'aceito': '🛵 Aceito',
      'em_entrega': '🚀 Em Entrega',
      'finalizado': '✅ Finalizado',
      'cancelado': '❌ Cancelado'
    };
    
    return new BadgeComponent({
      text: labels[status] || status,
      type: types[status] || 'default'
    });
  }
};
