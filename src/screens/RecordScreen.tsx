import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
} from 'react-native';
import { Button, Text } from 'react-native-paper';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { StatusBar } from 'expo-status-bar';

const RecordScreen = ({ navigation }) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    return () => {
      if (recording) {
        stopRecording();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission required', 'Please grant microphone permission to record audio');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setDuration(0);

      // Start duration timer
      const timer = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      recording.setOnRecordingStatusUpdate(status => {
        if (status.isDoneRecording) {
          clearInterval(timer);
          setIsRecording(false);
        }
      });

    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        const fileName = `recording-${new Date().getTime()}.m4a`;
        const newUri = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.moveAsync({ from: uri, to: newUri });
        
        navigation.navigate('DocumentDetail', {
          document: {
            id: fileName,
            name: fileName,
            content: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            size: (await FileSystem.getInfoAsync(newUri)).size || 0,
            type: 'audio',
          },
        });
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }

    setRecording(null);
    setIsRecording(false);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.recordingInfo}>
        <Text style={styles.timer}>{formatDuration(duration)}</Text>
        <Text style={styles.status}>
          {isRecording ? 'Recording...' : 'Ready to Record'}
        </Text>
      </View>

      <View style={styles.controls}>
        <Button
          mode="contained"
          onPress={isRecording ? stopRecording : startRecording}
          style={[
            styles.recordButton,
            isRecording && styles.recordingButton,
          ]}
          labelStyle={styles.recordButtonLabel}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  status: {
    fontSize: 18,
    color: '#666',
  },
  controls: {
    width: '100%',
    alignItems: 'center',
  },
  recordButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    backgroundColor: '#f4511e',
  },
  recordingButton: {
    backgroundColor: '#dc3545',
  },
  recordButtonLabel: {
    fontSize: 18,
  },
});

export default RecordScreen;
