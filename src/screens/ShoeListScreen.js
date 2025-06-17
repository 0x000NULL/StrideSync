import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl, 
  ActivityIndicator,
  SectionList,
  ScrollView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useShoeStore } from '../stores/shoeStore';
import { format } from 'date-fns';
import StatsCard from '../components/StatsCard';
import ShoeListItem from '../components/ShoeListItem';
import FilterModal from '../components/FilterModal';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingSkeleton from '../components/LoadingSkeleton';

const ShoeListScreen = ({ navigation }) => {
  const theme = useTheme();
  const {
    shoes,
    loading,
    error,
    loadShoes,
    getShoesWithStats,
    getShoesNeedingReplacement,
    getShoesByActivity
  } = useShoeStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'retired', 'needsReplacement'
  const [sortBy, setSortBy] = useState('recent');
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // Load shoes on focus
  useFocusEffect(
    useCallback(() => {
      loadShoes();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadShoes();
    } finally {
      setRefreshing(false);
    }
  };

  const filteredShoes = React.useMemo(() => {
    let result = [];
    
    switch (filter) {
      case 'active':
        result = getShoesWithStats().filter(shoe => shoe.isActive);
        break;
      case 'retired':
        result = getShoesWithStats().filter(shoe => !shoe.isActive);
        break;
      case 'needsReplacement':
        result = getShoesNeedingReplacement();
        break;
      default:
        result = getShoesWithStats();
    }
    
    // Apply sorting
    return [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'distance':
          return (b.stats?.totalDistance || 0) - (a.stats?.totalDistance || 0);
        case 'recent':
          return new Date(b.stats?.lastRun || 0) - new Date(a.stats?.lastRun || 0);
        default:
          return 0;
      }
    });
  }, [filter, sortBy, shoes, loading]);

  const stats = React.useMemo(() => {
    const activeShoes = getShoesWithStats().filter(shoe => shoe.isActive);
    const totalDistance = activeShoes.reduce((sum, shoe) => sum + (shoe.stats?.totalDistance || 0), 0);
    const totalRuns = activeShoes.reduce((sum, shoe) => sum + (shoe.stats?.totalRuns || 0), 0);
    const averageDistance = activeShoes.length > 0 
      ? totalDistance / activeShoes.length 
      : 0;
    
    return {
      totalShoes: activeShoes.length,
      totalDistance,
      totalRuns,
      averageDistance,
      shoesNeedingReplacement: getShoesNeedingReplacement().length,
    };
  }, [shoes]);

  const renderShoeItem = ({ item }) => (
    <ShoeListItem 
      shoe={item} 
      onPress={() => navigation.navigate('ShoeDetail', { shoeId: item.id })}
    />
  );

  const renderEmptyState = () => {
    if (loading) {
      return <LoadingSkeleton count={3} />;
    }
    
    if (error) {
      return (
        <ErrorState 
          message="Failed to load shoes" 
          onRetry={loadShoes} 
        />
      );
    }
    
    return (
      <EmptyState 
        icon="directions-run" 
        title="No Shoes Found"
        message={filter === 'all' 
          ? "You haven't added any shoes yet." 
          : "No shoes match the current filter."}
        action={filter !== 'all' ? {
          label: 'Show All',
          onPress: () => setFilter('all')
        } : null}
      />
    );
  };

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
      marginBottom: theme.spacing.md,
    },
    title: {
      ...theme.typography.h2,
      color: theme.colors.text.primary,
    },
    actions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    filterButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surfaceVariant,
    },
    addButton: {
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    buttonText: {
      ...theme.typography.button,
      color: theme.colors.text.light,
    },
    statsContainer: {
      marginBottom: theme.spacing.md,
    },
    filterChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.md,
    },
    filterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: 16,
    },
    filterChipText: {
      ...theme.typography.caption,
      color: theme.colors.text.secondary,
      marginRight: theme.spacing.xs,
    },
    filterChipActive: {
      backgroundColor: theme.colors.primaryContainer,
    },
    filterChipTextActive: {
      color: theme.colors.primary,
    },
  });

  const filterOptions = [
    { id: 'all', label: 'All Shoes' },
    { id: 'active', label: 'Active' },
    { id: 'retired', label: 'Retired' },
    { id: 'needsReplacement', label: 'Needs Replacement' },
  ];

  const sortOptions = [
    { id: 'recent', label: 'Recently Used' },
    { id: 'name', label: 'Name' },
    { id: 'distance', label: 'Distance' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>My Shoes</Text>
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowFilterModal(true)}
            >
              <MaterialIcons 
                name="filter-list" 
                size={24} 
                color={theme.colors.primary} 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => navigation.navigate('AddShoe')}
            >
              <MaterialIcons 
                name="add" 
                size={20} 
                color={theme.colors.text.light} 
              />
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.statsContainer}
          contentContainerStyle={{ gap: theme.spacing.md }}
        >
          <StatsCard 
            title="Total Distance"
            value={`${stats.totalDistance.toFixed(1)} km`}
            icon="directions-run"
            color={theme.colors.primary}
          />
          <StatsCard 
            title="Total Runs"
            value={stats.totalRuns.toString()}
            icon="repeat"
            color={theme.colors.secondary}
          />
          <StatsCard 
            title="Shoes Active"
            value={stats.totalShoes.toString()}
            icon="check-circle"
            color={theme.colors.success}
          />
          {stats.shoesNeedingReplacement > 0 && (
            <StatsCard 
              title="Needs Replacement"
              value={stats.shoesNeedingReplacement.toString()}
              icon="warning"
              color={theme.colors.warning}
            />
          )}
        </ScrollView>

        {/* Filter Chips */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterChips}
          contentContainerStyle={{ paddingRight: theme.spacing.md }}
        >
          {filterOptions.map(option => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.filterChip,
                filter === option.id && styles.filterChipActive
              ]}
              onPress={() => setFilter(option.id)}
            >
              <Text style={[
                styles.filterChipText,
                filter === option.id && styles.filterChipTextActive
              ]}>
                {option.label}
              </Text>
              {filter === option.id && (
                <MaterialIcons 
                  name="close" 
                  size={16} 
                  color={theme.colors.primary} 
                />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Shoe List */}
        <FlatList
          data={filteredShoes}
          renderItem={renderShoeItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ flexGrow: 1 }}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: theme.spacing.sm }} />}
        />
      </View>

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Filter & Sort"
        options={sortOptions}
        selected={sortBy}
        onSelect={setSortBy}
      />
    </View>
  );
};

export default ShoeListScreen;
