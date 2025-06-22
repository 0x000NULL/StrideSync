import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import PropTypes from 'prop-types';

/**
 * A modal component for filtering and sorting options
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Whether the modal is visible
 * @param {Function} props.onClose - Function to call when closing the modal
 * @param {string} props.title - Title of the modal
 * @param {Array} props.options - Array of sorting/filtering options
 * @param {string} props.selected - Currently selected option
 * @param {Function} props.onSelect - Function to call when an option is selected
 */
const FilterModal = ({
  visible,
  onClose,
  title = 'Filter & Sort',
  options = [],
  selected,
  onSelect,
}) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('sort'); // 'sort' or 'filter'

  const handleSelect = useCallback(
    option => {
      onSelect(option);
      onClose();
    },
    [onSelect, onClose]
  );

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.colors.backdrop || 'rgba(0, 0, 0, 0.5)', // Fallback for safety
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: theme.borderRadius.lg,
      borderTopRightRadius: theme.borderRadius.lg,
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
      ...theme.typography.h5,
      color: theme.colors.text.primary,
      fontWeight: '600',
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    tabs: {
      flexDirection: 'row',
      marginBottom: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    tab: {
      flex: 1,
      padding: theme.spacing.sm,
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: theme.colors.transparent || 'transparent', // Fallback for safety
    },
    tabActive: {
      borderBottomColor: theme.colors.primary,
    },
    tabText: {
      ...theme.typography.button,
      color: theme.colors.text.primary,
    },
    tabTextActive: {
      color: theme.colors.primary,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      marginBottom: theme.spacing.xs,
    },
    optionSelected: {
      backgroundColor: `${theme.colors.primary}10`,
    },
    optionText: {
      ...theme.typography.body,
      color: theme.colors.text.primary,
      flex: 1,
    },
    optionTextSelected: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    checkIcon: {
      marginLeft: theme.spacing.sm,
    },
  });

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialIcons name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'sort' && styles.tabActive]}
              onPress={() => setActiveTab('sort')}
            >
              <Text style={[styles.tabText, activeTab === 'sort' && styles.tabTextActive]}>
                Sort
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'filter' && styles.tabActive]}
              onPress={() => setActiveTab('filter')}
            >
              <Text style={[styles.tabText, activeTab === 'filter' && styles.tabTextActive]}>
                Filter
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView>
            {options.map(option => (
              <TouchableOpacity
                key={option.id}
                style={[styles.option, selected === option.id && styles.optionSelected]}
                onPress={() => handleSelect(option.id)}
              >
                <Text
                  style={[styles.optionText, selected === option.id && styles.optionTextSelected]}
                >
                  {option.label}
                </Text>
                {selected === option.id && (
                  <MaterialIcons
                    name="check"
                    size={20}
                    color={theme.colors.primary}
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

FilterModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  selected: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
};

FilterModal.defaultProps = {
  title: 'Filter & Sort',
  options: [],
  selected: undefined,
};

export default React.memo(FilterModal);
