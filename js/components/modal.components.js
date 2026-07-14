// ========================================
// BENAION DELIVERY - MODAL COMPONENT
// ========================================

class ModalComponent {
  constructor(id) {
    this.id = id;
    this.element = document.getElementById(id);
    this.overlay = null;
  }

  show() {
    if (this.element) {
      this.element.classList.add('active');
      this.element.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  hide() {
    if (this.element) {
      this.element.classList.remove('active');
      this.element.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  toggle() {
    if (this.isVisible()) {
      this.hide();
    } else {
      this.show();
    }
  }

  isVisible() {
    return this.element && this.element.classList.contains('active');
  }

  setContent(html) {
    if (this.element) {
      const body = this.element.querySelector('.modal-body');
      if (body) body.innerHTML = html;
    }
  }

  setTitle(title) {
    if (this.element) {
      const titleEl = this.element.querySelector('.modal-title');
      if (titleEl) titleEl.textContent = title;
    }
  }
}

// Factory para criar modais
export const Modal = {
  create(id) {
    return new ModalComponent(id);
  },

  show(id) {
    const modal = new ModalComponent(id);
    modal.show();
    return modal;
  },

  hide(id) {
    const modal = new ModalComponent(id);
    modal.hide();
    return modal;
  }
};
