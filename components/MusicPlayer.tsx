import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  artwork?: string;
}

interface MusicPlayerProps {
  tracks: Track[];
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ tracks }) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [audioPlayer, setAudioPlayer] = useState<Audio.Sound | null>(null);

  const currentTrack = tracks[currentTrackIndex];

  const onPlaybackStatusUpdate = useCallback((status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setIsPlaying(status.isPlaying);
    }
  }, []);

  const setupAudio = useCallback(async () => {
    try {
      if (audioPlayer) {
        await audioPlayer.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: currentTrack.url },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );

      setAudioPlayer(sound);
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        setDuration(status.durationMillis || 0);
      }
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  }, [audioPlayer, currentTrack.url, onPlaybackStatusUpdate]);

  useEffect(() => {
    setupAudio();
    return () => {
      if (audioPlayer) {
        audioPlayer.unloadAsync();
      }
    };
  }, [currentTrackIndex, audioPlayer, setupAudio]);

  const togglePlayback = async () => {
    if (!audioPlayer) return;

    if (isPlaying) {
      await audioPlayer.pauseAsync();
    } else {
      await audioPlayer.playAsync();
    }
  };

  const playNext = () => {
    setCurrentTrackIndex(prev => (prev + 1) % tracks.length);
  };

  const playPrevious = () => {
    setCurrentTrackIndex(prev => (prev - 1 + tracks.length) % tracks.length);
  };

  const onSliderValueChange = async (value: number) => {
    if (audioPlayer) {
      await audioPlayer.setPositionAsync(value);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.artworkContainer}>
        {currentTrack.artwork ? (
          <Image source={{ uri: currentTrack.artwork }} style={styles.artwork} />
        ) : (
          <View style={styles.placeholderArtwork}>
            <Ionicons name="musical-notes" size={40} color="#666" />
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.title}>{currentTrack.title}</Text>
        <Text style={styles.artist}>{currentTrack.artist}</Text>
      </View>

      <View style={styles.progressContainer}>
        <Slider
          style={styles.progressBar}
          minimumValue={0}
          maximumValue={duration}
          value={position}
          onValueChange={onSliderValueChange}
          minimumTrackTintColor="#1DB954"
          maximumTrackTintColor="#535353"
          thumbTintColor="#1DB954"
        />
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity onPress={playPrevious} style={styles.controlButton}>
          <Ionicons name="play-skip-back" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={32} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={playNext} style={styles.controlButton}>
          <Ionicons name="play-skip-forward" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const formatTime = (milliseconds: number) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#121212',
    borderRadius: 12,
  },
  artworkContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  artwork: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  placeholderArtwork: {
    width: 200,
    height: 200,
    borderRadius: 8,
    backgroundColor: '#282828',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  artist: {
    fontSize: 16,
    color: '#b3b3b3',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  timeText: {
    color: '#b3b3b3',
    fontSize: 12,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    padding: 10,
  },
  playButton: {
    backgroundColor: '#1DB954',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
});
