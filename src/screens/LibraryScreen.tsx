import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { List, FAB, Searchbar, useTheme } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { StatusBar } from 'expo-status-bar';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

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
    >
      <List.Item
        title={item.name}
        description={`${item.type.toUpperCase()} • ${new Date(item.updatedAt).toLocaleDateString()}`}
        left={props => <List.Icon {...props} icon="file-document-outline" />}
        right={props => <List.Icon {...props} icon="chevron-right" />}
      />
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
