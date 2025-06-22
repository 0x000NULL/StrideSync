import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useStore } from '../stores/useStore';
import StatsCard from '../components/StatsCard';
import ShoeListItem from '../components/ShoeListItem';
import FilterModal from '../components/FilterModal';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useUnits } from '../hooks/useUnits'; // Import useUnits
import PropTypes from 'prop-types';

const ShoeListScreen = ({ navigation }) => {
  const theme = useTheme();
  const { formatDistance } = useUnits(); // Get formatDistance
  const shoes = useStore(state => state.shoes);
  const loading = useStore(state => state.isLoading);
  const error = useStore(state => state.error);
  const loadShoes = useStore(state => state.loadShoes);
  const getShoesWithStats = useStore(state => state.getShoesWithStats);
  const getShoesNeedingReplacement = useStore(state => state.getShoesNeedingReplacement);

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('active'); // 'all', 'active', 'retired', 'needsReplacement'
  const [sortBy, setSortBy] = useState('recent');
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Load shoes on focus
  // Set up header right button
  const headerRightCallback = React.useCallback(
    () => (
      <TouchableOpacity
        onPress={() => navigation.navigate('RetiredShoesReport')}
        style={styles.headerRightButton}
      >
        <MaterialIcons name="history" size={24} color={theme.colors.primary} />
      </TouchableOpacity>
    ),
    [navigation, theme.colors.primary, styles.headerRightButton]
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: headerRightCallback,
    });
  }, [navigation, headerRightCallback]);

  useFocusEffect(
    useCallback(() => {
      loadShoes();
    }, [loadShoes])
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
    // Get shoes with their stats (ensure recalculates when shoes array changes)
    // eslint-disable-next-line no-unused-vars
    const shoesTrigger = shoes.length;
    const shoesWithStats = getShoesWithStats();

    // Apply filters
    let result = [];
    switch (filter) {
      case 'active':
        result = shoesWithStats.filter(shoe => shoe.isActive);
        break;
      case 'retired':
        result = shoesWithStats.filter(shoe => !shoe.isActive);
        break;
      case 'needsReplacement':
        result = getShoesNeedingReplacement();
        break;
      default:
        result = [...shoesWithStats];
    }

    // Apply sorting
    return [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'brand':
          return (a.brand || '').localeCompare(b.brand || '');
        case 'distance':
          return (b.stats?.totalDistance || 0) - (a.stats?.totalDistance || 0);
        case 'lastUsed':
          return (b.stats?.lastRun || 0) - (a.stats?.lastRun || 0);
        case 'purchaseDate':
          return new Date(a.purchaseDate || 0) - new Date(b.purchaseDate || 0);
        case 'status':
          // Active shoes first, then inactive
          if (a.isActive !== b.isActive) {
            return a.isActive ? -1 : 1;
          }
          return 0;
        case 'recent':
        default:
          return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
      }
    });
  }, [filter, sortBy, shoes, getShoesWithStats, getShoesNeedingReplacement]);

  const stats = React.useMemo(() => {
    // Trigger recalculation when the shoes array changes
    // eslint-disable-next-line no-unused-vars
    const shoesCountTrigger = shoes.length;
    const activeShoes = getShoesWithStats().filter(shoe => shoe.isActive);
    const totalDistance = activeShoes.reduce(
      (sum, shoe) => sum + (shoe.stats?.totalDistance || 0),
      0
    );
    const totalRuns = activeShoes.reduce((sum, shoe) => sum + (shoe.stats?.totalRuns || 0), 0);
    const averageDistance = activeShoes.length > 0 ? totalDistance / activeShoes.length : 0;

    return {
      totalShoes: activeShoes.length,
      totalDistance,
      totalRuns,
      averageDistance,
      shoesNeedingReplacement: getShoesNeedingReplacement().length,
    };
  }, [shoes, getShoesWithStats, getShoesNeedingReplacement]);

  const renderShoeItem = useCallback(
    ({ item }) => (
      <ShoeListItem
        shoe={item}
        onPress={() => navigation.navigate('ShoeDetail', { shoeId: item.id })}
        showDivider={true}
      />
    ),
    [navigation]
  );

  // Stable separator component to avoid defining inline components in render
  const renderSeparator = useCallback(() => <View style={{ height: theme.spacing.sm }} />, [theme]);

  const renderEmptyState = () => {
    if (loading) {
      return <LoadingSkeleton count={3} />;
    }

    if (error) {
      return <ErrorState message="Failed to load shoes" onRetry={loadShoes} />;
    }

    // Check if we have shoes but they're all filtered out
    const hasShoes = shoes.length > 0;
    const hasActiveShoes = hasShoes && shoes.some(s => s.isActive);
    const hasRetiredShoes = hasShoes && shoes.some(s => !s.isActive);

    let title = 'No shoes found';
    let message = 'Add your first pair of running shoes to get started';
    let showAction = true;
    let actionLabel = 'Add Shoe';
    let actionOnPress = () => navigation.navigate('AddShoe');

    if (filter === 'retired') {
      title = 'No retired shoes';
      if (hasShoes && !hasRetiredShoes) {
        message = 'You have no retired shoes yet';
        showAction = false;
      } else if (hasShoes) {
        message = 'No shoes match your current filters';
      } else {
        message = 'Your retired shoes will appear here';
      }
    } else if (filter === 'needsReplacement') {
      title = 'No shoes need replacement';
      message = hasActiveShoes
        ? 'All your active shoes are in good condition'
        : 'No active shoes to monitor';
      showAction = !hasActiveShoes;
    } else if (filter === 'active') {
      if (hasShoes && !hasActiveShoes) {
        title = 'No active shoes';
        message = 'All your shoes are currently retired';
        showAction = true;
      } else if (!hasShoes) {
        title = 'No shoes added yet';
        message = 'Track your running shoes to monitor their usage and condition';
      }
    }

    return (
      <EmptyState
        icon={
          filter === 'retired'
            ? 'history'
            : filter === 'needsReplacement'
              ? 'warning'
              : 'directions-walk'
        }
        title={title}
        message={message}
        action={
          showAction && {
            label: actionLabel,
            onPress: actionOnPress,
          }
        }
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
    headerRightButton: {
      // Added for header button
      marginRight: theme.spacing.md,
    },
    flexGrow1: {
      // Added for FlatList contentContainerStyle
      flexGrow: 1,
    },
  });

  const renderFilterModal = () => (
    <FilterModal
      visible={showFilterModal}
      onClose={() => setShowFilterModal(false)}
      filters={{
        status: filter,
        sortBy,
      }}
      filterOptions={[
        { value: 'active', label: 'Active Shoes' },
        { value: 'retired', label: 'Retired Shoes' },
        { value: 'needsReplacement', label: 'Needs Replacement' },
        { value: 'all', label: 'All Shoes' },
      ]}
      sortOptions={[
        { value: 'recent', label: 'Recently Updated' },
        { value: 'name', label: 'Name (A-Z)' },
        { value: 'brand', label: 'Brand' },
        { value: 'distance', label: 'Total Distance' },
        { value: 'lastUsed', label: 'Last Used' },
        { value: 'purchaseDate', label: 'Purchase Date' },
        { value: 'status', label: 'Status' },
      ]}
      onApplyFilters={filters => {
        setFilter(filters.status);
        setSortBy(filters.sortBy);
        setShowFilterModal(false);
      }}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>My Shoes</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterModal(true)}>
              <MaterialIcons name="filter-list" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddShoe')}
            >
              <MaterialIcons name="add" size={20} color={theme.colors.text.light} />
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
            value={formatDistance(stats.totalDistance).formatted} // Use formatDistance
            icon="directions-run"
            color={theme.colors.primary}
          />
          <StatsCard
            title="Total Runs"
            value={stats.totalRuns.toString()}
            icon="replay"
            color={theme.colors.secondary}
          />
          <StatsCard
            title="Shoes Active"
            value={stats.totalShoes.toString()}
            icon="check-circle-outline"
            color={theme.colors.success}
          />
          {stats.shoesNeedingReplacement > 0 && (
            <StatsCard
              title="Needs Replacement"
              value={stats.shoesNeedingReplacement.toString()}
              icon="warning-amber"
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
          {['all', 'active', 'retired', 'needsReplacement'].map(option => (
            <TouchableOpacity
              key={option}
              style={[styles.filterChip, filter === option && styles.filterChipActive]}
              onPress={() => setFilter(option)}
            >
              <Text
                style={[styles.filterChipText, filter === option && styles.filterChipTextActive]}
              >
                {option === 'all'
                  ? 'All Shoes'
                  : option === 'active'
                    ? 'Active'
                    : option === 'retired'
                      ? 'Retired'
                      : 'Needs Replacement'}
              </Text>
              {filter === option && (
                <MaterialIcons name="close" size={16} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Shoe List */}
        <FlatList
          data={filteredShoes}
          renderItem={renderShoeItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.flexGrow1}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ItemSeparatorComponent={renderSeparator}
        />
      </View>

      {renderFilterModal()}
    </View>
  );
};

ShoeListScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    setOptions: PropTypes.func.isRequired,
  }).isRequired,
};

export default ShoeListScreen;
