import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
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

  const SettingsItem = ({ 
    icon, 
    title, 
    description, 
    onPress, 
    right 
  }: { 
    icon: string; 
    title: string; 
    description?: string; 
    onPress?: () => void; 
    right?: () => React.ReactNode; 
  }) => (
    <TouchableOpacity 
      style={styles.settingsItem} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingsItemContent}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons 
            name={icon} 
            size={24} 
            color={theme.colors.primary} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.settingsTitle}>{title}</Text>
          {description && (
            <Text style={styles.settingsDescription}>{description}</Text>
          )}
        </View>
        {right && right()}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Appearance</Text>
        <SettingsItem
          icon="theme-light-dark"
          title="Dark Mode"
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
      </View>

      <Divider />

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Security</Text>
        {biometricSupported && (
          <SettingsItem
            icon="fingerprint"
            title="Biometric Lock"
            description="Require authentication to open app"
            right={() => (
              <Switch
                value={biometricLock}
                onValueChange={handleBiometricToggle}
              />
            )}
          />
        )}
        <SettingsItem
          icon="lock"
          title="Change Password"
          onPress={() => setShowPasswordDialog(true)}
        />
      </View>

      <Divider />

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Backup</Text>
        <SettingsItem
          icon="cloud-upload"
          title="Auto Backup"
          description="Automatically backup to cloud"
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
        <SettingsItem
          icon="backup-restore"
          title="Backup Now"
          onPress={() => Alert.alert('Info', 'Backup started')}
        />
      </View>

      <Divider />

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Data</Text>
        <SettingsItem
          icon="delete"
          title="Clear All Data"
          description="Delete all documents and recordings"
          onPress={handleClearData}
        />
      </View>

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
  section: {
    paddingTop: 16,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  settingsItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  settingsItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    color: '#000',
  },
  settingsDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

export default SettingsScreen;
