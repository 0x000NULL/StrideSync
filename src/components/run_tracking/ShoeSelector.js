/* eslint-disable react-native/no-unused-styles */
import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { useStore } from '../../stores/useStore';
import { shallow } from 'zustand/shallow';
import Card from '../ui/Card';
import Button from '../ui/Button';
import PropTypes from 'prop-types';
import { useTheme } from '../../theme/ThemeProvider';

// Extracted item component for the FlatList
const ShoeSelectItem = React.memo(({ item, onPress, styles }) => (
  <TouchableOpacity style={styles.shoeItem} onPress={onPress}>
    <Text style={styles.shoeName}>{item.name}</Text>
    <Text style={styles.shoeBrand}>{item.brand}</Text>
  </TouchableOpacity>
));

ShoeSelectItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    brand: PropTypes.string,
  }).isRequired,
  onPress: PropTypes.func.isRequired,
  styles: PropTypes.object.isRequired, // Pass relevant styles
};
ShoeSelectItem.displayName = 'ShoeSelectItem';

// Helper to build styles with access to theme
const createStyles = theme =>
  StyleSheet.create({
    card: {
      padding: theme.spacing.md,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: theme.spacing.sm,
      color: theme.colors.text.primary,
    },
    selector: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surface,
    },
    selectorText: {
      fontSize: 16,
      color: theme.colors.text.primary,
    },
    arrow: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: theme.colors.backdrop || 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: theme.borderRadius.lg,
      borderTopRightRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      maxHeight: '60%',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: theme.spacing.lg,
      textAlign: 'center',
      color: theme.colors.text.primary,
    },
    shoeItem: {
      paddingVertical: theme.spacing.md,
    },
    shoeName: {
      fontSize: 18,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
    shoeBrand: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.xxs,
    },
    separator: {
      height: 1,
      backgroundColor: theme.colors.border,
    },
  });

const ShoeSelector = ({ selectedShoeId, onSelectShoe }) => {
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const shoes = useStore(state => state.shoes, shallow);
  const activeShoes = useMemo(() => shoes.filter(shoe => shoe.isActive), [shoes]);
  const selectedShoe = activeShoes.find(shoe => shoe.id === selectedShoeId);

  const handleSelectShoe = useCallback(
    shoeId => {
      onSelectShoe(shoeId);
      setModalVisible(false);
    },
    [onSelectShoe]
  );

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Memoized render functions to avoid unstable nested components
  const renderShoeItem = useCallback(
    ({ item }) => (
      <ShoeSelectItem
        item={item}
        onPress={() => handleSelectShoe(item.id)}
        styles={{
          // Pass only necessary styles
          shoeItem: styles.shoeItem,
          shoeName: styles.shoeName,
          shoeBrand: styles.shoeBrand,
        }}
      />
    ),
    [handleSelectShoe, styles]
  );

  const renderSeparator = useCallback(() => <View style={styles.separator} />, [styles]);

  return (
    <>
      <Card style={styles.card}>
        <Text style={styles.label}>Running Shoe</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.selector}>
          <Text style={styles.selectorText}>
            {selectedShoe ? selectedShoe.name : 'Select a Shoe'}
          </Text>
          <Text style={styles.arrow}>▼</Text>
        </TouchableOpacity>
      </Card>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select a Shoe</Text>
            <FlatList
              data={activeShoes}
              keyExtractor={item => item.id}
              renderItem={renderShoeItem}
              ItemSeparatorComponent={renderSeparator}
            />
            <Button title="Cancel" onPress={() => setModalVisible(false)} variant="outline" />
          </View>
        </View>
      </Modal>
    </>
  );
};

ShoeSelector.propTypes = {
  selectedShoeId: PropTypes.string,
  onSelectShoe: PropTypes.func.isRequired,
};

ShoeSelector.defaultProps = {
  selectedShoeId: null,
};

export default ShoeSelector;
