import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { IconButton, Button } from 'react-native-paper';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { StatusBar } from 'expo-status-bar';

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
  const { document } = route.params as DocumentDetailScreenProps['route']['params'];
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          <IconButton
            icon="pencil"
            size={20}
            onPress={() => setIsEditing(!isEditing)}
          />
          <IconButton
            icon="share-variant"
            size={20}
            onPress={handleShare}
          />
          <IconButton
            icon="delete"
            size={20}
            onPress={handleDelete}
          />
        </View>
      ),
    });
  }, [navigation, isEditing]);

  const handleShare = async () => {
    try {
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
      Alert.alert('Error', 'Failed to share document');
      console.error('Share error:', error);
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
              const fileUri = `${FileSystem.documentDirectory}${document.name}`;
              await FileSystem.deleteAsync(fileUri);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete document');
              console.error('Delete error:', error);
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  type: {
    fontSize: 14,
    color: '#666',
    textTransform: 'uppercase',
  },
  infoContainer: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  content: {
    padding: 16,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
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
