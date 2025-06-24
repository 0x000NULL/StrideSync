import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  Button,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useStore } from '../stores/useStore';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import healthService from '../services/healthService';

const SettingsScreen = () => {
  const theme = useTheme();
  const settings = useStore(state => state.settings);
  const updateSettings = useStore(state => state.updateSettings);
  const backupState = useStore(state => state.backupState);
  const restoreState = useStore(state => state.restoreState);
  const [isHealthConnected, setIsHealthConnected] = useState(false);

  // Destructure with defaults
  const {
    theme: themePreference = 'system',
    notifyRunReminder = true,
    useHighAccuracyGPS = false,
    temperatureUnit = 'celsius',
    distanceUnit = 'km',
    gender,
    height,
    weight,
    birthDate,
  } = settings || {};

  // Map theme preference to switch state
  const darkMode = themePreference === 'dark';

  // Handle theme toggle by updating the persisted settings.
  const handleThemeToggle = value => {
    updateSettings({ theme: value ? 'dark' : 'light' });
  };

  const handleHealthConnect = () => {
    healthService.initialize((error, success) => {
      if (error) {
        Alert.alert('Error', 'Could not connect to Apple Health.');
        return;
      }
      setIsHealthConnected(success);
      if (success) {
        Alert.alert('Success', 'Connected to Apple Health.');
        // Fetch data from HealthKit and update the store
        healthService.getBiologicalSex((err, res) => !err && updateSettings({ gender: res.value }));
        healthService.getLatestHeight((err, res) => !err && updateSettings({ height: res.value }));
        healthService.getLatestWeight((err, res) => !err && updateSettings({ weight: res.value }));
        healthService.getDateOfBirth(
          (err, res) => !err && updateSettings({ birthDate: res.value.substring(0, 10) })
        );
      }
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      padding: theme.spacing.md,
    },
    header: {
      marginBottom: theme.spacing.lg,
    },
    title: {
      ...theme.typography.h2,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      ...theme.typography.h3,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingBottom: theme.spacing.xs,
    },
    settingItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    settingText: {
      ...theme.typography.body,
      color: theme.colors.text.primary,
      flex: 1,
      marginRight: theme.spacing.md,
    },
    versionText: {
      ...theme.typography.caption,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginTop: theme.spacing.xl,
    },
    segmentedControl: {
      height: 30,
      width: '100%',
      backgroundColor: theme.colors.background,
    },
    unitLabel: {
      ...theme.typography.body,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    unitContainer: {
      flex: 1,
    },
    input: {
      ...theme.typography.body,
      color: theme.colors.text.primary,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingVertical: theme.spacing.xs,
      textAlign: 'right',
      minWidth: 80,
    },
    genderSegmentedControl: {
      width: 200,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={handleThemeToggle}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.background}
            />
          </View>
          <View style={styles.settingItem}>
            <View style={styles.unitContainer}>
              <Text style={styles.unitLabel}>Distance Units</Text>
              <SegmentedControl
                values={['Kilometers', 'Miles']}
                selectedIndex={['Kilometers', 'Miles'].indexOf(
                  distanceUnit === 'km' ? 'Kilometers' : 'Miles'
                )}
                onChange={event => {
                  updateSettings({
                    distanceUnit: event.nativeEvent.selectedSegmentIndex === 0 ? 'km' : 'mi',
                  });
                }}
                appearance={theme.dark ? 'dark' : 'light'}
                style={[styles.segmentedControl, styles.unitContainer]}
                tintColor={theme.colors.primary}
                fontStyle={{ color: theme.colors.text.primary }}
                activeFontStyle={{ color: theme.colors.onPrimary || theme.colors.text.light }}
              />
            </View>
          </View>
          <View style={styles.settingItem}>
            <View style={styles.unitContainer}>
              <Text style={styles.unitLabel}>Temperature Units</Text>
              <SegmentedControl
                values={['Celsius', 'Fahrenheit']}
                selectedIndex={['Celsius', 'Fahrenheit'].indexOf(
                  temperatureUnit === 'celsius' ? 'Celsius' : 'Fahrenheit'
                )}
                onChange={event => {
                  updateSettings({
                    temperatureUnit:
                      event.nativeEvent.selectedSegmentIndex === 0 ? 'celsius' : 'fahrenheit',
                  });
                }}
                appearance={theme.dark ? 'dark' : 'light'}
                style={[styles.segmentedControl, styles.unitContainer]}
                tintColor={theme.colors.primary}
                fontStyle={{ color: theme.colors.text.primary }}
                activeFontStyle={{ color: theme.colors.onPrimary || theme.colors.text.light }}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Enable Notifications</Text>
            <Switch
              value={notifyRunReminder}
              onValueChange={value => updateSettings({ notifyRunReminder: value })}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.background}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tracking</Text>
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Background Location Tracking</Text>
            <Switch
              value={useHighAccuracyGPS}
              onValueChange={value => updateSettings({ useHighAccuracyGPS: value })}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.background}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Use High Accuracy GPS</Text>
            <Switch
              value={useHighAccuracyGPS}
              onValueChange={value => updateSettings({ useHighAccuracyGPS: value })}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.background}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Biometrics</Text>
          {Platform.OS === 'ios' && (
            <View style={styles.settingItem}>
              <Button
                title={isHealthConnected ? 'HealthKit Connected' : 'Connect to Apple Health'}
                onPress={handleHealthConnect}
                color={theme.colors.primary}
                disabled={isHealthConnected}
              />
            </View>
          )}
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Gender</Text>
            <SegmentedControl
              values={['Male', 'Female', 'Other']}
              selectedIndex={['male', 'female', 'other'].indexOf(gender)}
              onChange={event => {
                updateSettings({
                  gender: ['male', 'female', 'other'][event.nativeEvent.selectedSegmentIndex],
                });
              }}
              style={styles.genderSegmentedControl}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Height (cm)</Text>
            <TextInput
              style={styles.input}
              value={height ? String(height) : ''}
              onChangeText={value => updateSettings({ height: Number(value) })}
              keyboardType="numeric"
              placeholder="e.g., 180"
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={weight ? String(weight) : ''}
              onChangeText={value => updateSettings({ weight: Number(value) })}
              keyboardType="numeric"
              placeholder="e.g., 75"
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Birth Date</Text>
            <TextInput
              style={styles.input}
              value={birthDate || ''}
              onChangeText={value => updateSettings({ birthDate: value })}
              placeholder="YYYY-MM-DD"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          <View style={styles.settingItem}>
            <Button title="Backup Data" onPress={backupState} color={theme.colors.primary} />
          </View>
          <View style={styles.settingItem}>
            <Button title="Restore Data" onPress={restoreState} color={theme.colors.primary} />
          </View>
        </View>

        <Text style={styles.versionText}>Stride Keeper v1.0.4</Text>
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;
