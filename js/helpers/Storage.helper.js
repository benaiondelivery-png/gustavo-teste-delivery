// ========================================
// BENAION DELIVERY - STORAGE HELPER
// ========================================

export const StorageHelper = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  },

  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (e) {
      return false;
    }
  },

  getUser() {
    return this.get('benaion_user');
  },

  setUser(user) {
    return this.set('benaion_user', user);
  },

  removeUser() {
    return this.remove('benaion_user');
  },

  getEnderecos() {
    return this.get('benaion_enderecos', []);
  },

  setEnderecos(enderecos) {
    return this.set('benaion_enderecos', enderecos);
  },

  addEndereco(endereco) {
    const enderecos = this.getEnderecos();
    enderecos.unshift(endereco);
    if (enderecos.length > 5) enderecos.pop();
    return this.setEnderecos(enderecos);
  },

  getToken() {
    return this.get('benaion_token');
  },

  setToken(token) {
    return this.set('benaion_token', token);
  },

  removeToken() {
    return this.remove('benaion_token');
  }
};
