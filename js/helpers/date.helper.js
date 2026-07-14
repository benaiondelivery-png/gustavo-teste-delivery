// ========================================
// BENAION DELIVERY - DATE HELPER
// ========================================

export const DateHelper = {
  now() {
    return Date.now();
  },

  today() {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now.getTime();
  },

  isToday(timestamp) {
    return new Date(timestamp).toDateString() === new Date().toDateString();
  },

  isThisWeek(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const firstDay = new Date(now.setDate(now.getDate() - now.getDay()));
    const lastDay = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    return date >= firstDay && date <= lastDay;
  },

  isThisMonth(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    return date.getMonth() === now.getMonth() && 
           date.getFullYear() === now.getFullYear();
  },

  daysBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  hoursBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return diffTime / (1000 * 60 * 60);
  },

  formatRelative(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Agora mesmo';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min atrás`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`;
    if (diff < 172800000) return 'Ontem';
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} dias atrás`;
    if (diff < 2592000000) return `${Math.floor(diff / 604800000)} semanas atrás`;
    return new Date(timestamp).toLocaleDateString('pt-BR');
  },

  toISO(timestamp) {
    return new Date(timestamp).toISOString();
  },

  fromISO(isoString) {
    return new Date(isoString).getTime();
  }
};
