import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Platform,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
import { useTheme } from '../theme/ThemeProvider';
import { format, subDays, subMonths, subYears, parseISO } from 'date-fns';
import { useRunStore } from '../stores/useStore';
import { useShoeStore } from '../stores/useStore';
import { Ionicons } from '@expo/vector-icons';

// Date range options
const DATE_RANGES = [
  { id: 'all', label: 'All Time' },
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'year', label: 'This Year' },
  { id: 'custom', label: 'Custom Range' },
];

// Sort options
const SORT_OPTIONS = [
  { id: 'date-desc', label: 'Date (Newest First)' },
  { id: 'date-asc', label: 'Date (Oldest First)' },
  { id: 'distance-desc', label: 'Distance (Longest First)' },
  { id: 'distance-asc', label: 'Distance (Shortest First)' },
  { id: 'duration-desc', label: 'Duration (Longest First)' },
  { id: 'duration-asc', label: 'Duration (Shortest First)' },
];

const RunLogScreen = ({ navigation }) => {
  const theme = useTheme();

  // Get data from stores
  const { runs, isLoading, error, loadRuns, getFilteredRuns, deleteRun } = useRunStore();
  const { shoes, getShoeById } = useShoeStore();

  // State
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshY] = useState(new Animated.Value(0));
  const [refreshScale] = useState(new Animated.Value(1));
  const [refreshRotation] = useState(new Animated.Value(0));
  const [initialLoadError, setInitialLoadError] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    minDistance: '',
    maxDistance: '',
    shoeId: null,
    searchQuery: '',
  });
  const [sortBy, setSortBy] = useState('date-desc');

  // Search input ref for focus management
  const searchInputRef = useRef(null);

  // Count active filters (excluding search query from count)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.dateRange !== 'all') count++;
    if (filters.minDistance) count++;
    if (filters.maxDistance) count++;
    if (filters.shoeId) count++;
    return count;
  }, [filters]);

  // Filter runs based on search query
  const filteredRuns = useMemo(() => {
    if (!filters.searchQuery) return getFilteredRuns(filters);

    const query = filters.searchQuery.toLowerCase();
    return getFilteredRuns(filters).filter(run => {
      // Search in notes
      if (run.notes && run.notes.toLowerCase().includes(query)) return true;

      // Search in location
      if (run.location && run.location.toLowerCase().includes(query)) return true;

      // Search in shoe name
      if (run.shoeId) {
        const shoe = getShoeById(run.shoeId);
        if (shoe && shoe.name.toLowerCase().includes(query)) return true;
      }

      // Search in formatted date
      const formattedDate = format(new Date(run.startTime), 'MMMM d, yyyy');
      if (formattedDate.toLowerCase().includes(query)) return true;

      return false;
    });
  }, [filters, getFilteredRuns, getShoeById]);

  // Load runs on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = useCallback(async () => {
    try {
      setInitialLoadError(false);
      await loadRuns();
    } catch (err) {
      console.error('Failed to load runs:', err);
      setInitialLoadError(true);
    }
  }, [loadRuns]);

  // Animate the refresh icon rotation
  const spinIcon = useCallback(() => {
    refreshRotation.setValue(0);
    Animated.loop(
      Animated.timing(refreshRotation, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [refreshRotation]);

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    if (refreshing) return; // Prevent multiple refreshes

    setRefreshing(true);
    spinIcon();

    try {
      // Show a brief loading indicator even if the request is fast
      const refreshPromise = loadRuns();
      const timeoutPromise = new Promise(resolve => setTimeout(resolve, 1000));

      await Promise.all([refreshPromise, timeoutPromise]);

      // Show a success message briefly
      const success = true;
      if (success) {
        // In a real app, you might want to show a toast or notification here
        console.log('Runs refreshed successfully');
      }
    } catch (err) {
      console.error('Failed to refresh runs:', err);
      // In a real app, you might want to show an error toast here
    } finally {
      // Stop the rotation animation
      Animated.timing(refreshRotation).stop();
      setRefreshing(false);
    }
  }, [loadRuns, refreshing, spinIcon, refreshRotation]);

  // Custom refresh control component
  const CustomRefreshControl = useCallback(
    ({ refreshing, onRefresh, ...props }) => {
      const spin = refreshRotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
      });

      return (
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
          progressViewOffset={Platform.OS === 'android' ? 20 : 0}
          progressBackgroundColor={theme.colors.background}
          title={refreshing ? 'Refreshing...' : 'Pull to refresh'}
          titleColor={theme.colors.text.secondary}
          {...props}
        >
          <Animated.View
            style={[
              {
                transform: [{ rotate: spin }],
                alignSelf: 'center',
                marginVertical: 8,
              },
            ]}
          >
            <Ionicons name="refresh" size={24} color={theme.colors.primary} />
          </Animated.View>
        </RefreshControl>
      );
    },
    [refreshRotation, theme.colors]
  );

  // Apply filters and sorting
  const filterOptions = {
    dateRange: filters.dateRange,
    minDistance: filters.minDistance ? parseFloat(filters.minDistance) : undefined,
    maxDistance: filters.maxDistance ? parseFloat(filters.maxDistance) : undefined,
    shoeId: filters.shoeId,
  };

  const sortOptions = {
    field: sortBy.split('-')[0],
    order: sortBy.split('-')[1],
  };

  const displayedRuns = useMemo(() => {
    return filteredRuns;
  }, [filteredRuns]);

  // Format run data for display
  const formatRunItem = run => {
    const runDate = parseISO(run.startTime);
    const shoe = run.shoeId ? getShoeById(run.shoeId) : null;

    return {
      ...run,
      formattedDate: format(runDate, 'MMM d, yyyy'),
      formattedTime: format(runDate, 'h:mm a'),
      formattedDistance: `${run.distance.toFixed(2)} km`,
      formattedPace: run.pace
        ? `${run.pace.minutes}:${run.pace.seconds.toString().padStart(2, '0')} min/km`
        : '--:--',
      shoeName: shoe?.name || 'No Shoe',
      onPress: () => navigation.navigate('RunDetails', { runId: run.id }),
    };
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      margin: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    searchInput: {
      flex: 1,
      height: 48,
      color: theme.colors.text.primary,
      padding: theme.spacing.sm,
      ...theme.typography.body,
    },
    searchIcon: {
      marginRight: theme.spacing.sm,
    },
    clearButton: {
      padding: theme.spacing.xs,
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
    filterButton: {
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.surface,
    },
    runItem: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.sm,
    },
    runHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xs,
    },
    runDate: {
      ...theme.typography.subtitle1,
      color: theme.colors.text.primary,
      fontWeight: '600',
    },
    runTime: {
      ...theme.typography.body2,
      color: theme.colors.text.secondary,
    },
    runDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.sm,
    },
    detailItem: {
      alignItems: 'center',
    },
    detailLabel: {
      ...theme.typography.caption,
      color: theme.colors.text.secondary,
      marginBottom: 2,
    },
    detailValue: {
      ...theme.typography.body2,
      color: theme.colors.text.primary,
    },
    shoeTag: {
      ...theme.typography.caption,
      color: theme.colors.primary,
      marginTop: theme.spacing.xs,
      fontStyle: 'italic',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    emptyText: {
      ...theme.typography.body,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    // Skeleton styles
    skeleton: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      overflow: 'hidden',
    },
    skeletonHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xs,
    },
    skeletonDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.sm,
    },
    skeletonDetailItem: {
      alignItems: 'center',
      flex: 1,
    },
    skeletonText: {
      height: 16,
      backgroundColor: theme.colors.background,
      borderRadius: 4,
      marginBottom: 2,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    loadingText: {
      ...theme.typography.body,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.md,
      textAlign: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    errorText: {
      ...theme.typography.body,
      color: theme.colors.error,
      marginBottom: theme.spacing.md,
      textAlign: 'center',
    },
    retryButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      marginTop: theme.spacing.md,
    },
    retryButtonText: {
      ...theme.typography.button,
      color: theme.colors.onPrimary,
    },
    // Badge for active filters
    badge: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: theme.colors.error,
      borderRadius: 9,
      width: 18,
      height: 18,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: theme.colors.background,
    },
    badgeText: {
      color: theme.colors.onError,
      fontSize: 10,
      fontWeight: 'bold',
    },
    // Active filter indicator
    activeFilterPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primaryLight,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginRight: 8,
      marginBottom: 8,
    },
    activeFilterText: {
      ...theme.typography.caption,
      color: theme.colors.primary,
      marginRight: 4,
    },
    activeFiltersContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: theme.spacing.sm,
      alignItems: 'center',
    },
    clearAllButton: {
      ...theme.typography.caption,
      color: theme.colors.primary,
      fontWeight: '500',
      marginBottom: 8,
    },
    // Filter Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: theme.spacing.lg,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    modalTitle: {
      ...theme.typography.h3,
      color: theme.colors.text.primary,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    sectionTitle: {
      ...theme.typography.subtitle2,
      color: theme.colors.text.primary,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
    },
    option: {
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      marginBottom: theme.spacing.xs,
      backgroundColor: theme.colors.surface,
    },
    optionSelected: {
      backgroundColor: theme.colors.primaryLight,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.primary,
    },
    optionText: {
      ...theme.typography.body,
      color: theme.colors.text.primary,
    },
    optionTextSelected: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    input: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.sm,
      padding: theme.spacing.sm,
      ...theme.typography.body,
      color: theme.colors.text.primary,
    },
    inputSuffix: {
      ...theme.typography.body,
      color: theme.colors.text.secondary,
      marginLeft: theme.spacing.sm,
    },
    applyButton: {
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.sm,
      alignItems: 'center',
      marginTop: theme.spacing.lg,
    },
    applyButtonText: {
      ...theme.typography.button,
      color: theme.colors.onPrimary,
    },
  });

  // Skeleton loader component
  const SkeletonLoader = useCallback(
    ({ style }) => (
      <View style={[styles.skeleton, style]}>
        <View style={styles.skeletonHeader}>
          <View style={[styles.skeletonText, { width: '40%' }]} />
          <View style={[styles.skeletonText, { width: '20%' }]} />
        </View>
        <View style={styles.skeletonDetails}>
          {[1, 2, 3].map(i => (
            <View key={i} style={styles.skeletonDetailItem}>
              <View style={[styles.skeletonText, { width: '70%' }]} />
              <View style={[styles.skeletonText, { width: '60%', marginTop: 4 }]} />
            </View>
          ))}
        </View>
        <View style={[styles.skeletonText, { width: '50%', marginTop: 8 }]} />
      </View>
    ),
    []
  );

  const renderRunItem = ({ item }) => {
    const run = formatRunItem(item);

    return (
      <TouchableOpacity
        style={styles.runItem}
        onPress={() => navigation.navigate('RunDetails', { runId: item.id })}
      >
        <View style={styles.runHeader}>
          <Text style={styles.runDate}>{run.formattedDate}</Text>
          <Text style={styles.runTime}>{run.formattedTime}</Text>
        </View>

        <View style={styles.runDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Distance</Text>
            <Text style={styles.detailValue}>{run.formattedDistance}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Duration</Text>
            <Text style={styles.detailValue}>{formatDuration(run.duration)}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Pace</Text>
            <Text style={styles.detailValue}>{run.formattedPace}</Text>
          </View>
        </View>

        {run.shoeName && (
          <Text style={styles.shoeTag}>
            <Ionicons name="footsteps" size={12} color={theme.colors.primary} /> {run.shoeName}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  // Format duration in seconds to HH:MM:SS
  const formatDuration = seconds => {
    if (!seconds) return '0:00';

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters(prev => ({
      ...prev,
      dateRange: 'all',
      minDistance: '',
      maxDistance: '',
      shoeId: null,
    }));
  };

  // Clear search query
  const clearSearch = () => {
    setFilters(prev => ({
      ...prev,
      searchQuery: '',
    }));
  };

  // Apply the current filters
  const applyFilters = () => {
    // The actual filtering is handled by the selector when filteredRuns is computed
    setShowFilters(false);
  };

  // Render filter modal
  const renderFilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showFilters}
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: Platform.OS === 'ios' ? '80%' : '90%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter & Sort</Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView>
            <Text style={styles.sectionTitle}>Date Range</Text>
            {DATE_RANGES.map(range => (
              <TouchableOpacity
                key={range.id}
                style={[styles.option, filters.dateRange === range.id && styles.optionSelected]}
                onPress={() => setFilters({ ...filters, dateRange: range.id })}
              >
                <Text
                  style={[
                    styles.optionText,
                    filters.dateRange === range.id && styles.optionTextSelected,
                  ]}
                >
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}

            <Text style={styles.sectionTitle}>Distance (km)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Min distance"
                placeholderTextColor={theme.colors.text.secondary}
                value={filters.minDistance}
                onChangeText={text => {
                  // Only allow numbers and decimal points
                  if (text === '' || /^\d*\.?\d*$/.test(text)) {
                    setFilters({ ...filters, minDistance: text });
                  }
                }}
                keyboardType="numeric"
                returnKeyType="done"
              />
              <Text style={styles.inputSuffix}>km</Text>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Max distance"
                placeholderTextColor={theme.colors.text.secondary}
                value={filters.maxDistance}
                onChangeText={text => {
                  // Only allow numbers and decimal points
                  if (text === '' || /^\d*\.?\d*$/.test(text)) {
                    setFilters({ ...filters, maxDistance: text });
                  }
                }}
                keyboardType="numeric"
                returnKeyType="done"
              />
              <Text style={styles.inputSuffix}>km</Text>
            </View>

            {activeShoes.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Shoe</Text>
                <View style={[styles.option, filters.shoeId === null && styles.optionSelected]}>
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() => setFilters({ ...filters, shoeId: null })}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        filters.shoeId === null && styles.optionTextSelected,
                      ]}
                    >
                      All Shoes
                    </Text>
                  </TouchableOpacity>
                </View>
                {activeShoes.map(shoe => (
                  <View
                    key={shoe.id}
                    style={[styles.option, filters.shoeId === shoe.id && styles.optionSelected]}
                  >
                    <TouchableOpacity
                      style={{ flex: 1 }}
                      onPress={() => setFilters({ ...filters, shoeId: shoe.id })}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          filters.shoeId === shoe.id && styles.optionTextSelected,
                        ]}
                      >
                        {shoe.name}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            )}

            <Text style={styles.sectionTitle}>Sort By</Text>
            {SORT_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.id}
                style={[styles.option, sortBy === option.id && styles.optionSelected]}
                onPress={() => setSortBy(option.id)}
              >
                <Text
                  style={[styles.optionText, sortBy === option.id && styles.optionTextSelected]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                style={[
                  styles.applyButton,
                  {
                    backgroundColor: theme.colors.surface,
                    marginRight: theme.spacing.sm,
                    flex: 1,
                  },
                ]}
                onPress={resetFilters}
              >
                <Text style={[styles.applyButtonText, { color: theme.colors.primary }]}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.applyButton, { flex: 2 }]} onPress={applyFilters}>
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Show skeleton loaders during initial load
  if (isLoading && !refreshing && runs.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Run Log</Text>
          <View style={styles.filterButton}>
            <Ionicons name="filter" size={24} color={theme.colors.disabled} />
          </View>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: theme.spacing.lg }}
        >
          {[1, 2, 3, 4, 5].map(i => (
            <SkeletonLoader key={i} style={{ opacity: 1 - i * 0.1 }} />
          ))}
        </ScrollView>
      </View>
    );
  }

  // Show error state if initial load fails
  if (initialLoadError) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons
          name="sad-outline"
          size={48}
          color={theme.colors.error}
          style={{ marginBottom: theme.spacing.md }}
        />
        <Text
          style={[styles.errorText, { ...theme.typography.h3, marginBottom: theme.spacing.sm }]}
        >
          Oops! Something went wrong
        </Text>
        <Text style={[styles.errorText, { marginBottom: theme.spacing.lg }]}>
          We couldn't load your runs. Please check your connection and try again.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadInitialData}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show error state for other errors
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons
          name="warning"
          size={48}
          color={theme.colors.error}
          style={{ marginBottom: theme.spacing.md }}
        />
        <Text
          style={[styles.errorText, { ...theme.typography.h3, marginBottom: theme.spacing.sm }]}
        >
          Something went wrong
        </Text>
        <Text style={[styles.errorText, { marginBottom: theme.spacing.lg }]}>
          {typeof error === 'string' ? error : 'An unexpected error occurred'}
        </Text>
        <TouchableOpacity
          style={[
            styles.retryButton,
            {
              backgroundColor: theme.colors.surface,
              borderWidth: 1,
              borderColor: theme.colors.primary,
            },
          ]}
          onPress={loadInitialData}
        >
          <Text style={[styles.retryButtonText, { color: theme.colors.primary }]}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Run Log</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              style={[styles.filterButton, { marginRight: theme.spacing.sm }]}
              onPress={() => searchInputRef.current.focus()}
            >
              <Ionicons
                name="search"
                size={24}
                color={filters.searchQuery ? theme.colors.primary : theme.colors.text.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(true)}>
              <Ionicons
                name="filter"
                size={24}
                color={activeFilterCount > 0 ? theme.colors.primary : theme.colors.text.primary}
              />
              {activeFilterCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{activeFilterCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={theme.colors.text.secondary}
            style={styles.searchIcon}
          />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search runs..."
            placeholderTextColor={theme.colors.text.secondary}
            value={filters.searchQuery}
            onChangeText={text => setFilters(prev => ({ ...prev, searchQuery: text }))}
            clearButtonMode="while-editing"
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {filters.searchQuery ? (
            <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Active filters bar */}
        {(activeFilterCount > 0 || filters.searchQuery) && (
          <View style={styles.activeFiltersContainer}>
            {filters.searchQuery && (
              <View style={styles.activeFilterPill}>
                <Text style={styles.activeFilterText} numberOfLines={1}>
                  Search: {filters.searchQuery}
                </Text>
                <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
                  <Ionicons name="close" size={14} color={theme.colors.text.primary} />
                </TouchableOpacity>
              </View>
            )}

            {filters.dateRange !== 'all' && (
              <View style={styles.activeFilterPill}>
                <Text style={styles.activeFilterText}>
                  {DATE_RANGES.find(r => r.id === filters.dateRange)?.label || 'Custom'}
                </Text>
                <TouchableOpacity onPress={() => setFilters({ ...filters, dateRange: 'all' })}>
                  <Ionicons name="close" size={16} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            )}

            {filters.minDistance && (
              <View style={styles.activeFilterPill}>
                <Text style={styles.activeFilterText}>≥{filters.minDistance}km</Text>
                <TouchableOpacity onPress={() => setFilters({ ...filters, minDistance: '' })}>
                  <Ionicons name="close" size={16} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            )}

            {filters.maxDistance && (
              <View style={styles.activeFilterPill}>
                <Text style={styles.activeFilterText}>≤{filters.maxDistance}km</Text>
                <TouchableOpacity onPress={() => setFilters({ ...filters, maxDistance: '' })}>
                  <Ionicons name="close" size={16} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            )}

            {filters.shoeId && (
              <View style={styles.activeFilterPill}>
                <Text style={styles.activeFilterText}>
                  {getShoeById(filters.shoeId)?.name || 'Shoe'}
                </Text>
                <TouchableOpacity onPress={() => setFilters({ ...filters, shoeId: null })}>
                  <Ionicons name="close" size={16} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={{ marginLeft: 'auto' }} onPress={resetFilters}>
              <Text style={styles.clearAllButton}>Clear All</Text>
            </TouchableOpacity>
          </View>
        )}

        {filteredRuns.length > 0 ? (
          <FlatList
            data={filteredRuns}
            renderItem={renderRunItem}
            keyExtractor={item => item.id}
            refreshControl={<CustomRefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            contentContainerStyle={{ paddingBottom: theme.spacing.lg }}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="footsteps"
              size={64}
              color={theme.colors.text.secondary}
              style={{ marginBottom: 16, opacity: 0.5 }}
            />
            <Text style={styles.emptyText}>No runs recorded yet.</Text>
            <Text style={styles.emptyText}>Start your first run to see it here!</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('NewRun')}
              style={[styles.applyButton, { marginTop: 24 }]}
            >
              <Text style={styles.applyButtonText}>Start a Run</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {renderFilterModal()}
    </View>
  );
};

export default RunLogScreen;
