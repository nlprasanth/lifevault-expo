import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Button, useTheme } from 'react-native-paper';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface DocumentDetailScreenProps {
  route: {
    params: {
      document: {
        id: string;
        name: string;
        content: string;
        createdAt: string;
        updatedAt: string;
        size: number;
        type: string;
      };
    };
  };
}

const DocumentDetailScreen: React.FC<DocumentDetailScreenProps> = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const { document } = route.params as DocumentDetailScreenProps['route']['params'];
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            onPress={() => setIsEditing(!isEditing)}
            style={styles.headerButton}
          >
            <MaterialCommunityIcons
              name="pencil"
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleShare}
            style={styles.headerButton}
          >
            <MaterialCommunityIcons
              name="share-variant"
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleDelete}
            style={styles.headerButton}
          >
            <MaterialCommunityIcons
              name="delete"
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, isEditing]);

  const handleShare = async () => {
    try {
      if (!FileSystem.documentDirectory) {
        throw new Error('Document directory not available');
      }
      const fileUri = `${FileSystem.documentDirectory}${document.name}`;
      const { exists } = await FileSystem.getInfoAsync(fileUri);
      
      if (!exists) {
        Alert.alert('Error', 'File not found');
        return;
      }

      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Error', 'Sharing is not available on this device');
        return;
      }

      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share document');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
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
              const fileUri = `${FileSystem.documentDirectory}${document.name}`;
              await FileSystem.deleteAsync(fileUri);
              navigation.goBack();
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete document');
            }
          },
        },
      ]
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title}>{document.name}</Text>
        <Text style={styles.type}>{document.type.toUpperCase()}</Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Size:</Text>
          <Text style={styles.value}>{formatFileSize(document.size)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Created:</Text>
          <Text style={styles.value}>{formatDate(document.createdAt)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Modified:</Text>
          <Text style={styles.value}>{formatDate(document.updatedAt)}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.contentText}>{document.content}</Text>
      </View>

      <View style={styles.actionButtons}>
        <Button
          mode="contained"
          onPress={handleShare}
          style={styles.button}
        >
          Share
        </Button>
        <Button
          mode="outlined"
          onPress={handleDelete}
          style={[styles.button, styles.deleteButton]}
          textColor="red"
        >
          Delete
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  type: {
    fontSize: 14,
    color: '#666',
  },
  infoContainer: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    flex: 1,
    fontWeight: 'bold',
    color: '#333',
  },
  value: {
    flex: 2,
    color: '#666',
  },
  content: {
    padding: 16,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  actionButtons: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    minWidth: 120,
  },
  deleteButton: {
    borderColor: 'red',
  },
});

export default DocumentDetailScreen;
