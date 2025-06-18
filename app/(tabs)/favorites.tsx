import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Divider, IconButton, List, Surface, Text, useTheme } from 'react-native-paper';

const sampleFavorites = [
  {
    id: '1',
    title: 'Favorite Song 1',
    artist: 'Artist 1',
    duration: '3:45',
    cover: 'https://example.com/cover1.jpg',
  },
  {
    id: '2',
    title: 'Favorite Song 2',
    artist: 'Artist 2',
    duration: '4:20',
    cover: 'https://example.com/cover2.jpg',
  },
  {
    id: '3',
    title: 'Favorite Song 3',
    artist: 'Artist 3',
    duration: '3:15',
    cover: 'https://example.com/cover3.jpg',
  },
  {
    id: '4',
    title: 'Favorite Song 4',
    artist: 'Artist 4',
    duration: '5:10',
    cover: 'https://example.com/cover4.jpg',
  },
];

export default function FavoritesScreen() {
  const theme = useTheme();

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        <Surface style={styles.header} elevation={0}>
          <Text style={styles.title}>Favorites</Text>
        </Surface>

        <Card style={styles.listCard}>
          {sampleFavorites.map((track, index) => (
            <React.Fragment key={track.id}>
              <List.Item
                title={track.title}
                description={track.artist}
                left={props => (
                  <List.Image {...props} source={{ uri: track.cover }} style={styles.cover} />
                )}
                right={props => (
                  <View style={styles.rightContent}>
                    <Text style={[styles.duration, { color: theme.colors.onSurfaceVariant }]}>
                      {track.duration}
                    </Text>
                    <IconButton icon="heart" size={24} iconColor={theme.colors.primary} />
                  </View>
                )}
                onPress={() => {}}
              />
              {index < sampleFavorites.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Card>
      </ScrollView>
    </Surface>
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
  listCard: {
    margin: 16,
    borderRadius: 12,
  },
  cover: {
    width: 56,
    height: 56,
    borderRadius: 4,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  duration: {
    fontSize: 14,
  },
});
