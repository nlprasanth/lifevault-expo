import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  List,
  Switch,
  Divider,
  Button,
  Dialog,
  Portal,
  TextInput,
  useTheme,
} from 'react-native-paper';
import * as FileSystem from 'expo-file-system';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Settings {
  darkMode: boolean;
  biometricLock: boolean;
  autoBackup: boolean;
}

const SettingsScreen = () => {
  const theme = useTheme();
  const [darkMode, setDarkMode] = useState(false);
  const [biometricLock, setBiometricLock] = useState(false);
  const [autoBackup, setAutoBackup] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [biometricSupported, setBiometricSupported] = useState(false);

  useEffect(() => {
    checkBiometricSupport();
    loadSettings();
  }, []);

  const checkBiometricSupport = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    setBiometricSupported(compatible);
  };

  const loadSettings = async () => {
    try {
      const settingsStr = await AsyncStorage.getItem('settings');
      if (settingsStr) {
        const settings = JSON.parse(settingsStr) as Settings;
        setDarkMode(settings.darkMode);
        setBiometricLock(settings.biometricLock);
        setAutoBackup(settings.autoBackup);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      const settings: Settings = {
        darkMode,
        biometricLock,
        autoBackup,
      };
      await AsyncStorage.setItem('settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const handleBiometricToggle = async () => {
    if (!biometricSupported) {
      Alert.alert('Not Available', 'Biometric authentication is not available on this device');
      return;
    }

    if (!biometricLock) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to enable biometric lock',
      });

      if (result.success) {
        setBiometricLock(true);
        saveSettings();
      }
    } else {
      setBiometricLock(false);
      saveSettings();
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all documents and recordings? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!FileSystem.documentDirectory) {
                throw new Error('Document directory not available');
              }
              const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
              await Promise.all(
                files.map(file =>
                  FileSystem.deleteAsync(`${FileSystem.documentDirectory}${file}`)
                )
              );
              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const renderIcon = (name: string, color?: string) => (
    <View style={styles.iconContainer}>
      <MaterialCommunityIcons name={name} size={24} color={color || theme.colors.primary} />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="light" />
      <List.Section>
        <List.Subheader>Appearance</List.Subheader>
        <List.Item
          title="Dark Mode"
          left={() => renderIcon('theme-light-dark')}
          right={() => (
            <Switch
              value={darkMode}
              onValueChange={(value) => {
                setDarkMode(value);
                saveSettings();
              }}
            />
          )}
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>Security</List.Subheader>
        {biometricSupported && (
          <List.Item
            title="Biometric Lock"
            description="Require authentication to open app"
            left={() => renderIcon('fingerprint')}
            right={() => (
              <Switch
                value={biometricLock}
                onValueChange={handleBiometricToggle}
              />
            )}
          />
        )}
        <List.Item
          title="Change Password"
          left={() => renderIcon('lock')}
          onPress={() => setShowPasswordDialog(true)}
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>Backup</List.Subheader>
        <List.Item
          title="Auto Backup"
          description="Automatically backup to cloud"
          left={() => renderIcon('cloud-upload')}
          right={() => (
            <Switch
              value={autoBackup}
              onValueChange={(value) => {
                setAutoBackup(value);
                saveSettings();
              }}
            />
          )}
        />
        <List.Item
          title="Backup Now"
          left={() => renderIcon('backup-restore')}
          onPress={() => Alert.alert('Info', 'Backup started')}
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>Data</List.Subheader>
        <List.Item
          title="Clear All Data"
          description="Delete all documents and recordings"
          left={() => renderIcon('delete', '#dc3545')}
          onPress={handleClearData}
        />
      </List.Section>

      <Portal>
        <Dialog
          visible={showPasswordDialog}
          onDismiss={() => setShowPasswordDialog(false)}
        >
          <Dialog.Title>Change Password</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="New Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowPasswordDialog(false)}>Cancel</Button>
            <Button
              onPress={() => {
                setShowPasswordDialog(false);
                setPassword('');
              }}
            >
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
});

export default SettingsScreen;
