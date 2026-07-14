// ========================================
// BENAION DELIVERY - MAPA SERVICE
// ========================================

class MapaService {
  constructor() {
    this.cidade = 'Laranjal do Jari';
    this.estado = 'AP';
  }

  openGoogleMaps(origem, destino) {
    const de = encodeURIComponent(`${origem}, ${this.cidade}, ${this.estado}`);
    const para = encodeURIComponent(`${destino}, ${this.cidade}, ${this.estado}`);
    const url = `https://www.google.com/maps/dir/?api=1&origin=${de}&destination=${para}&travelmode=motorcycle`;
    window.open(url, '_blank');
  }

  openWaze(origem, destino) {
    const de = encodeURIComponent(`${origem}, ${this.cidade}, ${this.estado}`);
    const para = encodeURIComponent(`${destino}, ${this.cidade}, ${this.estado}`);
    const url = `https://www.waze.com/ul?ll=${para}&navigate=yes`;
    window.open(url, '_blank');
  }

  getCoordinates(endereco) {
    // Simulação - em produção usar geocoding
    return new Promise((resolve) => {
      resolve({
        lat: -0.8667 + (Math.random() - 0.5) * 0.1,
        lng: -52.5333 + (Math.random() - 0.5) * 0.1
      });
    });
  }

  estimateDistance(origem, destino) {
    // Simulação - em produção usar Distance Matrix API
    const distances = {
      'Centro': { 'Agreste': 2.5, 'Cajari': 3.0, 'Sarney': 4.0, 'Buritizal': 5.0, 'Malvinas': 3.5 },
      'Agreste': { 'Centro': 2.5, 'Cajari': 2.0, 'Sarney': 4.5 },
      'Cajari': { 'Centro': 3.0, 'Agreste': 2.0, 'Sarney': 3.5 }
    };
    return (distances[origem] && distances[origem][destino]) || 5.0;
  }

  estimateTime(origem, destino) {
    const distance = this.estimateDistance(origem, destino);
    const speed = 40; // km/h média
    return Math.round((distance / speed) * 60);
  }

  getCity() {
    return this.cidade;
  }

  getState() {
    return this.estado;
  }
}

export const mapaService = new MapaService();
