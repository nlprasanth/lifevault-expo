import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { FAB, Searchbar, useTheme } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { StatusBar } from 'expo-status-bar';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIconName } from '../types/icons';

type RootStackParamList = {
  Library: undefined;
  DocumentDetail: { document: Document };
  Record: undefined;
  Settings: undefined;
};

type Document = {
  id: string;
  name: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  type: string;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Library'>;

const LibraryScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      if (!FileSystem.documentDirectory) {
        throw new Error('Document directory not available');
      }
      const directory = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
      const docs = await Promise.all(
        directory.map(async (fileName) => {
          const fileUri = `${FileSystem.documentDirectory}${fileName}`;
          const fileInfo = await FileSystem.getInfoAsync(fileUri);
          return {
            id: fileName,
            name: fileName,
            size: fileInfo.size || 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            type: fileName.split('.').pop() || 'unknown',
          };
        })
      );
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      Alert.alert('Error', 'Failed to load documents');
    }
  };

  const handleAddDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: '*/*'
      });

      if (result.assets && result.assets.length > 0) {
        const { name, uri } = result.assets[0];
        if (!FileSystem.documentDirectory) {
          throw new Error('Document directory not available');
        }
        const newUri = `${FileSystem.documentDirectory}${name}`;
        await FileSystem.copyAsync({ from: uri, to: newUri });
        loadDocuments();
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to add document');
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: Document }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('DocumentDetail', { document: item })}
      style={styles.listItem}
    >
      <View style={styles.itemContent}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons 
            name={"file-document-outline" as MaterialCommunityIconName}
            size={24} 
            color={theme.colors.primary} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.subtitle}>
            {item.type.toUpperCase()} • {new Date(item.updatedAt).toLocaleDateString()}
          </Text>
        </View>
        <MaterialCommunityIcons 
          name={"chevron-right" as MaterialCommunityIconName}
          size={24} 
          color={theme.colors.primary} 
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Searchbar
        placeholder="Search documents"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      <FlatList
        data={filteredDocuments}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
      />
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={handleAddDocument}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchBar: {
    margin: 16,
  },
  listContent: {
    paddingBottom: 80,
  },
  listItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default LibraryScreen;
