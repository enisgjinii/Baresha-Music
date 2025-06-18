import Slider from '@react-native-community/slider';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, Surface, Text, useTheme } from 'react-native-paper';

import { IconSymbol } from '@/components/ui/IconSymbol';

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function PlayerScreen() {
  const theme = useTheme();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(180); // 3 minutes
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.playerContainer}>
        <View style={styles.artworkContainer}>
          <Surface style={[styles.artwork, { backgroundColor: theme.colors.surfaceVariant }]}>
            <IconSymbol name="music.note" size={80} color={theme.colors.primary} />
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
            style={styles.slider}
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
            style={styles.controlButton}
          />
          <IconButton
            icon="skip-previous"
            size={32}
            iconColor={theme.colors.primary}
            style={styles.controlButton}
          />
          <IconButton
            icon={isPlaying ? 'pause' : 'play'}
            size={48}
            iconColor={theme.colors.primary}
            style={[styles.playButton, { backgroundColor: theme.colors.primaryContainer }]}
            onPress={() => setIsPlaying(!isPlaying)}
          />
          <IconButton
            icon="skip-next"
            size={32}
            iconColor={theme.colors.primary}
            style={styles.controlButton}
          />
          <IconButton
            icon="repeat"
            size={24}
            iconColor={theme.colors.onSurfaceVariant}
            style={styles.controlButton}
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
  playerContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artworkContainer: {
    marginBottom: 32,
  },
  artwork: {
    width: 280,
    height: 280,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  trackInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  trackTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  artistName: {
    fontSize: 16,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 32,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  timeText: {
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButton: {
    marginHorizontal: 8,
  },
  playButton: {
    marginHorizontal: 16,
    elevation: 4,
  },
});
