import AsyncStorage from '@react-native-async-storage/async-storage';

export class AsyncStorageService {
  constructor() {
    this.prefix = 'salon_app_';
  }

  // キーに接頭詞を追加
  getKey(key) {
    return `${this.prefix}${key}`;
  }

  // データを保存
  async setItem(key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(this.getKey(key), jsonValue);
    } catch (error) {
      throw new Error(`Failed to save data: ${error.message}`);
    }
  }

  // データを取得
  async getItem(key) {
    try {
      const jsonValue = await AsyncStorage.getItem(this.getKey(key));
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      throw new Error(`Failed to get data: ${error.message}`);
    }
  }

  // データを削除
  async removeItem(key) {
    try {
      await AsyncStorage.removeItem(this.getKey(key));
    } catch (error) {
      throw new Error(`Failed to remove data: ${error.message}`);
    }
  }

  // すべてのデータを削除
  async clear() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter(key => key.startsWith(this.prefix));
      await AsyncStorage.multiRemove(appKeys);
    } catch (error) {
      throw new Error(`Failed to clear data: ${error.message}`);
    }
  }

  // 配列データを管理するヘルパーメソッド
  async getArray(key) {
    const data = await this.getItem(key);
    return data || [];
  }

  async setArray(key, array) {
    await this.setItem(key, array);
  }

  async addToArray(key, item) {
    const array = await this.getArray(key);
    array.push(item);
    await this.setArray(key, array);
    return item;
  }

  async updateInArray(key, id, updatedItem) {
    const array = await this.getArray(key);
    const index = array.findIndex(item => item.id === id);
    if (index !== -1) {
      array[index] = { ...array[index], ...updatedItem };
      await this.setArray(key, array);
      return array[index];
    }
    return null;
  }

  async removeFromArray(key, id) {
    const array = await this.getArray(key);
    const filteredArray = array.filter(item => item.id !== id);
    await this.setArray(key, filteredArray);
    return filteredArray;
  }

  async findInArray(key, predicate) {
    const array = await this.getArray(key);
    return array.find(predicate);
  }

  async filterArray(key, predicate) {
    const array = await this.getArray(key);
    return array.filter(predicate);
  }
}