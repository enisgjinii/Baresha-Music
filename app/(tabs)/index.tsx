import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { IconButton, Surface, Text, useTheme } from 'react-native-paper';

const recentTracks = [
  { id: '1', title: 'Recent Track 1', artist: 'Artist 1' },
  { id: '2', title: 'Recent Track 2', artist: 'Artist 2' },
  { id: '3', title: 'Recent Track 3', artist: 'Artist 3' },
];

const recommendedTracks = [
  { id: '1', title: 'Recommended Track 1', artist: 'Artist 1' },
  { id: '2', title: 'Recommended Track 2', artist: 'Artist 2' },
  { id: '3', title: 'Recommended Track 3', artist: 'Artist 3' },
];

export default function HomeScreen() {
  const theme = useTheme();

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
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
          {recentTracks.map(track => (
            <Surface
              key={track.id}
              style={[styles.trackItem, { backgroundColor: theme.colors.surfaceVariant }]}
            >
              <IconButton icon="music" size={24} iconColor={theme.colors.primary} />
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle}>{track.title}</Text>
                <Text style={[styles.trackArtist, { color: theme.colors.onSurfaceVariant }]}>
                  {track.artist}
                </Text>
              </View>
            </Surface>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconButton icon="star" size={24} iconColor={theme.colors.primary} />
            <Text style={styles.sectionTitle}>Recommended for You</Text>
          </View>
          {recommendedTracks.map(track => (
            <Surface
              key={track.id}
              style={[styles.trackItem, { backgroundColor: theme.colors.surfaceVariant }]}
            >
              <IconButton icon="music" size={24} iconColor={theme.colors.primary} />
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle}>{track.title}</Text>
                <Text style={[styles.trackArtist, { color: theme.colors.onSurfaceVariant }]}>
                  {track.artist}
                </Text>
              </View>
            </Surface>
          ))}
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
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  trackInfo: {
    marginLeft: 12,
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  trackArtist: {
    fontSize: 14,
  },
});
