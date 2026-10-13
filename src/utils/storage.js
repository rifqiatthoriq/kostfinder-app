import * as SecureStore from 'expo-secure-store';

// Menyimpan token sensitif ke SecureStore HP (Materi Pekan 3)
export const saveSecureData = async (key, value) => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.error(`Gagal menyimpan ${key}:`, error);
  }
};

// Membaca token sensitif
export const getSecureData = async (key) => {
  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.error(`Gagal membaca ${key}:`, error);
    return null;
  }
};

// Menghapus token saat Logout
export const removeSecureData = async (key) => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.error(`Gagal menghapus ${key}:`, error);
  }
};