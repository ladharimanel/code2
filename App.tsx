import React, {useState, useEffect} from 'react';
import { Text, View } from 'react-native';
import SignIn from './components/SignIn';
import Base from './base/Base';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import NewTaxi from './components/NewTaxi';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createStackNavigator();

const checkUserLoginStatus = async () => {
  try {
    const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
    return isLoggedIn === 'true'; // Convert the stored value to a boolean
  } catch (error) {
    console.error('Error checking login status:', error);
    return false; // Assume user is not logged in on error
  }
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check user login status during app startup
    checkUserLoginStatus().then((status) => {
      setIsLoggedIn(status);
    });
  }, []);
  return (
    <>
    <Base/>
    <NavigationContainer>
    <Stack.Navigator >
   
      <Stack.Screen name="SignIn" component={SignIn}  options={{ headerShown: false }}/>
        
      </Stack.Navigator>
  </NavigationContainer>
  </>
  
  );
};

export default App;
