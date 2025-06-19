import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import PreRunScreen from '../screens/PreRunScreen';
import ActiveRunScreen from '../screens/ActiveRunScreen';
import PauseScreen from '../screens/PauseScreen';
import RunSummaryScreen from '../screens/RunSummaryScreen';
import SaveRunScreen from '../screens/SaveRunScreen';

const Stack = createStackNavigator();

const RunFlowNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="PreRun" component={PreRunScreen} />
      <Stack.Screen name="ActiveRun" component={ActiveRunScreen} />
      <Stack.Screen name="Pause" component={PauseScreen} />
      <Stack.Screen name="RunSummary" component={RunSummaryScreen} />
      <Stack.Screen name="SaveRun" component={SaveRunScreen} />
    </Stack.Navigator>
  );
};

export default RunFlowNavigator;
