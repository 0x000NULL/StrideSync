import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Button from '../components/ui/Button';
import { useTheme } from '../theme/ThemeProvider';
import { useStore } from '../stores/useStore';

const EditShoeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const getShoeById = useStore(state => state.getShoeById);
  const updateShoe = useStore(state => state.updateShoe);

  const shoeId = route.params?.shoeId;
  const currentShoe = getShoeById(shoeId);

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [maxDistance, setMaxDistance] = useState('');

  useEffect(() => {
    if (!currentShoe) {
      // Handle case where shoe is not found, though this should ideally not happen if navigation is correct
      Alert.alert('Error', 'Shoe not found. Returning to the previous screen.');
      navigation.goBack();
      return;
    }

    // Only update form fields if they do not already match the current shoe values.
    if (name !== currentShoe.name) setName(currentShoe.name);
    if (brand !== (currentShoe.brand || '')) setBrand(currentShoe.brand || '');
    if (model !== (currentShoe.model || '')) setModel(currentShoe.model || '');

    const purchaseDateValue = currentShoe.purchaseDate || new Date().toISOString().split('T')[0];
    if (purchaseDate !== purchaseDateValue) setPurchaseDate(purchaseDateValue);

    const maxDistanceValue = currentShoe.maxDistance ? String(currentShoe.maxDistance) : '';
    if (maxDistance !== maxDistanceValue) setMaxDistance(maxDistanceValue);
  }, [currentShoe, navigation]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Shoe name is required.');
      return;
    }
    if (maxDistance && (isNaN(parseFloat(maxDistance)) || parseFloat(maxDistance) < 0)) {
      Alert.alert('Validation Error', 'Max distance must be a valid positive number.');
      return;
    }

    const updatedData = {
      name: name.trim(),
      brand: brand.trim(),
      model: model.trim(),
      purchaseDate,
      maxDistance: maxDistance ? parseFloat(maxDistance) : 0,
    };

    try {
      updateShoe(shoeId, updatedData);
      navigation.goBack();
    } catch (error) {
      console.error('Failed to update shoe:', error);
      Alert.alert('Error', 'Failed to update shoe. Please try again.');
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
  });

  if (!currentShoe) {
    // Render loading state or null while shoe is being fetched or if not found
    // This also prevents rendering the form before data is ready
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading shoe data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Edit Shoe</Text>

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
              style={{ flex: 1, marginRight: theme.spacing.sm || 8 }}
            />
            <Button
              title="Save Changes"
              onPress={handleSave}
              variant="primary"
              style={{ flex: 1, marginLeft: theme.spacing.sm || 8 }}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default EditShoeScreen;
