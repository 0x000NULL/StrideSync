import React, { useState, useEffect } from 'react';
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

  // Get store actions
  const addShoe = useStore(state => state.addShoe);
  const updateShoe = useStore(state => state.updateShoe);
  const getShoeById = useStore(state => state.getShoeById);

  // Form state
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

  // Load shoe data if in edit mode
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

  // Set up header
  useEffect(() => {
    navigation.setOptions({
      title: isEditMode ? 'Edit Shoe' : 'Add New Shoe',
      headerRight: () => (
        <TouchableOpacity onPress={handleSave} disabled={isLoading} style={styles.headerButton}>
          <Text style={[styles.headerButtonText, { color: theme.colors.primary }]}>
            {isLoading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, isLoading, isEditMode, formData]);

  const validateForm = () => {
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
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const handleSave = async () => {
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
  };

  const renderFormField = (
    field,
    label,
    placeholder,
    keyboardType = 'default',
    multiline = false
  ) => (
    <View style={styles.formGroup}>
      <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          {
            borderColor: errors[field] ? theme.colors.error : theme.colors.border,
            color: theme.colors.text,
            backgroundColor: theme.colors.card,
          },
          multiline && { minHeight: 80, textAlignVertical: 'top' },
        ]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
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
          <Text style={[styles.label, { color: theme.colors.text }]}>Purchase Date</Text>
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
            <Text style={[styles.dateText, { color: theme.colors.text }]}>
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

        {/* Image upload would go here */}

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerButton: {
    marginRight: 16,
    padding: 8,
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  datePicker: {
    width: '100%',
    backgroundColor: 'white',
  },
  dateText: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  saveButton: {
    marginTop: 24,
  },
});

export default AddEditShoeScreen;
