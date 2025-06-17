import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  RUNS: '@StrideSync:runs',
  SHOES: '@StrideSync:shoes',
  SHOE_USAGE: '@StrideSync:shoeUsage',
  SETTINGS: '@StrideSync:settings',
  VERSION: '@StrideSync:version',
};

// Current data version for migrations
const DATA_VERSION = '1.0.0';

/**
 * Save data to AsyncStorage
 * @param {string} key - Storage key
 * @param {any} data - Data to be stored (will be stringified)
 */
export const saveData = async (key, data) => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
};

/**
 * Load data from AsyncStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist
 */
export const loadData = async (key, defaultValue = null) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : defaultValue;
  } catch (error) {
    console.error('Error loading data:', error);
    return defaultValue;
  }
};

/**
 * Remove data from AsyncStorage
 * @param {string} key - Storage key to remove
 */
export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing data:', error);
    return false;
  }
};

/**
 * Check if data version needs migration
 */
const checkDataVersion = async () => {
  try {
    const currentVersion = await AsyncStorage.getItem(STORAGE_KEYS.VERSION);
    
    if (currentVersion !== DATA_VERSION) {
      // Handle migrations here when version changes
      console.log(`Migrating data from version ${currentVersion} to ${DATA_VERSION}`);
      await AsyncStorage.setItem(STORAGE_KEYS.VERSION, DATA_VERSION);
    }
    return true;
  } catch (error) {
    console.error('Error checking data version:', error);
    return false;
  }
};

/**
 * Backup all app data
 * @returns {Promise<Object>} Object containing all app data
 */
export const backupData = async () => {
  try {
    const [runs, shoes, shoeUsage, settings] = await Promise.all([
      loadData(STORAGE_KEYS.RUNS, []),
      loadData(STORAGE_KEYS.SHOES, []),
      loadData(STORAGE_KEYS.SHOE_USAGE, {}),
      loadData(STORAGE_KEYS.SETTINGS, {}),
    ]);

    return {
      version: DATA_VERSION,
      timestamp: new Date().toISOString(),
      runs,
      shoes,
      shoeUsage,
      settings,
    };
  } catch (error) {
    console.error('Error creating backup:', error);
    throw error;
  }
};

/**
 * Restore app data from backup
 * @param {Object} backupData - Backup data to restore
 */
export const restoreData = async (backupData) => {
  try {
    if (!backupData || typeof backupData !== 'object') {
      throw new Error('Invalid backup data');
    }

    await Promise.all([
      saveData(STORAGE_KEYS.RUNS, backupData.runs || []),
      saveData(STORAGE_KEYS.SHOES, backupData.shoes || []),
      saveData(STORAGE_KEYS.SHOE_USAGE, backupData.shoeUsage || {}),
      saveData(STORAGE_KEYS.SETTINGS, backupData.settings || {}),
      saveData(STORAGE_KEYS.VERSION, backupData.version || DATA_VERSION),
    ]);

    return true;
  } catch (error) {
    console.error('Error restoring backup:', error);
    throw error;
  }
};

/**
 * Clear all app data
 */
export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    return true;
  } catch (error) {
    console.error('Error clearing all data:', error);
    return false;
  }
};

// Initialize storage when module loads
const initializeStorage = async () => {
  await checkDataVersion();
};

// Run initialization
initializeStorage().catch(console.error);

export default {
  STORAGE_KEYS,
  saveData,
  loadData,
  removeData,
  backupData,
  restoreData,
  clearAllData,
};
