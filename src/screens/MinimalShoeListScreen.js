import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const MinimalShoeListScreen = ({ navigation }) => {
  // Mock data for testing
  const shoes = [
    { id: '1', name: 'Running Shoe 1', brand: 'Nike' },
    { id: '2', name: 'Trail Runner', brand: 'Salomon' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Shoes</Text>

      <FlatList
        data={shoes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.shoeItem}>
            <Text style={styles.shoeName}>{item.name}</Text>
            <Text style={styles.shoeBrand}>{item.brand}</Text>
          </View>
        )}
        style={styles.list}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddEditShoe')}>
        <MaterialIcons name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>Add Shoe</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  list: {
    flex: 1,
  },
  shoeItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  shoeName: {
    fontSize: 16,
    fontWeight: '500',
  },
  shoeBrand: {
    color: '#666',
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#f4511e',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default MinimalShoeListScreen;
