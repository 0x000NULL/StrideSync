import React from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, Button } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useStore } from '../stores/useStore';
import SegmentedControl from '@react-native-segmented-control/segmented-control';

const SettingsScreen = () => {
  const theme = useTheme();
  const settings = useStore(state => state.settings);
  const updateSettings = useStore(state => state.updateSettings);
  const backupState = useStore(state => state.backupState);
  const restoreState = useStore(state => state.restoreState);

  // Destructure with defaults
  const {
    theme: themePreference = 'system',
    notifyRunReminder = true,
    useHighAccuracyGPS = false,
    temperatureUnit = 'celsius',
    distanceUnit = 'km',
  } = settings || {};

  // Map theme preference to switch state
  const darkMode = themePreference === 'dark';

  // Handle theme toggle by updating the persisted settings.
  const handleThemeToggle = value => {
    updateSettings({ theme: value ? 'dark' : 'light' });
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
    button: {
      marginTop: 10,
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
            <View style={{ flex: 1 }}>
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
                activeFontStyle={{ color: '#fff' }}
              />
            </View>
          </View>
          <View style={styles.settingItem}>
            <View style={{ flex: 1 }}>
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
                activeFontStyle={{ color: '#fff' }}
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
          <Text style={styles.sectionTitle}>Data Management</Text>
          <View style={styles.settingItem}>
            <Button title="Backup Data" onPress={backupState} color={theme.colors.primary} />
          </View>
          <View style={styles.settingItem}>
            <Button title="Restore Data" onPress={restoreState} color={theme.colors.primary} />
          </View>
        </View>

        <Text style={styles.versionText}>StrideSync v1.0.0</Text>
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;
