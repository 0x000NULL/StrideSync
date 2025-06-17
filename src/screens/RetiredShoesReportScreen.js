import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useStore } from '../stores/useStore';
import { format, parseISO, differenceInDays } from 'date-fns';
import { MaterialIcons } from '@expo/vector-icons';
import Card from '../components/ui/Card';
import StatsCard from '../components/StatsCard';
import ShoeListItem from '../components/ShoeListItem';

const RetiredShoesReportScreen = ({ navigation }) => {
  const theme = useTheme();
  const shoes = useStore(state => state.shoes);
  const getShoeStats = useStore(state => state.getShoeStats);
  
  // Filter and sort retired shoes
  const retiredShoes = useMemo(() => {
    return shoes
      .filter(shoe => !shoe.isActive && shoe.retirementDate)
      .sort((a, b) => new Date(b.retirementDate) - new Date(a.retirementDate));
  }, [shoes]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (retiredShoes.length === 0) {
      return {
        totalShoes: 0,
        totalDistance: 0,
        averageLifespan: 0,
        averageDistance: 0,
      };
    }

    const totalDistance = retiredShoes.reduce((sum, shoe) => {
      const stats = getShoeStats(shoe.id);
      return sum + (stats?.totalDistance || 0);
    }, 0);

    const totalLifespan = retiredShoes.reduce((sum, shoe) => {
      if (!shoe.purchaseDate || !shoe.retirementDate) return sum;
      const lifespan = differenceInDays(
        parseISO(shoe.retirementDate),
        parseISO(shoe.purchaseDate)
      );
      return sum + Math.max(0, lifespan);
    }, 0);

    return {
      totalShoes: retiredShoes.length,
      totalDistance,
      averageLifespan: Math.round(totalLifespan / retiredShoes.length),
      averageDistance: Math.round((totalDistance / retiredShoes.length) * 10) / 10,
    };
  }, [retiredShoes, getShoeStats]);

  const handleShoePress = (shoeId) => {
    navigation.navigate('ShoeDetail', { shoeId });
  };

  const renderShoeItem = ({ item }) => (
    <ShoeListItem 
      shoe={item} 
      onPress={() => handleShoePress(item.id)}
      showDivider={false}
    />
  );

  if (retiredShoes.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.emptyContainer}>
          <MaterialIcons 
            name="directions-walk" 
            size={48} 
            color={theme.colors.textSecondary} 
            style={styles.emptyIcon}
          />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            No retired shoes yet
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.colors.textTertiary }]}>
            Your retired shoes will appear here
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.statsRow}>
          <StatsCard 
            title="Total Shoes"
            value={stats.totalShoes}
            icon="directions-walk"
            size="small"
          />
          <StatsCard 
            title="Total Distance"
            value={`${stats.totalDistance.toFixed(0)} km`}
            icon="timeline"
            size="small"
          />
        </View>
        
        <View style={styles.statsRow}>
          <StatsCard 
            title="Avg. Lifespan"
            value={`${stats.averageLifespan} days`}
            icon="event"
            size="small"
          />
          <StatsCard 
            title="Avg. Distance"
            value={`${stats.averageDistance} km`}
            icon="trending-up"
            size="small"
          />
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Retired Shoes ({retiredShoes.length})
          </Text>
          <Card style={styles.shoesCard}>
            <FlatList
              data={retiredShoes}
              renderItem={renderShoeItem}
              keyExtractor={item => item.id}
              ItemSeparatorComponent={() => (
                <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
              )}
            />
          </Card>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  shoesCard: {
    padding: 0,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 300,
  },
});

export default RetiredShoesReportScreen;
