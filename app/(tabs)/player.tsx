import Slider from '@react-native-community/slider';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, Surface, Text, useTheme } from 'react-native-paper';

const sampleTracks = [
  {
    id: '1',
    title: 'Sample Track 1',
    artist: 'Artist 1',
    url: 'https://example.com/sample1.mp3',
    artwork: 'https://example.com/artwork1.jpg',
  },
  {
    id: '2',
    title: 'Sample Track 2',
    artist: 'Artist 2',
    url: 'https://example.com/sample2.mp3',
    artwork: 'https://example.com/artwork2.jpg',
  },
];

export default function PlayerScreen() {
  const theme = useTheme();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180); // 3 minutes in seconds

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Now Playing</Text>
      </View>

      <View style={styles.playerContainer}>
        <View style={styles.artworkContainer}>
          <Surface style={[styles.artwork, { backgroundColor: theme.colors.surfaceVariant }]}>
            <IconButton
              icon="music"
              size={40}
              iconColor={theme.colors.primary}
            />
          </Surface>
        </View>

        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle}>Sample Track</Text>
          <Text style={[styles.artistName, { color: theme.colors.onSurfaceVariant }]}>
            Sample Artist
          </Text>
        </View>

        <View style={styles.progressContainer}>
          <Slider
            value={currentTime}
            minimumValue={0}
            maximumValue={duration}
            onValueChange={setCurrentTime}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.surfaceVariant}
            thumbTintColor={theme.colors.primary}
          />
          <View style={styles.timeContainer}>
            <Text style={[styles.timeText, { color: theme.colors.onSurfaceVariant }]}>
              {formatTime(currentTime)}
            </Text>
            <Text style={[styles.timeText, { color: theme.colors.onSurfaceVariant }]}>
              {formatTime(duration)}
            </Text>
          </View>
        </View>

        <View style={styles.controls}>
          <IconButton
            icon="shuffle"
            size={24}
            iconColor={theme.colors.onSurfaceVariant}
          />
          <IconButton
            icon="skip-previous"
            size={32}
            iconColor={theme.colors.primary}
          />
          <IconButton
            icon="play"
            size={48}
            iconColor={theme.colors.primary}
            style={styles.playButton}
          />
          <IconButton
            icon="skip-next"
            size={32}
            iconColor={theme.colors.primary}
          />
          <IconButton
            icon="repeat"
            size={24}
            iconColor={theme.colors.onSurfaceVariant}
          />
        </View>
      </View>
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
  playerContainer: {
    flex: 1,
    padding: 20,
  },
  artworkContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  artwork: {
    width: 280,
    height: 280,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  trackTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  artistName: {
    opacity: 0.7,
    fontSize: 16,
  },
  progressContainer: {
    marginBottom: 32,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    fontSize: 14,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginHorizontal: 16,
  },
}); 