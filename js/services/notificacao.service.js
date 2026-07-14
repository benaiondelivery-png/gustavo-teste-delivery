// ========================================
// BENAION DELIVERY - NOTIFICACAO SERVICE
// ========================================

class NotificacaoService {
  constructor() {
    this.sounds = {};
    this.audioContext = null;
    this.initAudio();
  }

  initAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioContext = new AudioContext();
      }
    } catch (e) {}
  }

  playSound(type) {
    if (!this.audioContext) return;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      oscillator.connect(gain);
      gain.connect(this.audioContext.destination);
      
      const sounds = {
        novoPedido: { freq: 880, duration: 0.15 },
        pedidoAceito: { freq: 660, duration: 0.2 },
        entregaFinalizada: { freq: 1000, duration: 0.15 },
        erro: { freq: 200, duration: 0.3 },
        sucesso: { freq: 880, duration: 0.1 }
      };
      
      const sound = sounds[type] || sounds.sucesso;
      oscillator.frequency.value = sound.freq;
      gain.gain.value = 0.1;
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + sound.duration);
    } catch (e) {}
  }

  vibrate(pattern = [200]) {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  showNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/assets/logo/logo.png',
        ...options
      });
    }
  }

  async requestPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }

  // Notificações do sistema via Toast
  toast(message, type = 'info', duration = 3000) {
    if (window.Utils) {
      window.Utils.showToast(message, type, duration);
    }
  }

  // Notificações de pedido
  novoPedido(pedido) {
    this.playSound('novoPedido');
    this.vibrate([100, 50, 100]);
    this.showNotification('📦 Novo Pedido!', {
      body: `${pedido.clienteNome || 'Cliente'} - ${pedido.produto || 'Entrega'}`
    });
    this.toast(`📦 Novo pedido de ${pedido.clienteNome || 'Cliente'}!`, 'info');
  }

  pedidoAceito(pedido) {
    this.playSound('pedidoAceito');
    this.vibrate([100, 50, 100]);
    this.toast(`🛵 Pedido aceito por ${pedido.entregadorNome || 'entregador'}!`, 'success');
  }

  entregaFinalizada() {
    this.playSound('entregaFinalizada');
    this.vibrate([100, 100, 100]);
    this.toast('✅ Entrega finalizada!', 'success');
  }

  erro(message) {
    this.playSound('erro');
    this.toast(`❌ ${message}`, 'error');
  }

  sucesso(message) {
    this.playSound('sucesso');
    this.toast(`✅ ${message}`, 'success');
  }
}

export const notificacaoService = new NotificacaoService();
