import { Alert } from 'react-native';
import produce from 'immer';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

/**
 * Middleware for validating state against a schema.
 * This is a simplified example. For a real app, you might use a library like Zod.
 * @param {Function} config - Zustand store config.
 * @returns {Function}
 */
export const validationMiddleware = config => (set, get, api) => {
  return config(
    args => {
      // You can add validation logic here before setting the state.
      // For example, check if `args.runs` is an array.
      console.log('State is about to be updated:', args);
      set(args);
      console.log('State has been updated:', get());
    },
    get,
    api
  );
};

/**
 * Creates a migration function for the Zustand persist middleware.
 * @param {object} migrations - An object where keys are version numbers and values are migration functions.
 * @returns {Function}
 */
export const createMigrate = migrations => {
  return (persistedState, version) => {
    if (!persistedState) {
      return;
    }

    const migrationKeys = Object.keys(migrations)
      .map(v => parseInt(v, 10))
      .sort((a, b) => a - b);

    let state = persistedState;
    for (const v of migrationKeys) {
      if (v > version) {
        state = produce(state, migrations[v]);
      }
    }
    return state;
  };
};

/**
 * Adds backup and restore functionality to a Zustand store.
 * @param {Function} set - The Zustand `set` function.
 * @param {Function} get - The Zustand `get` function.
 * @returns {object} - An object with `backupState` and `restoreState` functions.
 */
export const createBackupSlice = (set, get) => ({
  backupState: async () => {
    try {
      const state = get();
      const stateJson = JSON.stringify(state, null, 2);
      const fileUri = FileSystem.documentDirectory + 'StrideSync_Backup.json';
      await FileSystem.writeAsStringAsync(fileUri, stateJson, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Share or save your StrideSync backup',
        });
      } else {
        Alert.alert('Backup Saved', `Your backup has been saved to: ${fileUri}`);
      }
    } catch (error) {
      console.error('Failed to backup state:', error);
      Alert.alert('Backup Failed', 'Could not save the backup file.');
    }
  },

  restoreState: async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
      });

      if (result.type === 'success') {
        const stateJson = await FileSystem.readAsStringAsync(result.uri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        const restoredState = JSON.parse(stateJson);

        // Here you might want to add validation to ensure the restored state is valid.
        Alert.alert(
          'Confirm Restore',
          'Are you sure you want to restore this backup? This will overwrite your current data.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Restore',
              onPress: () => {
                set(restoredState);
                Alert.alert('Restore Complete', 'Your data has been successfully restored.');
              },
              style: 'destructive',
            },
          ]
        );
      }
    } catch (error) {
      console.error('Failed to restore state:', error);
      Alert.alert('Restore Failed', 'Could not read the backup file.');
    }
  },
});
