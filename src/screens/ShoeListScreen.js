import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

// Temporary mock data
const mockShoes = [
  { id: '1', name: 'Nike Pegasus 40', distance: '256 km', remaining: '244 km' },
  { id: '2', name: 'Hoka Clifton 9', distance: '89 km', remaining: '411 km' },
  { id: '3', name: 'Adidas Ultraboost', distance: '512 km', remaining: '0 km' },
];

const ShoeListScreen = () => {
  const theme = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
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
    addButton: {
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
    },
    addButtonText: {
      ...theme.typography.body,
      color: theme.colors.text.light,
      fontWeight: '600',
    },
    shoeItem: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.sm,
    },
    shoeName: {
      ...theme.typography.h3,
      marginBottom: theme.spacing.xs,
    },
    shoeDetails: {
      ...theme.typography.caption,
      color: theme.colors.text.secondary,
    },
    retired: {
      color: theme.colors.error,
      fontWeight: '600',
      marginTop: theme.spacing.xs,
    },
  });

  const renderShoeItem = ({ item }) => (
    <View style={styles.shoeItem}>
      <Text style={styles.shoeName}>{item.name}</Text>
      <Text style={styles.shoeDetails}>
        Distance: {item.distance} • Remaining: {item.remaining}
      </Text>
      {item.remaining === '0 km' && (
        <Text style={styles.retired}>Retired</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Shoes</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>Add Shoe</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={mockShoes}
        renderItem={renderShoeItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: theme.spacing.lg }}
      />
    </View>
  );
};

export default ShoeListScreen;
