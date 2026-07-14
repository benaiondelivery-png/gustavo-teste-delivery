// ========================================
// BENAION DELIVERY - PROGRESS COMPONENT
// ========================================

class ProgressComponent {
  constructor(options = {}) {
    this.options = {
      steps: [],
      currentStep: 0,
      icons: [],
      labels: [],
      className: '',
      ...options
    };
    this.element = null;
  }

  render() {
    const container = document.createElement('div');
    container.className = `progress-bar ${this.options.className}`;
    container.style.cssText = `
      display: flex;
      justify-content: space-between;
      margin: 12px 0;
      position: relative;
    `;
    
    const steps = this.options.steps.length || this.options.icons.length || 6;
    const icons = this.options.icons.length > 0 ? this.options.icons : ['📝','👨‍🍳','📦','🔍','🛵','🚀','✅'];
    const labels = this.options.labels.length > 0 ? this.options.labels : ['Pend','Prep','Pront','Radar','Aceit','Entrega','Fim'];
    const current = this.options.currentStep || 0;
    
    container.innerHTML = icons.slice(0, steps).map((icon, i) => `
      <div style="display:flex; flex-direction:column; align-items:center; flex:1;">
        <div style="
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          ${i < current ? 'background: #2ecc71; color: white;' : 
            i === current ? 'background: var(--primary-red); color: white; box-shadow: 0 0 0 3px rgba(227,6,19,0.2);' : 
            'background: #eee; color: #ccc;'}
        ">
          ${i <= current ? icon : ''}
        </div>
        <span style="
          font-size: 7px;
          margin-top: 3px;
          color: #999;
          text-align: center;
          max-width: 40px;
          line-height: 1.2;
        ">
          ${labels[i] || ''}
        </span>
      </div>
    `).join('');
    
    this.element = container;
    return container;
  }

  setStep(step) {
    this.options.currentStep = step;
    this.render();
    return this;
  }

  getStep() {
    return this.options.currentStep;
  }

  appendTo(parent) {
    if (this.element && parent) {
      parent.appendChild(this.element);
    }
    return this;
  }

  update(options) {
    this.options = { ...this.options, ...options };
    this.render();
    return this;
  }
}

// Factory
export const Progress = {
  create(options) {
    return new ProgressComponent(options);
  },

  forStatus(status) {
    const steps = {
      'pendente': 0,
      'preparando': 1,
      'pronto': 2,
      'aguardando_entregador': 3,
      'aceito': 4,
      'em_entrega': 5,
      'finalizado': 6
    };
    
    return new ProgressComponent({
      currentStep: steps[status] || 0,
      steps: 7,
      icons: ['📝', '👨‍🍳', '📦', '🔍', '🛵', '🚀', '✅'],
      labels: ['Pend', 'Prep', 'Pront', 'Radar', 'Aceit', 'Entrega', 'Fim']
    });
  }
};
