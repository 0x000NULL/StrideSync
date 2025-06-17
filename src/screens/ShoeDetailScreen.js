import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useStore } from '../stores/useStore';
import { format, parseISO } from 'date-fns';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import StatsCard from '../components/StatsCard';
import Button from "../components/ui/Button";

const ShoeDetailScreen = ({ route, navigation }) => {
  const { shoeId } = route.params;
  const theme = useTheme();
  const [retirementReason, setRetirementReason] = useState('');
  const [showRetirementForm, setShowRetirementForm] = useState(false);
  
  // Get shoe data and actions from store
  const shoe = useStore(useCallback(
    (state) => state.shoes.find((s) => s.id === shoeId),
    [shoeId]
  ));
  
  const stats = useStore(useCallback(
    (state) => state.getShoeStats(shoeId),
    [shoeId]
  ));
  
  const retireShoe = useStore((state) => state.retireShoe);
  const reactivateShoe = useStore((state) => state.reactivateShoe);
  const loadShoes = useStore((state) => state.loadShoes);

  // Load fresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadShoes();
    }, [loadShoes])
  );

  if (!shoe) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>
          Shoe not found
        </Text>
      </View>
    );
  }

  const handleRetire = () => {
    if (!retirementReason.trim()) {
      Alert.alert('Reason Required', 'Please provide a reason for retiring these shoes.');
      return;
    }
    
    retireShoe(shoeId, retirementReason);
    setShowRetirementForm(false);
    setRetirementReason('');
  };

  const handleReactivate = () => {
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
            backgroundColor: theme.colors.card
          }
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
          variant="primary"
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
        <Text style={[styles.name, { color: theme.colors.text }]}>{shoe.name}</Text>
        <Text style={[styles.brand, { color: theme.colors.textSecondary }]}>{shoe.brand}</Text>
        
        <View style={styles.statusBadge}>
          <View 
            style={[
              styles.statusDot, 
              { 
                backgroundColor: shoe.isActive 
                  ? theme.colors.success 
                  : theme.colors.secondary 
              }
            ]} 
          />
          <Text style={[styles.statusText, { color: theme.colors.text }]}>
            {shoe.isActive ? 'Active' : 'Retired'}
            {shoe.retirementDate && ` on ${format(parseISO(shoe.retirementDate), 'MMM d, yyyy')}`}
          </Text>
        </View>
        
        {shoe.retirementReason && (
          <View style={styles.retirementReason}>
            <Text style={[styles.reasonLabel, { color: theme.colors.textSecondary }]}>
              Reason:
            </Text>
            <Text style={[styles.reasonText, { color: theme.colors.text }]}>
              {shoe.retirementReason}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.statsContainer}>
        <StatsCard 
          title="Total Distance"
          value={`${(stats?.totalDistance || 0).toFixed(1)} km`}
          icon="directions-run"
        />
        <StatsCard 
          title="Runs"
          value={stats?.totalRuns || 0}
          icon="repeat"
        />
        {shoe.maxDistance > 0 && (
          <StatsCard 
            title="Remaining"
            value={`${Math.max(0, (shoe.maxDistance - (stats?.totalDistance || 0))).toFixed(1)} km`}
            subtitle={`of ${shoe.maxDistance} km`}
            icon="timeline"
          />
        )}
      </View>

      {!showRetirementForm && shoe.isActive && (
        <Button
          title="Retire Shoes"
          onPress={() => setShowRetirementForm(true)}
          variant="danger"
          icon="flag"
          style={styles.actionButton}
        />
      )}
      
      {!showRetirementForm && !shoe.isActive && (
        <Button
          title="Reactivate Shoes"
          onPress={handleReactivate}
          variant="primary"
          icon="refresh"
          style={styles.actionButton}
        />
      )}
      
      {showRetirementForm && renderRetirementForm()}
      
      {/* Add more shoe details and stats here */}
      <View style={styles.detailsSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Shoe Details
        </Text>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
            Purchase Date:
          </Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>
            {shoe.purchaseDate ? format(parseISO(shoe.purchaseDate), 'MMM d, yyyy') : 'Not set'}
          </Text>
        </View>
        {shoe.maxDistance > 0 && (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
              Max Distance:
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {shoe.maxDistance} km
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
    backgroundColor: 'rgba(0,0,0,0.1)',
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
    backgroundColor: 'rgba(0,0,0,0.05)',
    width: '100%',
  },
  reasonLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  actionButton: {
    marginBottom: 24,
  },
  retirementForm: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  detailsSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});

export default ShoeDetailScreen;
