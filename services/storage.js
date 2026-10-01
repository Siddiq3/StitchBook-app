import AsyncStorage from '@react-native-async-storage/async-storage';
import authStorage from './authStorage';
import { measurementApi } from './api';

export const storage = {
  ...authStorage,

  // ── MEASUREMENT STORAGE ────────────────────
  getMeasurementsByCustomer: async (customerId) => {
    try {
      // Fetch from API
      const res = await measurementApi.getByCustomer(customerId);
      // Response structure: { data: { success, message, data: { measurements: [...] } } }
      const measurements = res.data?.data?.measurements || res.data?.measurements || [];

      // Normalize and format measurements for frontend
      return measurements.map((m) => ({
        key: m.id,
        _outfitType: m.outfitType || m.outfit_type,
        _outfitLabel: m.outfitLabel || m.outfit_label,
        _measurementsData: m.measurementsData || m.measurements_data,
        _customerGender: m.customerGender || 'male',
        _createdAt: m.createdAt || m.created_at,
        _updatedAt: m.updatedAt || m.updated_at,
        // Include raw data as well
        ...m
      }));
    } catch (error) {

      throw error;
    }
  },

  saveMeasurement: async (customerId, measurementData) => {
    try {
      const res = await measurementApi.create({
        customer_id: customerId,
        ...measurementData
      });

      // Response structure: { data: { success, message, data: {...} } }
      const created = res.data?.data;
      if (created) {
        return {
          key: created.id,
          _outfitType: created.outfitType || created.outfit_type,
          _outfitLabel: created.outfitLabel || created.outfit_label,
          _measurementsData: created.measurementsData || created.measurements_data,
          ...created
        };
      }
      return created;
    } catch (error) {

      throw error;
    }
  },

  updateMeasurement: async (id, data) => {
    try {
      const res = await measurementApi.update(id, data);
      return res.data?.data;
    } catch (error) {

      throw error;
    }
  },

  deleteMeasurement: async (id) => {
    try {
      await measurementApi.delete(id);
      return true;
    } catch (error) {

      throw error;
    }
  },

  // Legacy method for local caching (for offline support)
  setMeasurement: async (key, data) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {

      throw error;
    }
  },

  getMeasurement: async (key) => {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {

      throw error;
    }
  }
};

export default storage;
