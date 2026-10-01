import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

// Local persistence only: this module must not depend on API services.
const KEYS = {
  TOKEN: "auth_token",
  REFRESH: "auth_refresh",
  USER: "auth_user",
  SHOP: "auth_shop",
  MEASUREMENTS: "measurements_cache",
};

const authStorage = {
  saveAuth: async (token, refreshToken, user) => {
    await Promise.all([
      SecureStore.setItemAsync(KEYS.TOKEN, token),
      SecureStore.setItemAsync(KEYS.REFRESH, refreshToken),
      AsyncStorage.setItem(KEYS.USER, JSON.stringify(user)),
    ]);
  },
  getToken: () => SecureStore.getItemAsync(KEYS.TOKEN),
  setToken: (token) => SecureStore.setItemAsync(KEYS.TOKEN, token),
  getRefreshToken: () => SecureStore.getItemAsync(KEYS.REFRESH),
  setRefreshToken: (token) => SecureStore.setItemAsync(KEYS.REFRESH, token),
  getUser: async () => {
    const raw = await AsyncStorage.getItem(KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  },
  setUser: (user) => AsyncStorage.setItem(KEYS.USER, JSON.stringify(user)),
  saveShop: (shop) => AsyncStorage.setItem(KEYS.SHOP, JSON.stringify(shop)),
  getShop: async () => {
    const raw = await AsyncStorage.getItem(KEYS.SHOP);
    return raw ? JSON.parse(raw) : null;
  },
  clearAll: async () => {
    const allKeys = await AsyncStorage.getAllKeys();
    const measurementKeys = allKeys.filter((key) => key.startsWith("measurement_"));
    await Promise.all([
      SecureStore.deleteItemAsync(KEYS.TOKEN),
      SecureStore.deleteItemAsync(KEYS.REFRESH),
      AsyncStorage.multiRemove([KEYS.USER, KEYS.SHOP, KEYS.MEASUREMENTS, ...measurementKeys]),
    ]);
  },
};

export default authStorage;
