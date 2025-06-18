import Header from '@/components/Header';
import { usePlayerStore } from '@/store/usePlayerStore';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, FlatList, Image, Platform, StyleSheet, View } from 'react-native';
import { Button, Card, Dialog, IconButton, List, Menu, Portal, Searchbar, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const fadeAnim = new Animated.Value(1);

interface LocalTrack {
  id: string;
  title: string;
  artist: string;
  duration: number;
  uri: string;
  artwork?: string;
}

interface Playlist {
  id: string;
  name: string;
  tracks: LocalTrack[];
}

function formatTime(milliseconds: number) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function PlayerScreen() {
  const theme = useTheme();
  const [tracks, setTracks] = useState<LocalTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<LocalTrack | null>(null);
  const [showEqualizer, setShowEqualizer] = useState(false);
  const [equalizerSettings, setEqualizerSettings] = useState({
    bass: 50,
    mid: 50,
    treble: 50,
    volume: 70,
  });
  const [showSleepTimer, setShowSleepTimer] = useState(false);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState(30);
  const [sleepTimerActive, setSleepTimerActive] = useState(false);
  const [sleepTimerId, setSleepTimerId] = useState<NodeJS.Timeout | null>(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyrics, setLyrics] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const {
    sound,
    currentTrack,
    isPlaying,
    duration,
    position,
    isShuffle,
    repeatMode,
    setSound,
    setCurrentTrack,
    setIsPlaying,
    setDuration,
    setPosition,
    setIsShuffle,
    setRepeatMode,
    reset,
  } = usePlayerStore();

  useEffect(() => {
    setupAudio();
    requestPermissions();
    loadTracks();
    return () => {
      cleanupAudio();
    };
  }, []);

  const requestPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
        if (mediaStatus !== 'granted') {
          console.log('Media library permission not granted');
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  };

  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        interruptionModeIOS: 1,
        interruptionModeAndroid: 1,
      });
    } catch (error) {
      console.error('Error setting up audio:', error);
    }
  };

  const cleanupAudio = async () => {
    if (sound) {
      await sound.unloadAsync();
      reset();
    }
  };

  const loadTracks = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setError('Permission to access media library was denied');
        setIsLoading(false);
        return;
      }

      const { assets } = await MediaLibrary.getAssetsAsync({
        mediaType: 'audio',
        first: 100,
      });

      const tracksWithInfo = await Promise.all(
        assets.map(async (asset) => {
          const info = await MediaLibrary.getAssetInfoAsync(asset);
          return {
            id: asset.id,
            title: asset.filename.replace(/\.[^/.]+$/, ''),
            artist: 'Unknown Artist',
            duration: asset.duration || 0,
            uri: asset.uri,
            artwork: info.uri,
          };
        })
      );

      setTracks(tracksWithInfo);
      if (tracksWithInfo.length > 0 && !currentTrack) {
        setCurrentTrack(tracksWithInfo[0]);
      }
    } catch (error) {
      console.error('Error loading tracks:', error);
      setError('Failed to load tracks. Please check your permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  const cleanupSound = async () => {
    if (sound) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        console.error('Error unloading sound:', error);
      }
    }
  };

  const loadAndPlayTrack = async (track: LocalTrack) => {
    try {
      // Fade out current track
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(async () => {
        try {
          // Unload previous sound if it exists
          if (sound) {
            await sound.unloadAsync();
          }

          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: track.uri },
            { shouldPlay: false },
            onPlaybackStatusUpdate
          );

          // Wait for the sound to be loaded
          const status = await newSound.getStatusAsync();
          if (!status.isLoaded) {
            console.log('Waiting for sound to load...');
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          setSound(newSound);
          setCurrentTrack(track);

          // Fade in new track
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();

          await newSound.playAsync();
          setIsPlaying(true);
        } catch (error) {
          console.error('Error in loadAndPlayTrack:', error);
          // Reset animation if there's an error
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }
      });
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  const onPlaybackStatusUpdate = useCallback((status: any) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis);
      setPosition(status.positionMillis);
      setIsPlaying(status.isPlaying);

      if (status.didJustFinish) {
        if (repeatMode === 'one') {
          sound?.replayAsync();
        } else if (repeatMode === 'all' || repeatMode === 'off') {
          const currentIndex = tracks.findIndex(t => t.id === currentTrack?.id);
          const nextIndex = (currentIndex + 1) % tracks.length;
          
          // If this is the last track and repeatMode is 'off', only play next if not the last track
          if (repeatMode === 'off' && currentIndex === tracks.length - 1 && tracks.length > 0) {
            sound?.pauseAsync();
            setIsPlaying(false);
          } else {
            loadAndPlayTrack(tracks[nextIndex]);
          }
        }
      }
    }
  }, [repeatMode, sound, currentTrack, tracks]);

  const togglePlayback = async () => {
    if (!sound) return;

    try {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  const playNext = useCallback(async () => {
    if (!currentTrack) return;
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    await cleanupSound();
    await loadAndPlayTrack(tracks[nextIndex]);
  }, [currentTrack, tracks]);

  const playPrevious = useCallback(async () => {
    if (!currentTrack) return;
    const currentIndex = tracks.findIndex(t => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    await cleanupSound();
    await loadAndPlayTrack(tracks[prevIndex]);
  }, [currentTrack, tracks]);

  const onSliderValueChange = async (value: number) => {
    if (sound) {
      try {
        const status = await sound.getStatusAsync();
        if (!status.isLoaded) {
          console.log('Sound not loaded yet, waiting...');
          return;
        }

        const wasPlaying = isPlaying;
        if (wasPlaying) {
          await sound.pauseAsync();
        }
        await sound.setPositionAsync(value);
        if (wasPlaying) {
          await sound.playAsync();
        }
      } catch (error) {
        console.error('Error seeking:', error);
      }
    }
  };

  const createPlaylist = (name: string) => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      tracks: [],
    };
    setPlaylists([...playlists, newPlaylist]);
  };

  const addToPlaylist = (playlistId: string, track: LocalTrack) => {
    setPlaylists(playlists.map(playlist => {
      if (playlist.id === playlistId) {
        return {
          ...playlist,
          tracks: [...playlist.tracks, track],
        };
      }
      return playlist;
    }));
  };

  const startSleepTimer = () => {
    // Clear any existing timer
    if (sleepTimerId) {
      clearTimeout(sleepTimerId);
    }
    
    const timer = setTimeout(() => {
      if (sound) {
        sound.pauseAsync();
        setIsPlaying(false);
      }
      setSleepTimerActive(false);
      setSleepTimerId(null);
    }, sleepTimerMinutes * 60 * 1000);
    
    setSleepTimerId(timer as unknown as NodeJS.Timeout);
    setSleepTimerActive(true);
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  };
  
  const cancelSleepTimer = () => {
    if (sleepTimerId) {
      clearTimeout(sleepTimerId);
      setSleepTimerId(null);
      setSleepTimerActive(false);
    }
  };

  const fetchLyrics = async (track: LocalTrack) => {
    // Implement lyrics fetching logic here
    setLyrics('Lyrics not available');
  };

  const filteredTracks = tracks.filter(track =>
    track.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTrackItem = ({ item }: { item: LocalTrack }) => (
    <List.Item
      title={item.title}
      description={item.artist}
      left={props => (
        <Image
          source={item.artwork ? { uri: item.artwork } : require('../../assets/images/icon.png')}
          style={styles.trackArtwork}
        />
      )}
      right={props => (
        <View style={styles.trackActions}>
          <Text style={[styles.duration, { color: theme.colors.onSurfaceVariant }]}>
            {formatTime(item.duration)}
          </Text>
          <Menu
            visible={selectedTrack?.id === item.id}
            onDismiss={() => setSelectedTrack(null)}
            anchor={
              <IconButton
                icon="dots-vertical"
                onPress={() => setSelectedTrack(item)}
              />
            }
          >
            <Menu.Item
              onPress={() => {
                setSelectedTrack(null);
                setShowPlaylistDialog(true);
              }}
              title="Add to Playlist"
            />
            <Menu.Item
              onPress={() => {
                setSelectedTrack(null);
                fetchLyrics(item);
                setShowLyrics(true);
              }}
              title="Show Lyrics"
            />
          </Menu>
        </View>
      )}
      onPress={() => loadAndPlayTrack(item)}
      style={[
        styles.trackItem,
        currentTrack?.id === item.id && { backgroundColor: theme.colors.surfaceVariant }
      ]}
    />
  );

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['left', 'right', 'bottom']}>
        <Header title="Player" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
            Loading your music...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['left', 'right', 'bottom']}>
        <Header title="Player" />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
          <Button 
            mode="contained" 
            onPress={loadTracks}
            style={styles.retryButton}
          >
            Retry
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left', 'right', 'bottom']}>
      <Header title="Player" />
      <View style={[styles.searchContainer, { paddingTop: 16 }]}>
        <Searchbar
          placeholder="Search your music..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={theme.colors.primary}
        />
      </View>

      {currentTrack && (
        <Animated.View style={{ opacity: fadeAnim }}>
          <Card style={[styles.nowPlayingCard, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Card.Cover
              source={
                currentTrack.artwork
                  ? { uri: currentTrack.artwork }
                  : require('../../assets/images/icon.png')
              }
              style={styles.currentArtwork}
            />
            <Card.Content style={styles.nowPlayingInfo}>
              <Text style={styles.currentTitle} numberOfLines={1}>
                {currentTrack.title}
              </Text>
              <Text style={[styles.currentArtist, { color: theme.colors.onSurfaceVariant }]}>
                {currentTrack.artist}
              </Text>
            </Card.Content>

            <View style={styles.progressContainer}>
              <Slider
                style={styles.progressBar}
                minimumValue={0}
                maximumValue={duration}
                value={position}
                onValueChange={onSliderValueChange}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.surfaceVariant}
                thumbTintColor={theme.colors.primary}
              />
              <View style={styles.timeContainer}>
                <Text style={[styles.timeText, { color: theme.colors.onSurfaceVariant }]}>
                  {formatTime(position)}
                </Text>
                <Text style={[styles.timeText, { color: theme.colors.onSurfaceVariant }]}>
                  {formatTime(duration)}
                </Text>
              </View>
            </View>

            <View style={styles.controls}>
              <IconButton
                icon={isShuffle ? 'shuffle-variant' : 'shuffle'}
                size={24}
                iconColor={isShuffle ? theme.colors.primary : theme.colors.onSurfaceVariant}
                onPress={() => setIsShuffle(!isShuffle)}
              />
              <IconButton
                icon="skip-previous"
                size={32}
                iconColor={theme.colors.primary}
                onPress={playPrevious}
              />
              <IconButton
                icon={isPlaying ? 'pause' : 'play'}
                size={48}
                iconColor={theme.colors.primary}
                onPress={togglePlayback}
              />
              <IconButton
                icon="skip-next"
                size={32}
                iconColor={theme.colors.primary}
                onPress={playNext}
              />
              <IconButton
                icon={repeatMode === 'all' ? 'repeat' : repeatMode === 'one' ? 'repeat-once' : 'repeat-off'}
                size={24}
                iconColor={repeatMode !== 'off' ? theme.colors.primary : theme.colors.onSurfaceVariant}
                onPress={() =>
                  setRepeatMode(
                    repeatMode === 'off'
                      ? 'all'
                      : repeatMode === 'all'
                      ? 'one'
                      : 'off'
                  )
                }
              />
            </View>

            <View style={styles.additionalControls}>
              <IconButton
                icon="equalizer"
                size={24}
                iconColor={theme.colors.onSurfaceVariant}
                onPress={() => setShowEqualizer(true)}
              />
              <View>
                <IconButton
                  icon="timer"
                  size={24}
                  iconColor={sleepTimerActive ? theme.colors.primary : theme.colors.onSurfaceVariant}
                  onPress={() => setShowSleepTimer(true)}
                />
                {sleepTimerActive && (
                  <View style={styles.timerActiveDot} />
                )}
              </View>
              <IconButton
                icon="format-list-bulleted"
                size={24}
                iconColor={theme.colors.onSurfaceVariant}
                onPress={() => setShowPlaylistDialog(true)}
              />
            </View>
          </Card>
        </Animated.View>
      )}

      <FlatList
        data={filteredTracks}
        renderItem={renderTrackItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.trackList}
        showsVerticalScrollIndicator={false}
      />

      <Portal>
        <Dialog visible={showPlaylistDialog} onDismiss={() => setShowPlaylistDialog(false)}>
          <Dialog.Title>Add to Playlist</Dialog.Title>
          <Dialog.Content>
            {playlists.map(playlist => (
              <List.Item
                key={playlist.id}
                title={playlist.name}
                onPress={() => {
                  if (selectedTrack) {
                    addToPlaylist(playlist.id, selectedTrack);
                  }
                  setShowPlaylistDialog(false);
                }}
              />
            ))}
            <Button
              mode="contained"
              onPress={() => {
                createPlaylist('New Playlist');
              }}
              style={styles.createPlaylistButton}
            >
              Create New Playlist
            </Button>
          </Dialog.Content>
        </Dialog>

        <Dialog visible={showEqualizer} onDismiss={() => setShowEqualizer(false)}>
          <Dialog.Title>Equalizer</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.equalizerLabel}>Bass</Text>
            <Slider
              style={styles.equalizerSlider}
              minimumValue={0}
              maximumValue={100}
              step={1}
              value={equalizerSettings.bass}
              onValueChange={(value) => 
                setEqualizerSettings({...equalizerSettings, bass: value})
              }
              minimumTrackTintColor={theme.colors.primary}
              thumbTintColor={theme.colors.primary}
            />
            
            <Text style={styles.equalizerLabel}>Mid</Text>
            <Slider
              style={styles.equalizerSlider}
              minimumValue={0}
              maximumValue={100}
              step={1}
              value={equalizerSettings.mid}
              onValueChange={(value) => 
                setEqualizerSettings({...equalizerSettings, mid: value})
              }
              minimumTrackTintColor={theme.colors.primary}
              thumbTintColor={theme.colors.primary}
            />
            
            <Text style={styles.equalizerLabel}>Treble</Text>
            <Slider
              style={styles.equalizerSlider}
              minimumValue={0}
              maximumValue={100}
              step={1}
              value={equalizerSettings.treble}
              onValueChange={(value) => 
                setEqualizerSettings({...equalizerSettings, treble: value})
              }
              minimumTrackTintColor={theme.colors.primary}
              thumbTintColor={theme.colors.primary}
            />
            
            <Text style={styles.equalizerLabel}>Volume</Text>
            <Slider
              style={styles.equalizerSlider}
              minimumValue={0}
              maximumValue={100}
              step={1}
              value={equalizerSettings.volume}
              onValueChange={(value) => 
                setEqualizerSettings({...equalizerSettings, volume: value})
              }
              minimumTrackTintColor={theme.colors.primary}
              thumbTintColor={theme.colors.primary}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowEqualizer(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={showSleepTimer} onDismiss={() => setShowSleepTimer(false)}>
          <Dialog.Title>Sleep Timer</Dialog.Title>
          <Dialog.Content>
            {sleepTimerActive ? (
              <View style={styles.sleepTimerActiveContainer}>
                <Text style={styles.sleepTimerActiveText}>
                  Sleep timer active: {sleepTimerMinutes} minutes
                </Text>
                <Button 
                  mode="contained" 
                  onPress={() => {
                    cancelSleepTimer();
                    setShowSleepTimer(false);
                  }}
                  style={styles.cancelTimerButton}
                >
                  Cancel Timer
                </Button>
              </View>
            ) : (
              <>
                <Text>Set timer (minutes):</Text>
                <Slider
                  style={styles.sleepTimerSlider}
                  minimumValue={5}
                  maximumValue={120}
                  step={5}
                  value={sleepTimerMinutes}
                  onValueChange={setSleepTimerMinutes}
                />
                <Text>{sleepTimerMinutes} minutes</Text>
              </>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowSleepTimer(false)}>Cancel</Button>
            {!sleepTimerActive && (
              <Button onPress={() => {
                startSleepTimer();
                setShowSleepTimer(false);
              }}>Start</Button>
            )}
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={showLyrics} onDismiss={() => setShowLyrics(false)}>
          <Dialog.Title>Lyrics</Dialog.Title>
          <Dialog.Content>
            <Text>{lyrics}</Text>
          </Dialog.Content>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  searchContainer: {
    padding: 16,
    paddingTop: 8,
  },
  searchBar: {
    elevation: 2,
    borderRadius: 12,
  },
  nowPlayingCard: {
    margin: 16,
    borderRadius: 16,
    elevation: 4,
  },
  currentArtwork: {
    height: width * 0.8,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  nowPlayingInfo: {
    padding: 16,
    alignItems: 'center',
  },
  currentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  currentArtist: {
    fontSize: 16,
  },
  progressContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  progressBar: {
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
    paddingBottom: 16,
  },
  additionalControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 16,
  },
  trackList: {
    padding: 16,
  },
  trackItem: {
    borderRadius: 8,
    marginBottom: 8,
  },
  trackArtwork: {
    width: 48,
    height: 48,
    borderRadius: 4,
  },
  trackActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  duration: {
    fontSize: 12,
    marginRight: 8,
  },
  createPlaylistButton: {
    marginTop: 16,
  },
  sleepTimerSlider: {
    width: '100%',
    height: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginBottom: 16,
    fontSize: 16,
  },
  retryButton: {
    marginTop: 16,
  },
  equalizerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  equalizerSlider: {
    width: '100%',
    height: 40,
  },
  sleepTimerActiveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sleepTimerActiveText: {
    fontSize: 16,
  },
  cancelTimerButton: {
    marginLeft: 16,
  },
  timerActiveDot: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  timerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'red',
  },
});
