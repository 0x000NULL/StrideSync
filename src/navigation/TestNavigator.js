import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, Button } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import ShoeListScreen from '../screens/ShoeListScreen';
import AddEditShoeScreen from '../screens/AddEditShoeScreen';

// Simple Test Screen (kept for reference)
const SimpleTest = ({ navigation }) => (
  <View style={styles.container}>
    <Text style={styles.text}>Simple Test Screen</Text>
    <Button 
      title="Go to Home" 
      onPress={() => navigation.navigate('Home')} 
    />
    <Button 
      title="Go to Shoe List" 
      onPress={() => navigation.navigate('ShoeList')} 
    />
  </View>
);

const Stack = createNativeStackNavigator();

const TestNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName="ShoeList"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f4511e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="ShoeList" 
        component={ShoeListScreen} 
        options={{ title: 'My Shoes' }} 
      />
      <Stack.Screen 
        name="AddEditShoe" 
        component={AddEditShoeScreen} 
        options={{ title: 'Add Shoe' }} 
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4511e',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
});

export default TestNavigator;
