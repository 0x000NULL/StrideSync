import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Button from '../components/ui/Button';
import { useTheme } from '../theme/ThemeProvider';
import { useStore } from '../stores/useStore'; // Added

const AddShoeScreen = () => {
  const navigation = useNavigation();
  const theme = useTheme();
  const addShoe = useStore(state => state.addShoe); // Added

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [maxDistance, setMaxDistance] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Shoe name is required.');
      return;
    }
    // Consider adding validation for purchaseDate format if necessary
    if (maxDistance && (isNaN(parseFloat(maxDistance)) || parseFloat(maxDistance) < 0)) {
      Alert.alert('Validation Error', 'Max distance must be a valid positive number.');
      return;
    }

    const shoeData = {
      name: name.trim(),
      brand: brand.trim(),
      model: model.trim(),
      purchaseDate, // Ensure this is in ISOString format if the store expects that
      maxDistance: maxDistance ? parseFloat(maxDistance) : 0,
      // isActive: true, // The addShoe function in shoeStore already defaults this
      // createdAt: new Date().toISOString(), // Store handles this
      // updatedAt: new Date().toISOString(), // Store handles this
    };

    try {
      addShoe(shoeData);
      // Alert.alert('Success', 'Shoe added successfully!'); // Optional: show success message
      navigation.goBack(); // Navigate back to the previous screen (likely ShoeListScreen)
    } catch (error) {
      console.error('Failed to save shoe:', error);
      Alert.alert('Error', 'Failed to save shoe. Please try again.');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flexGrow: 1,
    },
    content: {
      padding: theme.spacing.md,
    },
    title: {
      ...(theme.typography.h2 || { fontSize: 22, fontWeight: 'bold' }),
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.lg,
      textAlign: 'center',
    },
    input: {
      backgroundColor: theme.colors.surface || theme.colors.card,
      color: theme.colors.text.primary,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md || 8,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      fontSize: 16,
    },
    label: {
      ...(theme.typography.label || { fontSize: 14, fontWeight: '600' }),
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.xs,
    },
    buttonContainer: {
      marginTop: theme.spacing.lg,
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    flex1: {
      // Added style for flex: 1
      flex: 1,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Add New Shoe</Text>

          <Text style={styles.label}>Name*</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Pegasus 40, Clifton 9"
            value={name}
            onChangeText={setName}
            placeholderTextColor={theme.colors.text.hint || '#999999'}
          />

          <Text style={styles.label}>Brand</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Nike, Hoka"
            value={brand}
            onChangeText={setBrand}
            placeholderTextColor={theme.colors.text.hint || '#999999'}
          />

          <Text style={styles.label}>Model</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Pegasus, Clifton"
            value={model}
            onChangeText={setModel}
            placeholderTextColor={theme.colors.text.hint || '#999999'}
          />

          <Text style={styles.label}>Purchase Date</Text>
          <TextInput
            style={styles.input}
            value={purchaseDate}
            onChangeText={setPurchaseDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={theme.colors.text.hint || '#999999'}
          />

          <Text style={styles.label}>Max Distance (km)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 800"
            value={maxDistance}
            onChangeText={setMaxDistance}
            keyboardType="numeric"
            placeholderTextColor={theme.colors.text.hint || '#999999'}
          />

          <View style={styles.buttonContainer}>
            <Button
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="outline"
              style={[styles.flex1, { marginRight: theme.spacing.sm || 8 }]}
            />
            <Button
              title="Save Shoe"
              onPress={handleSave}
              variant="primary"
              style={[styles.flex1, { marginLeft: theme.spacing.sm || 8 }]}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default AddShoeScreen;
