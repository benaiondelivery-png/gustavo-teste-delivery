// ========================================
// BENAION DELIVERY - TOAST COMPONENT
// ========================================

class ToastComponent {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    this.container = container;
  }

  show(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    
    toast.innerHTML = `<span>${icons[type] || '📢'}</span><span>${message}</span>`;
    this.container.appendChild(toast);

    // Sons
    if (type === 'success' && window.Utils) window.Utils.sons.tocar('sucesso');
    if (type === 'error' && window.Utils) window.Utils.sons.tocar('erro');

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      toast.style.transition = 'all 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  success(message, duration = 3000) {
    this.show(message, 'success', duration);
  }

  error(message, duration = 3000) {
    this.show(message, 'error', duration);
  }

  warning(message, duration = 3000) {
    this.show(message, 'warning', duration);
  }

  info(message, duration = 3000) {
    this.show(message, 'info', duration);
  }
}

export const Toast = new ToastComponent();
