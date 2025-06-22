import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react'; // Added useCallback, useLayoutEffect
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useStore } from '../stores/useStore';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import Button from '../components/ui/Button';
import DatePicker from 'react-native-date-picker';

const AddEditShoeScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { shoeId } = route.params || {};

  const isEditMode = !!shoeId;

  const addShoe = useStore(state => state.addShoe);
  const updateShoe = useStore(state => state.updateShoe);
  const getShoeById = useStore(state => state.getShoeById);

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    purchaseDate: new Date().toISOString(),
    initialDistance: '0',
    maxDistance: '800',
    notes: '',
    imageUri: null,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const shoe = getShoeById(shoeId);
      if (shoe) {
        setFormData({
          name: shoe.name || '',
          brand: shoe.brand || '',
          model: shoe.model || '',
          purchaseDate: shoe.purchaseDate || new Date().toISOString(),
          initialDistance: String(shoe.initialDistance || 0),
          maxDistance: String(shoe.maxDistance || 800),
          notes: shoe.notes || '',
          imageUri: shoe.imageUri || null,
        });
      }
    }
  }, [isEditMode, shoeId, getShoeById]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Shoe name is required';
    }
    if (formData.initialDistance && isNaN(Number(formData.initialDistance))) {
      newErrors.initialDistance = 'Must be a valid number';
    }
    if (formData.maxDistance && isNaN(Number(formData.maxDistance))) {
      newErrors.maxDistance = 'Must be a valid number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      return;
    }
    try {
      setIsLoading(true);
      const shoeData = {
        ...formData,
        initialDistance: parseFloat(formData.initialDistance) || 0,
        maxDistance: parseFloat(formData.maxDistance) || 0,
      };
      if (isEditMode) {
        await updateShoe(shoeId, shoeData);
      } else {
        await addShoe(shoeData);
      }
      navigation.goBack();
    } catch (error) {
      console.error('Error saving shoe:', error);
      Alert.alert('Error', 'Failed to save shoe. Please try again.', [{ text: 'OK' }]);
    } finally {
      setIsLoading(false);
    }
  }, [validateForm, setIsLoading, formData, isEditMode, shoeId, updateShoe, addShoe, navigation]);

  // styles object needs to be defined before being used in headerRightCallback
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollViewContent: {
      padding: 16, // Consider theme.spacing.md
      paddingBottom: 40, // Consider theme.spacing.xl
    },
    headerButton: {
      marginRight: 16, // Consider theme.spacing.md
      padding: 8, // Consider theme.spacing.sm
    },
    headerButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    formGroup: {
      marginBottom: 16, // Consider theme.spacing.md
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 6, // Consider theme.spacing.xs
    },
    input: {
      borderWidth: 1,
      borderRadius: 8, // Consider theme.borderRadius.md
      padding: 12, // Consider theme.spacing.md
      fontSize: 16,
    },
    inputMultiline: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    dateInput: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderRadius: 8, // Consider theme.borderRadius.md
      padding: 12, // Consider theme.spacing.md
    },
    dateText: {
      fontSize: 16,
    },
    errorText: {
      fontSize: 12,
      marginTop: 4, // Consider theme.spacing.xs
    },
    saveButton: {
      marginTop: 24, // Consider theme.spacing.lg
    },
  });

  // Memoized headerRight component function
  const headerRightCallback = useCallback(() => {
    return (
      <TouchableOpacity onPress={handleSave} disabled={isLoading} style={styles.headerButton}>
        <Text style={[styles.headerButtonText, { color: theme.colors.primary }]}>
          {isLoading ? 'Saving...' : 'Save'}
        </Text>
      </TouchableOpacity>
    );
  }, [handleSave, isLoading, theme.colors.primary, styles.headerButton, styles.headerButtonText]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditMode ? 'Edit Shoe' : 'Add New Shoe',
      headerRight: headerRightCallback,
    });
  }, [navigation, isEditMode, headerRightCallback, handleSave, theme.colors.primary]); // Added handleSave and theme.colors.primary

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const renderFormField = (
    field,
    label,
    placeholder,
    keyboardType = 'default',
    multiline = false
  ) => (
    <View style={styles.formGroup}>
      <Text style={[styles.label, { color: theme.colors.text.primary }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          {
            borderColor: errors[field] ? theme.colors.error : theme.colors.border,
            color: theme.colors.text.primary,
            backgroundColor: theme.colors.card,
          },
          multiline && styles.inputMultiline,
        ]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.secondary}
        value={formData[field]}
        onChangeText={text => handleChange(field, text)}
        keyboardType={keyboardType}
        multiline={multiline}
      />
      {errors[field] && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>{errors[field]}</Text>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        {renderFormField('name', 'Shoe Name', 'e.g., Nike Pegasus 39', 'default')}
        {renderFormField('brand', 'Brand', 'e.g., Nike, Adidas')}
        {renderFormField('model', 'Model', 'e.g., Pegasus 39')}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.colors.text.primary }]}>Purchase Date</Text>
          <TouchableOpacity
            style={[
              styles.dateInput,
              {
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.card,
              },
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[styles.dateText, { color: theme.colors.text.primary }]}>
              {new Date(formData.purchaseDate).toLocaleDateString()}
            </Text>
            <MaterialIcons name="calendar-today" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        {renderFormField('initialDistance', 'Initial Distance (km)', '0', 'decimal-pad')}
        {renderFormField('maxDistance', 'Maximum Distance (km)', '800', 'decimal-pad')}
        {renderFormField(
          'notes',
          'Notes',
          'Any additional notes about these shoes...',
          'default',
          true
        )}
        <Button
          title={isEditMode ? 'Update Shoe' : 'Add Shoe'}
          onPress={handleSave}
          variant="primary"
          loading={isLoading}
          style={styles.saveButton}
        />
      </ScrollView>
      <DatePicker
        modal
        open={showDatePicker}
        date={new Date(formData.purchaseDate)}
        mode="date"
        onConfirm={date => {
          handleChange('purchaseDate', date.toISOString());
          setShowDatePicker(false);
        }}
        onCancel={() => setShowDatePicker(false)}
      />
    </KeyboardAvoidingView>
  );
};

// Styles definition was moved up before headerRightCallback for it to be in scope.
// const styles = StyleSheet.create({ ... });

export default AddEditShoeScreen;
