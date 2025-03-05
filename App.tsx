import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { registerRootComponent } from 'expo';

// Import screens
import DocumentDetailScreen from './src/screens/DocumentDetailScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import RecordScreen from './src/screens/RecordScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Library"
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
            name="Library" 
            component={LibraryScreen}
            options={{
              title: 'My Documents'
            }}
          />
          <Stack.Screen 
            name="DocumentDetail" 
            component={DocumentDetailScreen}
            options={{
              title: 'Document Details'
            }}
          />
          <Stack.Screen 
            name="Record" 
            component={RecordScreen}
            options={{
              title: 'Record'
            }}
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen}
            options={{
              title: 'Settings'
            }}
          />
        </Stack.Navigator>
        <StatusBar style="light" />
      </NavigationContainer>
    </PaperProvider>
  );
}

export default registerRootComponent(App);
