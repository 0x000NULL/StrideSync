import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Button, Text, View } from 'react-native';

// Import the actual PreRunScreen
import ActualPreRunScreen from '../screens/PreRunScreen';
import ActualActiveRunScreen from '../screens/ActiveRunScreen';
import ActualPauseScreen from '../screens/PauseScreen';
import ActualRunSummaryScreen from '../screens/RunSummaryScreen';
import ActualSaveRunScreen from '../screens/SaveRunScreen';

// Placeholder Screen Components
// const PreRunScreen = ({ navigation }) => ( // Commented out or removed
//   <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
//     <Text>Pre-Run Screen</Text>
//     <Button
//       title="Start Run"
//       onPress={() => navigation.navigate('ActiveRun')}
//     />
//   </View>
// );

// const ActiveRunScreen = ({ navigation }) => ( // Commented out or removed
//   <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
//     <Text>Active Run Screen</Text>
//     <Button title="Pause Run" onPress={() => navigation.navigate('Pause')} />
//     <Button
//       title="End Run"
//       onPress={() => navigation.navigate('RunSummary')}
//     />
//   </View>
// );

// const PauseScreen = ({ navigation }) => ( // Commented out or removed
//   <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
//     <Text>Pause Screen</Text>
//     <Button
//       title="Resume Run"
//       onPress={() => navigation.navigate('ActiveRun')}
//     />
//     <Button
//       title="End Run"
//       onPress={() => navigation.navigate('RunSummary')}
//     />
//   </View>
// );

// const RunSummaryScreen = ({ navigation }) => ( // Commented out or removed
//   <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
//     <Text>Run Summary Screen</Text>
//     <Button
//       title="Save Run"
//       onPress={() => navigation.navigate('SaveRun')}
//     />
//     <Button
//       title="Discard Run"
//       onPress={() => navigation.navigate('PreRun')}
//     />
//   </View>
// );

// const SaveRunScreen = ({ navigation }) => ( // Commented out or removed
//   <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
//     <Text>Save Run Screen</Text>
//     <Button
//       title="Done"
//       onPress={() => navigation.navigate('PreRun')}
//     />
//   </View>
// );

const Stack = createStackNavigator();

const RunFlowNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="PreRun">
      <Stack.Screen name="PreRun" component={ActualPreRunScreen} />
      <Stack.Screen name="ActiveRun" component={ActualActiveRunScreen} />
      <Stack.Screen name="Pause" component={ActualPauseScreen} />
      <Stack.Screen name="RunSummary" component={ActualRunSummaryScreen} />
      <Stack.Screen name="SaveRun" component={ActualSaveRunScreen} />
    </Stack.Navigator>
  );
};

export default RunFlowNavigator;
