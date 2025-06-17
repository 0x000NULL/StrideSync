import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

// Temporary mock data
const mockRuns = [
  { id: '1', date: '2023-06-15', distance: '5.2 km', duration: '28:45' },
  { id: '2', date: '2023-06-13', distance: '3.8 km', duration: '22:30' },
  { id: '3', date: '2023-06-10', distance: '7.1 km', duration: '40:15' },
];

const RunLogScreen = () => {
  const theme = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.md,
    },
    header: {
      marginBottom: theme.spacing.md,
    },
    title: {
      ...theme.typography.h2,
      color: theme.colors.text.primary,
    },
    runItem: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.sm,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    runDate: {
      ...theme.typography.body,
      fontWeight: '600',
    },
    runDetails: {
      ...theme.typography.caption,
      marginTop: theme.spacing.xs,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      ...theme.typography.body,
      color: theme.colors.text.secondary,
      textAlign: 'center',
    },
  });

  const renderRunItem = ({ item }) => (
    <View style={styles.runItem}>
      <View>
        <Text style={styles.runDate}>{item.date}</Text>
        <Text style={styles.runDetails}>{item.distance} • {item.duration}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Run Log</Text>
      </View>
      
      {mockRuns.length > 0 ? (
        <FlatList
          data={mockRuns}
          renderItem={renderRunItem}
          keyExtractor={item => item.id}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No runs recorded yet.</Text>
          <Text style={styles.emptyText}>Start your first run to see it here!</Text>
        </View>
      )}
    </View>
  );
};

export default RunLogScreen;
