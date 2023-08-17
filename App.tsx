import React from 'react';
import { Text, View } from 'react-native';
import SignIn from './components/SignIn';
import Base from './base/Base';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import NewTaxi from './components/NewTaxi';

const Stack = createStackNavigator();

const App = () => {
  return (
    <>
    <Base/>
    <NavigationContainer>
    <Stack.Navigator >
      <Stack.Screen name="SignIn" component={SignIn}  options={{ headerShown: false }}/>
      <Stack.Screen name="NewTaxi" component={NewTaxi} options={{ headerShown: false }} />
    </Stack.Navigator>
  </NavigationContainer>
  </>
  
  );
};

export default App;
