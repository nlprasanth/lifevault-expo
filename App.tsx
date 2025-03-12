import React from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { registerRootComponent } from 'expo';

// Import screens
import DocumentDetailScreen from './src/screens/DocumentDetailScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import RecordScreen from './src/screens/RecordScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();

// Define the theme
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#f4511e',
  },
};

// Define stack param list for type safety
export type RootStackParamList = {
  Library: undefined;
  DocumentDetail: { document: Document };
  Record: undefined;
  Settings: undefined;
};

export type Document = {
  id: string;
  name: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  type: string;
  content?: string;
};

function App() {
  return (
    <View style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
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
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen 
              name="Library" 
              component={LibraryScreen}
              options={{ title: 'My Documents' }}
            />
            <Stack.Screen 
              name="DocumentDetail" 
              component={DocumentDetailScreen}
              options={{ title: 'Document Details' }}
            />
            <Stack.Screen 
              name="Record" 
              component={RecordScreen}
              options={{ title: 'Record' }}
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen}
              options={{ title: 'Settings' }}
            />
          </Stack.Navigator>
          <StatusBar style="light" />
        </NavigationContainer>
      </PaperProvider>
    </View>
  );
}

registerRootComponent(App);
