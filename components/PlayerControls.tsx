import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, Text, useTheme } from 'react-native-paper';
import { AudioVisualizer } from './AudioVisualizer';
import { Equalizer, EqualizerSettings } from './Equalizer';

interface PlayerControlsProps {
  sound: Audio.Sound | null;
  isPlaying: boolean;
  currentTrack: {
    title: string;
    artist?: string;
  } | null;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (position: number) => void;
  onShuffle: () => void;
  onRepeat: () => void;
  repeatMode: 'off' | 'one' | 'all';
  isShuffle: boolean;
  position: number;
  duration: number;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  sound,
  isPlaying,
  currentTrack,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  onShuffle,
  onRepeat,
  repeatMode,
  isShuffle,
  position,
  duration,
}) => {
  const theme = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [displayPosition, setDisplayPosition] = useState(0);
  const [showEqualizer, setShowEqualizer] = useState(false);
  const [equalizerSettings, setEqualizerSettings] = useState<EqualizerSettings>({
    bass: 50,
    mid: 50,
    treble: 50,
    reverb: 0,
    preamp: 100,
  });

  useEffect(() => {
    if (!isDragging) {
      setDisplayPosition(position);
    }
  }, [position, isDragging]);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleEqualizerApply = async (settings: EqualizerSettings) => {
    setEqualizerSettings(settings);
    if (sound) {
      try {
        // Note: Expo AV has limited audio effect support
        // In a real app, you'd need native modules for full equalizer control
        await sound.setVolumeAsync(settings.preamp / 100);
      } catch (error) {
        console.error('Error applying equalizer settings:', error);
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceVariant }]}>
      <View style={styles.trackInfo}>
        <Text variant="titleMedium" numberOfLines={1} style={styles.title}>
          {currentTrack?.title || 'No track selected'}
        </Text>
        <Text variant="bodySmall" numberOfLines={1} style={styles.artist}>
          {currentTrack?.artist || 'Unknown artist'}
        </Text>
      </View>

      <AudioVisualizer isPlaying={isPlaying} />

      <View style={styles.progressContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration}
          value={displayPosition}
          onSlidingStart={() => setIsDragging(true)}
          onSlidingComplete={(value) => {
            setIsDragging(false);
            onSeek(value);
          }}
          onValueChange={setDisplayPosition}
          minimumTrackTintColor={theme.colors.primary}
          maximumTrackTintColor={theme.colors.outline}
          thumbTintColor={theme.colors.primary}
        />
        <View style={styles.timeContainer}>
          <Text variant="labelSmall">{formatTime(displayPosition)}</Text>
          <Text variant="labelSmall">{formatTime(duration)}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <IconButton
          icon={isShuffle ? 'shuffle-variant' : 'shuffle'}
          iconColor={isShuffle ? theme.colors.primary : theme.colors.onSurface}
          size={24}
          onPress={onShuffle}
        />
        <IconButton
          icon="skip-previous"
          iconColor={theme.colors.onSurface}
          size={32}
          onPress={onPrevious}
        />
        <IconButton
          icon={isPlaying ? 'pause' : 'play'}
          iconColor={theme.colors.onSurface}
          size={40}
          onPress={onPlayPause}
          style={styles.playButton}
        />
        <IconButton
          icon="skip-next"
          iconColor={theme.colors.onSurface}
          size={32}
          onPress={onNext}
        />
        <IconButton
          icon={
            repeatMode === 'off'
              ? 'repeat-off'
              : repeatMode === 'one'
              ? 'repeat-once'
              : 'repeat'
          }
          iconColor={repeatMode !== 'off' ? theme.colors.primary : theme.colors.onSurface}
          size={24}
          onPress={onRepeat}
        />
      </View>

      <View style={styles.extraControls}>
        <IconButton
          icon="equalizer"
          iconColor={theme.colors.onSurface}
          size={24}
          onPress={() => setShowEqualizer(true)}
        />
      </View>

      <Equalizer
        visible={showEqualizer}
        onDismiss={() => setShowEqualizer(false)}
        onApply={handleEqualizerApply}
        initialSettings={equalizerSettings}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 4,
  },
  trackInfo: {
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
  },
  artist: {
    textAlign: 'center',
    opacity: 0.7,
  },
  progressContainer: {
    marginBottom: 16,
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
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  extraControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
}); 