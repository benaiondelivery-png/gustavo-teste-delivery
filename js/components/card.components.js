// ========================================
// BENAION DELIVERY - CARD COMPONENT
// ========================================

class CardComponent {
  constructor(options = {}) {
    this.options = {
      className: '',
      padding: '16px',
      radius: '12px',
      shadow: true,
      border: true,
      ...options
    };
    this.element = null;
  }

  render(content) {
    const card = document.createElement('div');
    card.className = `card ${this.options.className}`;
    
    if (this.options.padding) {
      card.style.padding = this.options.padding;
    }
    
    if (this.options.radius) {
      card.style.borderRadius = this.options.radius;
    }
    
    if (this.options.shadow) {
      card.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
    }
    
    if (this.options.border) {
      card.style.border = '1px solid #f0f0f0';
    }
    
    card.innerHTML = content;
    this.element = card;
    return card;
  }

  appendTo(parent) {
    if (this.element && parent) {
      parent.appendChild(this.element);
    }
    return this;
  }

  update(content) {
    if (this.element) {
      this.element.innerHTML = content;
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
export const Card = {
  create(options) {
    return new CardComponent(options);
  },

  simple(content, options = {}) {
    const card = new CardComponent(options);
    return card.render(content);
  },

  header(title, content, options = {}) {
    const card = new CardComponent(options);
    const html = `
      <h3 style="margin-bottom: 12px; font-weight: 800;">${title}</h3>
      ${content}
    `;
    return card.render(html);
  }
};
