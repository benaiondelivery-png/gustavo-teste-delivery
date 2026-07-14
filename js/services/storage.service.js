// ========================================
// BENAION DELIVERY - STORAGE SERVICE
// ========================================

import { 
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

import { app } from '../config/firebase.js';

class StorageService {
  constructor() {
    this.storage = getStorage(app);
  }

  async upload(path, file) {
    const storageRef = ref(this.storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  }

  async uploadImage(path, file) {
    return await this.upload(path, file);
  }

  async uploadProfileImage(uid, file) {
    const path = `profiles/${uid}/photo.jpg`;
    return await this.upload(path, file);
  }

  async uploadProdutoImage(produtoId, file) {
    const path = `produtos/${produtoId}/image.jpg`;
    return await this.upload(path, file);
  }

  async deleteFile(path) {
    const storageRef = ref(this.storage, path);
    await deleteObject(storageRef);
  }

  async getURL(path) {
    const storageRef = ref(this.storage, path);
    return await getDownloadURL(storageRef);
  }
}

export const storageService = new StorageService();
