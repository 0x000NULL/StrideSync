import React from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useStoreContext } from '../providers/StoreProvider';

const SettingsScreen = () => {
  const theme = useTheme();
  // Use the store context
  const store = useStoreContext();
  
  if (!store) {
    return null; // or a loading indicator
  }
  
  const { settings, updateSettings } = store;
  
  // Destructure with defaults
  const { 
    theme: themePreference = 'system', 
    notifyRunReminder = true, 
    useHighAccuracyGPS = false,
    temperatureUnit = 'celsius',
    distanceUnit = 'km'
  } = settings || {};
  
  // Map theme preference to switch state
  const darkMode = themePreference === 'dark';
  
  // Handle theme toggle
  const handleThemeToggle = (value) => {
    updateSettings({ 
      theme: value ? 'dark' : 'light' 
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
            <View style={styles.settingItem}>
              <Text style={styles.settingText}>Use Miles</Text>
              <Switch
                value={distanceUnit === 'mi'}
                onValueChange={(value) => updateSettings({ distanceUnit: value ? 'mi' : 'km' })}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={theme.colors.background}
              />
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingText}>Use Fahrenheit</Text>
              <Switch
                value={temperatureUnit === 'fahrenheit'}
                onValueChange={(value) => updateSettings({ temperatureUnit: value ? 'fahrenheit' : 'celsius' })}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={theme.colors.background}
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
              onValueChange={(value) => updateSettings({ notifyRunReminder: value })}
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
              onValueChange={(value) => updateSettings({ useHighAccuracyGPS: value })}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.background}
            />
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Use High Accuracy GPS</Text>
            <Switch
              value={useHighAccuracyGPS}
              onValueChange={(value) => updateSettings({ useHighAccuracyGPS: value })}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor={theme.colors.background}
            />
          </View>
        </View>
        
        <Text style={styles.versionText}>StrideSync v1.0.0</Text>
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;
