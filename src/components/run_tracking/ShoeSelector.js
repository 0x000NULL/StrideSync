import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { useStore } from '../../stores/useStore';
import { Card } from '../ui/Card';
import Button from '../ui/Button';

const ShoeSelector = ({ selectedShoeId, onSelectShoe }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const shoes = useStore((state) => state.shoes.filter(shoe => shoe.isActive));
  const selectedShoe = shoes.find(shoe => shoe.id === selectedShoeId);

  const handleSelectShoe = (shoeId) => {
    onSelectShoe(shoeId);
    setModalVisible(false);
  };

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
              data={shoes}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.shoeItem}
                  onPress={() => handleSelectShoe(item.id)}
                >
                  <Text style={styles.shoeName}>{item.name}</Text>
                  <Text style={styles.shoeBrand}>{item.brand}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
            <Button title="Cancel" onPress={() => setModalVisible(false)} type="outline" />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  selectorText: {
    fontSize: 16,
    color: '#333',
  },
  arrow: {
    fontSize: 12,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  shoeItem: {
    paddingVertical: 15,
  },
  shoeName: {
    fontSize: 18,
    fontWeight: '500',
  },
  shoeBrand: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
  },
});

export default ShoeSelector; 