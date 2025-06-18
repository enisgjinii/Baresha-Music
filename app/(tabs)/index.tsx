import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, IconButton, Surface, Text, useTheme } from 'react-native-paper';

const recentTracks = [
  { id: '1', title: 'Recent Track 1', artist: 'Artist 1', cover: 'https://picsum.photos/200' },
  { id: '2', title: 'Recent Track 2', artist: 'Artist 2', cover: 'https://picsum.photos/201' },
  { id: '3', title: 'Recent Track 3', artist: 'Artist 3', cover: 'https://picsum.photos/202' },
];

const recommendedTracks = [
  { id: '1', title: 'Recommended Track 1', artist: 'Artist 1', cover: 'https://picsum.photos/203' },
  { id: '2', title: 'Recommended Track 2', artist: 'Artist 2', cover: 'https://picsum.photos/204' },
  { id: '3', title: 'Recommended Track 3', artist: 'Artist 3', cover: 'https://picsum.photos/205' },
];

export default function HomeScreen() {
  const theme = useTheme();

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            What would you like to listen to?
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconButton icon="clock" size={24} iconColor={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Recently Played</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tracksScroll}>
            {recentTracks.map(track => (
              <Card
                key={track.id}
                style={[styles.trackCard, { backgroundColor: theme.colors.surfaceVariant }]}
                onPress={() => {}}
              >
                <Card.Cover source={{ uri: track.cover }} style={styles.trackCover} />
                <Card.Content style={styles.trackContent}>
                  <Text style={styles.trackTitle} numberOfLines={1}>
                    {track.title}
                  </Text>
                  <Text style={[styles.trackArtist, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
                    {track.artist}
                  </Text>
                </Card.Content>
              </Card>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconButton icon="star" size={24} iconColor={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Recommended for You</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tracksScroll}>
            {recommendedTracks.map(track => (
              <Card
                key={track.id}
                style={[styles.trackCard, { backgroundColor: theme.colors.surfaceVariant }]}
                onPress={() => {}}
              >
                <Card.Cover source={{ uri: track.cover }} style={styles.trackCover} />
                <Card.Content style={styles.trackContent}>
                  <Text style={styles.trackTitle} numberOfLines={1}>
                    {track.title}
                  </Text>
                  <Text style={[styles.trackArtist, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
                    {track.artist}
                  </Text>
                </Card.Content>
              </Card>
            ))}
          </ScrollView>
        </View>
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
    paddingTop: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  tracksScroll: {
    paddingLeft: 20,
  },
  trackCard: {
    width: 160,
    marginRight: 12,
    borderRadius: 12,
    elevation: 2,
  },
  trackCover: {
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  trackContent: {
    padding: 12,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 12,
  },
});
