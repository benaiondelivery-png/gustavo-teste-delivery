// ========================================
// BENAION DELIVERY - NAVBAR COMPONENT
// ========================================

class NavbarComponent {
  constructor(options = {}) {
    this.options = {
      items: [],
      activeIndex: 0,
      className: '',
      ...options
    };
    this.element = null;
  }

  render() {
    const nav = document.createElement('nav');
    nav.className = `bottom-nav ${this.options.className}`;
    nav.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      display: flex;
      justify-content: space-around;
      padding: 8px 0;
      border-top: 1px solid #eee;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
      z-index: 100;
      max-width: 480px;
      margin: 0 auto;
    `;
    
    nav.innerHTML = this.options.items.map((item, i) => `
      <button class="nav-item ${i === this.options.activeIndex ? 'active' : ''}" 
              data-index="${i}"
              onclick="${item.onClick || '() => {}'}"
              style="
                background: none;
                border: none;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 2px;
                font-size: 10px;
                color: ${i === this.options.activeIndex ? 'var(--primary-red)' : '#999'};
                cursor: pointer;
                padding: 4px 16px;
                transition: 0.2s;
                font-weight: 600;
              ">
        <i class="${item.icon}" style="font-size: 22px; transition: 0.2s;"></i>
        <span>${item.label}</span>
      </button>
    `).join('');
    
    this.element = nav;
    return nav;
  }

  setActive(index) {
    this.options.activeIndex = index;
    if (this.element) {
      const buttons = this.element.querySelectorAll('.nav-item');
      buttons.forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
        btn.style.color = i === index ? 'var(--primary-red)' : '#999';
      });
    }
    return this;
  }

  addItem(item) {
    this.options.items.push(item);
    this.render();
    return this;
  }

  removeItem(index) {
    this.options.items.splice(index, 1);
    this.render();
    return this;
  }

  appendTo(parent) {
    if (this.element && parent) {
      parent.appendChild(this.element);
    }
    return this;
  }
}

// Factory
export const Navbar = {
  create(options) {
    return new NavbarComponent(options);
  },

  default(items) {
    return new NavbarComponent({
      items: items || [
        { icon: 'fas fa-home', label: 'Início', onClick: 'window.location.href="cliente.html"' },
        { icon: 'fas fa-plus-circle', label: 'Pedir', onClick: 'window.Utils.showModal("novoPedidoModal")' },
        { icon: 'fas fa-user', label: 'Perfil', onClick: 'window.Utils.showToast("Perfil em breve", "info")' }
      ]
    });
  }
};
