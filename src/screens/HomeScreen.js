import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { MaterialCommunityIcons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import StatsCard from '../components/StatsCard';
import QuickAction from '../components/QuickAction';
import Card from '../components/ui/Card';

const HomeScreen = ({ navigation }) => {
  const theme = useTheme();
  
  // Mock data - will be replaced with real data later
  const stats = {
    weeklyDistance: 24.5, // km
    monthlyDistance: 98.2, // km
    totalRuns: 18,
    activeShoes: 2,
  };

  const recentRuns = [
    { id: '1', date: 'Today', distance: '5.2 km', duration: '28:45', pace: '5:32/km' },
    { id: '2', date: 'Yesterday', distance: '3.8 km', duration: '22:30', pace: '5:55/km' },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      padding: theme.spacing.md,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    headerText: {
      flex: 1,
    },
    title: {
      ...theme.typography.h1,
      color: theme.colors.primary,
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      ...theme.typography.body,
      color: theme.colors.text.secondary,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      ...theme.typography.h3,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
    },
    quickActions: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: theme.spacing.lg,
    },
    startButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    startButtonText: {
      ...theme.typography.h2,
      color: theme.colors.text.light,
      marginTop: theme.spacing.xs,
    },
    runItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    runDate: {
      ...theme.typography.caption,
      color: theme.colors.text.secondary,
    },
    runDetails: {
      alignItems: 'flex-end',
    },
    runDistance: {
      ...theme.typography.body,
      fontWeight: '600',
      marginBottom: 2,
    },
    runPace: {
      ...theme.typography.caption,
      color: theme.colors.text.secondary,
    },
  });

  const renderRunItem = (run) => (
    <View key={run.id} style={styles.runItem}>
      <View>
        <Text style={styles.runDate}>{run.date}</Text>
      </View>
      <View style={styles.runDetails}>
        <Text style={styles.runDistance}>{run.distance}</Text>
        <Text style={styles.runPace}>{run.pace} /km</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Let's hit the road</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <MaterialIcons 
              name="settings" 
              size={24} 
              color={theme.colors.text.primary} 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <StatsCard 
            title="This Week" 
            value={stats.weeklyDistance} 
            unit="km"
            icon={<MaterialCommunityIcons name="run" />}
            color="#4CAF50"
          />
          <StatsCard 
            title="This Month" 
            value={stats.monthlyDistance} 
            unit="km"
            icon={<MaterialCommunityIcons name="calendar-month" />}
            color="#2196F3"
          />
        </View>

        <TouchableOpacity 
          style={styles.startButton}
          onPress={() => navigation.navigate('RunTracker')}
        >
          <MaterialCommunityIcons 
            name="run-fast" 
            size={32} 
            color={theme.colors.text.light} 
          />
          <Text style={styles.startButtonText}>Start Run</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <QuickAction 
            icon={<MaterialCommunityIcons name="shoe-print" />}
            label="Shoes"
            onPress={() => navigation.navigate('ShoeList')}
            color="#FF5722"
          />
          <QuickAction 
            icon={<MaterialIcons name="show-chart" />}
            label="Stats"
            onPress={() => navigation.navigate('Stats')}
            color="#9C27B0"
          />
          <QuickAction 
            icon={<MaterialIcons name="history" />}
            label="History"
            onPress={() => navigation.navigate('RunLog')}
            color="#FFC107"
          />
          <QuickAction 
            icon={<FontAwesome5 name="award" />}
            label="Goals"
            onPress={() => navigation.navigate('Goals')}
            color="#4CAF50"
          />
        </View>

        <Text style={styles.sectionTitle}>Recent Runs</Text>
        <Card>
          {recentRuns.length > 0 ? (
            recentRuns.map(run => renderRunItem(run))
          ) : (
            <Text style={[styles.subtitle, { textAlign: 'center', padding: theme.spacing.md }]}>
              No recent runs. Start your first run!
            </Text>
          )}
          {recentRuns.length > 0 && (
            <TouchableOpacity 
              style={{ padding: theme.spacing.sm, alignItems: 'center' }}
              onPress={() => navigation.navigate('RunLog')}
            >
              <Text style={{ color: theme.colors.primary, fontWeight: '500' }}>
                View All Runs
              </Text>
            </TouchableOpacity>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
