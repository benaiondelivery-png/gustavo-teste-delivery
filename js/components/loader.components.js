// ========================================
// BENAION DELIVERY - LOADER COMPONENT
// ========================================

class LoaderComponent {
  constructor() {
    this.element = null;
    this.init();
  }

  init() {
    const overlay = document.createElement('div');
    overlay.className = 'loader-overlay';
    overlay.id = 'loaderOverlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(227, 6, 19, 0.95);
      z-index: 9999;
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
    `;
    
    overlay.innerHTML = `
      <div class="loader-spinner" style="
        width: 60px;
        height: 60px;
        border: 4px solid rgba(255,255,255,0.2);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      "></div>
      <p style="margin-top: 20px; font-weight: 600; font-size: 16px;" id="loaderText">Carregando...</p>
    `;
    
    document.body.appendChild(overlay);
    this.element = overlay;
    
    // Adicionar estilo de animação
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  show(message = 'Carregando...') {
    if (this.element) {
      const text = this.element.querySelector('#loaderText');
      if (text) text.textContent = message;
      this.element.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  hide() {
    if (this.element) {
      this.element.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  setMessage(message) {
    if (this.element) {
      const text = this.element.querySelector('#loaderText');
      if (text) text.textContent = message;
    }
  }

  isVisible() {
    return this.element && this.element.style.display === 'flex';
  }
}

export const Loader = new LoaderComponent();
