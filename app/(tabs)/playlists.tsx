import Header from '@/components/Header';
import { StorageService } from '@/services/StorageService';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Card, Dialog, FAB, IconButton, Portal, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Playlist {
  id: string;
  name: string;
  tracks: any[];
}

export default function PlaylistsScreen() {
  const theme = useTheme();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [storageService] = useState(() => StorageService.getInstance());

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    const savedPlaylists = await storageService.getPlaylists();
    setPlaylists(savedPlaylists);
  };

  const createPlaylist = async () => {
    if (newPlaylistName.trim()) {
      const newPlaylist: Playlist = {
        id: Date.now().toString(),
        name: newPlaylistName.trim(),
        tracks: []
      };
      
      const updatedPlaylists = [...playlists, newPlaylist];
      await storageService.savePlaylists(updatedPlaylists);
      setPlaylists(updatedPlaylists);
      setNewPlaylistName('');
      setShowCreateDialog(false);
    }
  };

  const deletePlaylist = async (id: string) => {
    const updatedPlaylists = playlists.filter(p => p.id !== id);
    await storageService.savePlaylists(updatedPlaylists);
    setPlaylists(updatedPlaylists);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left', 'right', 'bottom']}>
      <Header title="Playlists" />
      <Surface style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: 16 }]}>
        <ScrollView>
          <Surface style={styles.grid} elevation={0}>
            {playlists.map(playlist => (
              <Card key={playlist.id} style={styles.playlistCard}>
                <Card.Cover 
                  source={playlist.tracks[0]?.artwork ? { uri: playlist.tracks[0].artwork } : require('../../assets/images/icon.png')} 
                  style={styles.cover}
                />
                <Card.Content style={styles.playlistInfo}>
                  <Text style={styles.playlistName} numberOfLines={1}>
                    {playlist.name}
                  </Text>
                  <Text style={[styles.songCount, { color: theme.colors.onSurfaceVariant }]}>
                    {playlist.tracks.length} songs
                  </Text>
                </Card.Content>
                <Card.Actions>
                  <IconButton 
                    icon="play" 
                    size={24} 
                    iconColor={theme.colors.primary}
                    disabled={playlist.tracks.length === 0}
                  />
                  <IconButton
                    icon="dots-vertical"
                    size={24}
                    iconColor={theme.colors.onSurfaceVariant}
                    onPress={() => deletePlaylist(playlist.id)}
                  />
                </Card.Actions>
              </Card>
            ))}
            {playlists.length === 0 && (
              <Card style={[styles.playlistCard, styles.emptyState]}>
                <Card.Content>
                  <Text style={styles.emptyStateText}>No playlists yet</Text>
                  <Text style={[styles.emptyStateSubtext, { color: theme.colors.onSurfaceVariant }]}>
                    Create a playlist to get started
                  </Text>
                </Card.Content>
              </Card>
            )}
          </Surface>
        </ScrollView>

        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={() => setShowCreateDialog(true)}
          color={theme.colors.onPrimary}
        />

        <Portal>
          <Dialog visible={showCreateDialog} onDismiss={() => setShowCreateDialog(false)}>
            <Dialog.Title>Create New Playlist</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Playlist Name"
                value={newPlaylistName}
                onChangeText={setNewPlaylistName}
                mode="outlined"
              />
            </Dialog.Content>
            <Dialog.Actions>
              <IconButton icon="close" onPress={() => setShowCreateDialog(false)} />
              <IconButton icon="check" onPress={createPlaylist} />
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </Surface>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grid: {
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  playlistCard: {
    width: '48%',
    marginBottom: 16,
  },
  cover: {
    height: 150,
  },
  playlistInfo: {
    padding: 8,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  songCount: {
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  emptyState: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});
