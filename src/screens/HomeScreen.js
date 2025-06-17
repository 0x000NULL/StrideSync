import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { 
  MaterialCommunityIcons, 
  MaterialIcons, 
  FontAwesome5 
} from '@expo/vector-icons';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import StatsCard from '../components/StatsCard';
import QuickAction from '../components/QuickAction';
import Card from '../components/ui/Card';
import { useStore } from '../stores';

const HomeScreen = ({ navigation }) => {
  const theme = useTheme();
  
  // Get data from Zustand store
  const { runs, shoes, getRunStats } = useStore();
  
  // Calculate statistics
  const weeklyStats = getRunStats('week');
  const monthlyStats = getRunStats('month');
  
  // Format recent runs for display
  const recentRuns = [...runs]
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
    .slice(0, 3)
    .map(run => {
      const runDate = new Date(run.startTime);
      let dateText;
      
      if (isToday(runDate)) {
        dateText = 'Today';
      } else if (isYesterday(runDate)) {
        dateText = 'Yesterday';
      } else {
        dateText = format(runDate, 'MMM d');
      }
      
      // Format duration (seconds) to MM:SS
      const formatDuration = (seconds) => {
        if (!seconds) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      };
      
      // Format pace (m/s to min/km)
      const formatPace = (pace) => {
        if (!pace || !pace.minutes) return '--:--/km';
        return `${pace.minutes}:${pace.seconds.toString().padStart(2, '0')}/km`;
      };
      
      return {
        ...run,
        date: dateText,
        formattedDistance: `${run.distance ? run.distance.toFixed(1) : '0.0'} km`,
        formattedDuration: formatDuration(run.duration),
        formattedPace: formatPace(run.pace)
      };
    });
    
  // Get active shoes count
  const activeShoes = shoes.filter(shoe => shoe.isActive).length;
  
  // Get last run time
  const lastRunTime = runs.length > 0 
    ? `Last run ${formatDistanceToNow(new Date(runs[0].startTime), { addSuffix: true })}`
    : 'No runs yet';

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
    quickActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
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
      marginBottom: 2,
    },
    runDuration: {
      ...theme.typography.caption,
      color: theme.colors.text.secondary,
      opacity: 0.8,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    seeAll: {
      ...theme.typography.button,
      color: theme.colors.primary,
    },
    runsCard: {
      marginBottom: theme.spacing.lg,
    },
    noRuns: {
      padding: theme.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    noRunsIcon: {
      marginBottom: theme.spacing.md,
      opacity: 0.5,
    },
    noRunsText: {
      ...theme.typography.body,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    startRunButton: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.primary,
    },
    startRunButtonText: {
      ...theme.typography.button,
      color: theme.colors.text.light,
    },
  });

  const renderRunItem = (run) => (
    <TouchableOpacity 
      key={run.id} 
      style={styles.runItem}
      onPress={() => navigation.navigate('RunDetails', { runId: run.id })}
    >
      <View>
        <Text style={styles.runDate}>{run.date}</Text>
        <Text style={styles.runDistance}>{run.formattedDistance}</Text>
      </View>
      <View style={styles.runDetails}>
        <Text style={styles.runPace}>{run.formattedPace}</Text>
        <Text style={styles.runDuration}>{run.formattedDuration}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>{lastRunTime}</Text>
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
            value={weeklyStats.totalDistance.toFixed(1)} 
            unit="km"
            icon={<MaterialCommunityIcons name="run" />}
            color="#4CAF50"
            subtitle={`${weeklyStats.totalRuns} runs`}
          />
          <StatsCard 
            title="This Month" 
            value={monthlyStats.totalDistance.toFixed(1)} 
            unit="km"
            icon={<MaterialCommunityIcons name="calendar-month" />}
            color="#2196F3"
            subtitle={`${monthlyStats.totalRuns} runs`}
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
            label={`Shoes (${activeShoes})`}
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
            label={`Runs (${runs.length})`}
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

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Runs</Text>
          {runs.length > 0 && (
            <TouchableOpacity onPress={() => navigation.navigate('RunLog')}>
              <Text style={[styles.seeAll, { color: theme.colors.primary }]}>
                See All
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        <Card style={styles.runsCard}>
          {recentRuns.length > 0 ? (
            recentRuns.map(run => renderRunItem(run))
          ) : (
            <View style={styles.noRuns}>
              <MaterialCommunityIcons 
                name="run" 
                size={48} 
                color={theme.colors.text.secondary} 
                style={styles.noRunsIcon}
              />
              <Text style={styles.noRunsText}>No runs recorded yet</Text>
              <TouchableOpacity 
                style={styles.startRunButton}
                onPress={() => navigation.navigate('RunTracker')}
              >
                <Text style={styles.startRunButtonText}>Start Your First Run</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;