import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useStore } from '../stores/useStore';
import { format, parseISO } from 'date-fns';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import StatsCard from '../components/StatsCard';
import Button from '../components/ui/Button';
import { useUnits } from '../hooks/useUnits'; // Import useUnits

const ShoeDetailScreen = ({ route, navigation }) => {
  const { shoeId } = route.params;
  const theme = useTheme();
  const { formatDistance } = useUnits(); // Call useUnits
  const [retirementReason, setRetirementReason] = useState('');
  const [showRetirementForm, setShowRetirementForm] = useState(false);

  // Get shoe data and actions from store
  // CHANGED: Use getShoeById, which should include shoe data and stats
  const shoeWithDetails = useStore(useCallback(state => state.getShoeById(shoeId), [shoeId]));

  // REMOVED: stats are now part of shoeWithDetails

  const retireShoe = useStore(state => state.retireShoe);
  const reactivateShoe = useStore(state => state.reactivateShoe);
  const loadShoes = useStore(state => state.loadShoes);

  // Load fresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadShoes(); // This ensures the store has the latest shoes, from which getShoeById will select
    }, [loadShoes])
  );

  // CHANGED: Check shoeWithDetails instead of shoe
  if (!shoeWithDetails) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>
          Shoe not found or still loading...
        </Text>
      </View>
    );
  }

  const handleRetire = () => {
    if (!retirementReason.trim()) {
      Alert.alert('Reason Required', 'Please provide a reason for retiring these shoes.');
      return;
    }
    // shoeId from route.params is fine
    retireShoe(shoeId, retirementReason);
    setShowRetirementForm(false);
    setRetirementReason('');
  };

  const handleReactivate = () => {
    // shoeId from route.params is fine
    reactivateShoe(shoeId);
  };

  const renderRetirementForm = () => (
    <View style={styles.retirementForm}>
      <Text style={[styles.label, { color: theme.colors.text }]}>
        Why are you retiring these shoes?
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            borderColor: theme.colors.border,
            color: theme.colors.text,
            backgroundColor: theme.colors.card,
          },
        ]}
        placeholder="E.g., Reached max mileage, worn out, etc."
        placeholderTextColor={theme.colors.textSecondary}
        value={retirementReason}
        onChangeText={setRetirementReason}
        multiline
        numberOfLines={3}
      />
      <View style={styles.buttonRow}>
        <Button
          title="Cancel"
          onPress={() => setShowRetirementForm(false)}
          variant="outline"
          style={styles.button}
        />
        <Button
          title="Confirm Retirement"
          onPress={handleRetire}
          variant="primary" // Assuming 'primary' is the main action color, 'danger' might be better
          style={styles.button}
        />
      </View>
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        {/* CHANGED: Use shoeWithDetails */}
        <Text style={[styles.name, { color: theme.colors.text }]}>{shoeWithDetails.name}</Text>
        <Text style={[styles.brand, { color: theme.colors.textSecondary }]}>
          {shoeWithDetails.brand}
        </Text>

        <View style={styles.statusBadge}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: shoeWithDetails.isActive
                  ? theme.colors.success
                  : theme.colors.secondary,
              },
            ]}
          />
          <Text style={[styles.statusText, { color: theme.colors.text }]}>
            {shoeWithDetails.isActive ? 'Active' : 'Retired'}
            {shoeWithDetails.retirementDate &&
              ` on ${format(parseISO(shoeWithDetails.retirementDate), 'MMM d, yyyy')}`}
          </Text>
        </View>

        {shoeWithDetails.retirementReason && (
          <View style={styles.retirementReason}>
            <Text style={[styles.reasonLabel, { color: theme.colors.textSecondary }]}>Reason:</Text>
            <Text style={[styles.reasonText, { color: theme.colors.text }]}>
              {shoeWithDetails.retirementReason}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.statsContainer}>
        {/* CHANGED: Access stats properties directly from shoeWithDetails */}
        <StatsCard
          title="Total Distance"
          value={formatDistance(shoeWithDetails.totalDistance || 0).formatted}
          icon="directions-run"
        />
        <StatsCard title="Runs" value={shoeWithDetails.totalRuns || 0} icon="repeat" />
        {/* Ensure maxDistance is on shoeWithDetails */}
        {shoeWithDetails.maxDistance > 0 &&
          (() => {
            const remainingDistance = Math.max(
              0,
              shoeWithDetails.maxDistance - (shoeWithDetails.totalDistance || 0)
            );
            return (
              <StatsCard
                title="Remaining"
                value={formatDistance(remainingDistance).formatted}
                subtitle={`of ${formatDistance(shoeWithDetails.maxDistance).formatted}`}
                icon="timeline"
              />
            );
          })()}
      </View>

      {/* Logic using shoeWithDetails.isActive */}
      {!showRetirementForm && shoeWithDetails.isActive && (
        <>
          {/* Edit Button */}
          <Button
            title="Edit Shoe Details"
            onPress={() => navigation.navigate('EditShoe', { shoeId: shoeWithDetails.id })}
            variant="outline" // Or choose another appropriate variant
            icon="edit" // Using MaterialIcons name
            style={styles.actionButton}
          />
          {/* Retire Button */}
          <Button
            title="Retire Shoes"
            onPress={() => setShowRetirementForm(true)}
            variant="danger"
            icon="flag"
            style={styles.actionButton}
          />
        </>
      )}

      {/* This is the reactivate button, should be outside the isActive block */}
      {!showRetirementForm && !shoeWithDetails.isActive && (
        <Button
          title="Reactivate Shoes"
          onPress={handleReactivate}
          variant="primary"
          icon="refresh"
          style={styles.actionButton}
        />
      )}

      {showRetirementForm && renderRetirementForm()}

      <View style={styles.detailsSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Shoe Details</Text>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
            Purchase Date:
          </Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>
            {shoeWithDetails.purchaseDate
              ? format(parseISO(shoeWithDetails.purchaseDate), 'MMM d, yyyy')
              : 'Not set'}
          </Text>
        </View>
        {shoeWithDetails.maxDistance > 0 && (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
              Max Distance:
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {formatDistance(shoeWithDetails.maxDistance).formatted}
            </Text>
          </View>
        )}
        {/* You can add more details here if they are part of shoeWithDetails */}
        {/* For example, model if it's a separate field */}
        {shoeWithDetails.model && (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Model:</Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {shoeWithDetails.model}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  brand: {
    fontSize: 18,
    marginBottom: 12,
    textAlign: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.1)', // Consider theme.colors.surface or similar
    marginBottom: 12,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  retirementReason: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)', // Consider theme.colors.surface or similar
    width: '100%',
  },
  reasonLabel: {
    fontSize: 12,
    // color: theme.colors.textSecondary, // Already applied inline
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 14,
    fontStyle: 'italic',
    // color: theme.colors.text, // Already applied inline
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Changed from space-between for better spacing with 3 cards
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  actionButton: {
    marginBottom: 24,
  },
  retirementForm: {
    marginBottom: 24,
    padding: 16, // Added padding
    borderRadius: 8, // Added borderRadius
    // backgroundColor: theme.colors.card, // Consider adding a background
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    // color: theme.colors.text, // Applied inline
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12, // Fine-tuned padding
    paddingVertical: 10, // Fine-tuned padding
    marginBottom: 16, // Increased margin
    fontSize: 16,
    textAlignVertical: 'top',
    // borderColor, color, backgroundColor applied inline
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Changed from space-between
  },
  button: {
    flex: 1, // Each button takes equal space
    marginHorizontal: 8, // Added horizontal margin between buttons
  },
  detailsSection: {
    marginTop: 16,
    padding: 16, // Added padding
    borderRadius: 8, // Added borderRadius
    // backgroundColor: theme.colors.card, // Consider adding a background
  },
  sectionTitle: {
    fontSize: 20, // Increased size
    fontWeight: 'bold',
    marginBottom: 16, // Increased margin
    paddingBottom: 10, // Increased padding
    borderBottomWidth: 1,
    // borderBottomColor: theme.colors.border, // Use theme border color
    // color: theme.colors.text, // Applied inline
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10, // Increased margin
    paddingVertical: 4, // Added vertical padding for spacing
  },
  detailLabel: {
    fontSize: 15, // Increased size
    // color: theme.colors.textSecondary, // Applied inline
  },
  detailValue: {
    fontSize: 15, // Increased size
    fontWeight: '500',
    // color: theme.colors.text, // Applied inline
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    // color: theme.colors.text, // Applied inline
  },
});

export default ShoeDetailScreen;
