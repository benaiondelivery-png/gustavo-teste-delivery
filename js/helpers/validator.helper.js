// ========================================
// BENAION DELIVERY - VALIDATOR HELPER
// ========================================

export const ValidatorHelper = {
  isEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  isPhone(phone) {
    const clean = phone.replace(/\D/g, '');
    return clean.length >= 10 && clean.length <= 11;
  },

  isPasswordStrong(password) {
    return password && password.length >= 6;
  },

  isNotEmpty(value) {
    return value && value.trim().length > 0;
  },

  isNumber(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  },

  isPositiveNumber(value) {
    return this.isNumber(value) && parseFloat(value) > 0;
  },

  isBetween(value, min, max) {
    const num = parseFloat(value);
    return this.isNumber(value) && num >= min && num <= max;
  },

  isValidStatus(status) {
    const validStatuses = [
      'pendente', 'preparando', 'pronto',
      'aguardando_entregador', 'aceito',
      'em_entrega', 'finalizado', 'cancelado'
    ];
    return validStatuses.includes(status);
  },

  isValidUserType(type) {
    return ['cliente', 'entregador', 'parceiro', 'admin'].includes(type);
  },

  validateFields(fields) {
    const errors = {};
    for (const [key, value] of Object.entries(fields)) {
      if (!this.isNotEmpty(value)) {
        errors[key] = 'Campo obrigatório';
      }
    }
    return errors;
  },

  sanitizeString(str) {
    if (!str) return '';
    return str.trim().replace(/<[^>]*>/g, '');
  },

  sanitizePhone(phone) {
    return phone.replace(/\D/g, '');
  }
};
