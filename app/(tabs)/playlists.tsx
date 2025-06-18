import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Card, FAB, IconButton, Surface, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const samplePlaylists = [
  { id: '1', name: 'My Favorites', songCount: 12, cover: 'https://example.com/cover1.jpg' },
  { id: '2', name: 'Workout Mix', songCount: 25, cover: 'https://example.com/cover2.jpg' },
  { id: '3', name: 'Chill Vibes', songCount: 18, cover: 'https://example.com/cover3.jpg' },
  { id: '4', name: 'Party Time', songCount: 30, cover: 'https://example.com/cover4.jpg' },
];

export default function PlaylistsScreen() {
  const theme = useTheme();
  const navigation = useNavigation();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right', 'bottom']}>
      <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView>
          <Surface style={styles.header} elevation={0}>
            <Text style={styles.title}>Playlists</Text>
          </Surface>

          <Surface style={styles.grid} elevation={0}>
            {samplePlaylists.map(playlist => (
              <Card key={playlist.id} style={styles.playlistCard}>
                <Card.Cover source={{ uri: playlist.cover }} style={styles.cover} />
                <Card.Content style={styles.playlistInfo}>
                  <Text style={styles.playlistName} numberOfLines={1}>
                    {playlist.name}
                  </Text>
                  <Text style={[styles.songCount, { color: theme.colors.onSurfaceVariant }]}>
                    {playlist.songCount} songs
                  </Text>
                </Card.Content>
                <Card.Actions>
                  <IconButton icon="play" size={24} iconColor={theme.colors.primary} />
                  <IconButton
                    icon="dots-vertical"
                    size={24}
                    iconColor={theme.colors.onSurfaceVariant}
                  />
                </Card.Actions>
              </Card>
            ))}
          </Surface>
        </ScrollView>

        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={() => {}}
          color={theme.colors.onPrimary}
        />
      </Surface>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
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
});
