import Header from '@/components/Header';
import { usePlayerStore } from '@/store/usePlayerStore';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import {
  Button,
  Card,
  Dialog,
  Divider,
  IconButton,
  List,
  Menu,
  Portal,
  Searchbar,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
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
    preamp: 50,
    reverb: 0,
  });
  const [showSleepTimer, setShowSleepTimer] = useState(false);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState(30);
  const [sleepTimerActive, setSleepTimerActive] = useState(false);
  const [sleepTimerId, setSleepTimerId] = useState<number | null>(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyrics, setLyrics] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // New features state
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showTrackDetails, setShowTrackDetails] = useState(false);
  const [showTagEditor, setShowTagEditor] = useState(false);
  const [editingTrack, setEditingTrack] = useState<LocalTrack | null>(null);
  const [showPlaybackSpeed, setShowPlaybackSpeed] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [pitchCorrection, setPitchCorrection] = useState(true);
  const [showQueue, setShowQueue] = useState(false);
  const [sortBy, setSortBy] = useState<'title' | 'artist' | 'duration'>('title');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [crossfadeDuration, setCrossfadeDuration] = useState(0);
  const [showCrossfadeDialog, setShowCrossfadeDialog] = useState(false);

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
    shuffledTracks,
    setShuffledTracks,
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
        first: 200, // Fetch more tracks
      });

      const tracksWithInfo = await Promise.all(
        assets.map(async (asset) => {
          // No need to call getAssetInfoAsync for every asset, it's slow.
          // Most info is in the asset object itself.
          return {
            id: asset.id,
            title: asset.filename.replace(/\.[^/.]+$/, ''),
            artist: 'Unknown Artist', // MediaLibrary doesn't provide artist metadata easily
            duration: asset.duration * 1000, // Convert to ms
            uri: asset.uri,
            artwork: undefined, // Will be fetched on demand
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
    // Crossfade logic - removing gradual volume change as it's not supported
    if (sound && isPlaying && crossfadeDuration > 0) {
      // The idea of crossfade is to start the new track while fading out the old one.
      // A simple implementation is to just start the next track.
      // The visual/audio effect of a real crossfade is more complex.
    }

    try {
      // Unload previous sound if it exists
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound, status } = await Audio.Sound.createAsync(
        { uri: track.uri },
        {
          shouldPlay: true,
          volume: equalizerSettings.volume / 100,
          rate: playbackSpeed,
          shouldCorrectPitch: pitchCorrection,
          isLooping: repeatMode === 'one',
        },
        onPlaybackStatusUpdate
      );

      if (status.isLoaded) {
        setSound(newSound);
        setCurrentTrack(track);

        if (crossfadeDuration > 0) {
          // With gradual volume change removed, this part is not needed.
        }

        setIsPlaying(true);
      } else {
        throw new Error('Track could not be loaded.');
      }
    } catch (error) {
      console.error('Error in loadAndPlayTrack:', error);
      setError(`Could not play ${track.title}. The file may be corrupt or unsupported.`);
    }
  };

  const onPlaybackStatusUpdate = useCallback(
    (status: any) => {
      if (!status.isLoaded) {
        if (status.error) {
          console.error(`Playback Error: ${status.error}`);
          // Try playing next track
          const currentQueue = isShuffle ? shuffledTracks : tracks;
          const currentIndex = currentQueue.findIndex(t => t.id === currentTrack?.id);
          const nextIndex = (currentIndex + 1) % currentQueue.length;
          loadAndPlayTrack(currentQueue[nextIndex]);
        }
        return;
      }

      setDuration(status.durationMillis);
      setPosition(status.positionMillis);
      setIsPlaying(status.isPlaying);

      if (status.didJustFinish && !status.isLooping) {
        const currentQueue = isShuffle ? shuffledTracks : tracks;
        const currentIndex = currentQueue.findIndex(t => t.id === currentTrack?.id);
        const nextIndex = (currentIndex + 1) % currentQueue.length;
        loadAndPlayTrack(currentQueue[nextIndex]);
      }
    },
    [isShuffle, tracks, currentTrack, loadAndPlayTrack, shuffledTracks]
  );

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

  const onSliderValueChange = async (value: number) => {
    if (sound) {
      try {
        await sound.setPositionAsync(value);
      } catch (error) {
        console.error('Error seeking:', error);
      }
    }
  };

  // --- New Feature Handlers ---

  const onSort = (by: 'title' | 'artist' | 'duration') => {
    setSortBy(by);
    setShowSortMenu(false);
  };

  const sortedTracks = useMemo(() => {
    return [...tracks].sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'artist') return a.artist.localeCompare(b.artist);
      if (sortBy === 'duration') return a.duration - b.duration;
      return 0;
    });
  }, [tracks, sortBy]);

  const filteredTracks = sortedTracks.filter(
    (track) =>
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const playNext = useCallback(async () => {
    if (!currentTrack) return;
    const currentQueue = isShuffle ? shuffledTracks : sortedTracks;
    const currentIndex = currentQueue.findIndex((t: LocalTrack) => t.id === currentTrack.id);

    if (repeatMode === 'one') {
      sound?.replayAsync();
      return;
    }

    let nextIndex;
    if (currentIndex === -1 || currentIndex === currentQueue.length - 1) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        // Stop playback if at the end of the list and not repeating
        setIsPlaying(false);
        sound?.pauseAsync();
        return;
      }
    } else {
      nextIndex = currentIndex + 1;
    }

    if (currentQueue[nextIndex]) {
      loadAndPlayTrack(currentQueue[nextIndex]);
    }
  }, [currentTrack, tracks, isShuffle, shuffledTracks, repeatMode, sortedTracks]);

  const playPrevious = useCallback(async () => {
    if (!currentTrack) return;
    const currentQueue = isShuffle ? shuffledTracks : sortedTracks;
    const currentIndex = currentQueue.findIndex((t: LocalTrack) => t.id === currentTrack.id);

    const prevIndex = (currentIndex - 1 + currentQueue.length) % currentQueue.length;
    if (currentQueue[prevIndex]) {
      await loadAndPlayTrack(currentQueue[prevIndex]);
    }
  }, [currentTrack, tracks, isShuffle, shuffledTracks, sortedTracks]);

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
    if (sleepTimerId) clearTimeout(sleepTimerId);
    const timer = setTimeout(() => {
      sound?.pauseAsync();
      setIsPlaying(false);
      setSleepTimerActive(false);
      setSleepTimerId(null);
    }, sleepTimerMinutes * 60 * 1000);
    setSleepTimerId(timer);
    setSleepTimerActive(true);
  };

  const cancelSleepTimer = () => {
    if (sleepTimerId) {
      clearTimeout(sleepTimerId);
      setSleepTimerId(null);
      setSleepTimerActive(false);
    }
  };

  const fetchLyrics = async (track: LocalTrack) => {
    // Mock implementation
    setLyrics(`Lyrics for ${track.title} are not available yet.`);
  };

  const toggleFavorite = (trackId: string) => {
    setFavorites((prev) =>
      prev.includes(trackId) ? prev.filter((id) => id !== trackId) : [...prev, trackId]
    );
  };

  const isFavorite = (trackId: string) => favorites.includes(trackId);

  const shareTrack = async (track: LocalTrack) => {
    try {
      await Share.share({
        message: `Check out this track: ${track.title} by ${track.artist}`,
        // For local files, URI might not be shareable directly.
        // This is a basic implementation.
        url: track.uri,
      });
    } catch (error: any) {
      setError(error.message);
    }
  };

  const deleteTrack = async (track: LocalTrack) => {
    try {
      await MediaLibrary.deleteAssetsAsync([track.id]);
      setTracks((prev) => prev.filter((t) => t.id !== track.id));
      if (currentTrack?.id === track.id) {
        playNext();
      }
    } catch (error) {
      console.error('Error deleting track:', error);
      setError('Could not delete the track.');
    }
  };

  const setAsRingtone = (track: LocalTrack) => {
    // This is a placeholder for a complex, platform-specific feature.
    setError('Setting as ringtone is not yet implemented.');
  };

  const currentQueue = isShuffle ? shuffledTracks : filteredTracks;
  const currentQueueIndex = currentTrack ? currentQueue.findIndex((t) => t.id === currentTrack.id) : -1;
  const upcomingTracks = currentQueueIndex !== -1 ? currentQueue.slice(currentQueueIndex + 1, currentQueueIndex + 11) : [];

  const handleShuffle = () => {
    const newShuffleState = !isShuffle;
    setIsShuffle(newShuffleState);
    if (newShuffleState) {
      const shuffled = [...filteredTracks].sort(() => Math.random() - 0.5);
      setShuffledTracks(shuffled);
    }
  };

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
                setSelectedTrack(item);
                setShowPlaylistDialog(true);
              }}
              title="Add to Playlist"
              leadingIcon="playlist-plus"
            />
            <Menu.Item
              onPress={() => {
                fetchLyrics(item);
                setShowLyrics(true);
                setSelectedTrack(null);
              }}
              title="Show Lyrics"
              leadingIcon="text-box-search"
            />
            <Divider />
            <Menu.Item
              onPress={() => {
                setEditingTrack(item);
                setShowTrackDetails(true);
                setSelectedTrack(null);
              }}
              title="View Details"
              leadingIcon="information-outline"
            />
            <Menu.Item
              onPress={() => {
                setEditingTrack(item);
                setShowTagEditor(true);
                setSelectedTrack(null);
              }}
              title="Edit Tags"
              leadingIcon="pencil"
            />
            <Menu.Item
              onPress={() => {
                setAsRingtone(item);
                setSelectedTrack(null);
              }}
              title="Set as Ringtone"
              leadingIcon="cellphone-sound"
            />
            <Divider />
            <Menu.Item
              onPress={() => {
                deleteTrack(item);
                setSelectedTrack(null);
              }}
              title="Delete from Device"
              leadingIcon="delete"
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

  const renderPlayerHeader = () => (
    <>
      <View style={styles.searchSortContainer}>
        <Searchbar
          placeholder="Search your music..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={theme.colors.primary}
        />
        <Menu
          visible={showSortMenu}
          onDismiss={() => setShowSortMenu(false)}
          anchor={
            <IconButton
              icon="sort"
              onPress={() => setShowSortMenu(true)}
              style={styles.sortButton}
            />
          }
        >
          <Menu.Item onPress={() => onSort('title')} title="Sort by Title" />
          <Menu.Item onPress={() => onSort('artist')} title="Sort by Artist" />
          <Menu.Item onPress={() => onSort('duration')} title="Sort by Duration" />
        </Menu>
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
              <View style={styles.titleContainer}>
                <Text style={styles.currentTitle} numberOfLines={1}>
                  {currentTrack.title}
                </Text>
                <IconButton
                  icon={isFavorite(currentTrack.id) ? 'heart' : 'heart-outline'}
                  size={24}
                  iconColor={isFavorite(currentTrack.id) ? theme.colors.primary : theme.colors.onSurfaceVariant}
                  onPress={() => toggleFavorite(currentTrack.id)}
                  style={styles.favoriteButton}
                />
              </View>

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
                onSlidingComplete={onSliderValueChange}
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
                onPress={handleShuffle}
              />
              <IconButton
                icon="skip-previous"
                size={32}
                iconColor={theme.colors.primary}
                onPress={playPrevious}
              />
              <IconButton
                icon={isPlaying ? 'pause-circle' : 'play-circle'}
                size={64}
                iconColor={theme.colors.primary}
                onPress={togglePlayback}
                style={styles.playPauseButton}
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
                    repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off'
                  )
                }
              />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.additionalControlsContainer}>
              <Button icon="equalizer" onPress={() => setShowEqualizer(true)} style={styles.iconButton}>Equalizer</Button>
              <Button icon="timer-outline" onPress={() => setShowSleepTimer(true)} style={styles.iconButton}>Sleep Timer</Button>
              <Button icon="share-variant" onPress={() => currentTrack && shareTrack(currentTrack)} style={styles.iconButton}>Share</Button>
              <Button icon="playlist-music" onPress={() => setShowQueue(true)} style={styles.iconButton}>Queue</Button>
              <Button icon="swap-horizontal-bold" onPress={() => setShowCrossfadeDialog(true)} style={styles.iconButton}>Crossfade</Button>
              <Button icon="run-fast" onPress={() => setShowPlaybackSpeed(true)} style={styles.iconButton}>Speed</Button>
            </ScrollView>
          </Card>
        </Animated.View>
      )}
    </>
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
      <FlatList
        data={filteredTracks}
        renderItem={renderTrackItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderPlayerHeader}
        contentContainerStyle={styles.trackListContainer}
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
          <Dialog.Title>Equalizer & Effects</Dialog.Title>
          <Dialog.Content>
            <View style={styles.equalizerRow}>
              <Text style={styles.equalizerLabel}>Pre-amp</Text>
              <Slider
                style={styles.equalizerSlider}
                minimumValue={0}
                maximumValue={100}
                step={1}
                value={equalizerSettings.preamp}
                onValueChange={(value) => 
                  setEqualizerSettings({...equalizerSettings, preamp: value})
                }
                minimumTrackTintColor={theme.colors.primary}
                thumbTintColor={theme.colors.primary}
              />
            </View>
            <View style={styles.equalizerRow}>
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
            </View>
            <View style={styles.equalizerRow}>
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
            </View>
            <View style={styles.equalizerRow}>
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
            </View>
            <View style={styles.equalizerRow}>
              <Text style={styles.equalizerLabel}>Reverb</Text>
              <Slider
                style={styles.equalizerSlider}
                minimumValue={0}
                maximumValue={100}
                step={1}
                value={equalizerSettings.reverb}
                onValueChange={(value) => 
                  setEqualizerSettings({...equalizerSettings, reverb: value})
                }
                minimumTrackTintColor={theme.colors.primary}
                thumbTintColor={theme.colors.primary}
              />
            </View>
            <View style={styles.equalizerRow}>
              <Text style={styles.equalizerLabel}>Volume</Text>
              <Slider
                style={styles.equalizerSlider}
                minimumValue={0}
                maximumValue={100}
                step={1}
                value={equalizerSettings.volume}
                onValueChange={(value) => {
                  setEqualizerSettings({ ...equalizerSettings, volume: value });
                  sound?.setVolumeAsync(value / 100);
                }}
                minimumTrackTintColor={theme.colors.primary}
                thumbTintColor={theme.colors.primary}
              />
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowEqualizer(false)}>Done</Button>
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

        {/* New Dialogs */}
        <Dialog visible={showQueue} onDismiss={() => setShowQueue(false)}>
          <Dialog.Title>Up Next</Dialog.Title>
          <Dialog.Content>
            <FlatList
              data={upcomingTracks}
              keyExtractor={(item) => `queue-${item.id}`}
              renderItem={({ item }) => (
                <List.Item
                  title={item.title}
                  description={item.artist}
                  onPress={() => loadAndPlayTrack(item)}
                />
              )}
              ListEmptyComponent={<Text>Queue is empty.</Text>}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowQueue(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={showCrossfadeDialog} onDismiss={() => setShowCrossfadeDialog(false)}>
          <Dialog.Title>Crossfade</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogLabel}>Fade duration: {crossfadeDuration.toFixed(1)}s</Text>
            <Slider
              style={styles.dialogSlider}
              minimumValue={0}
              maximumValue={10}
              step={0.5}
              value={crossfadeDuration}
              onValueChange={setCrossfadeDuration}
              minimumTrackTintColor={theme.colors.primary}
              thumbTintColor={theme.colors.primary}
            />
          </Dialog.Content>
        </Dialog>

        <Dialog visible={showPlaybackSpeed} onDismiss={() => setShowPlaybackSpeed(false)}>
          <Dialog.Title>Playback Speed</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogLabel}>Speed: {playbackSpeed.toFixed(2)}x</Text>
            <Slider
              style={styles.dialogSlider}
              minimumValue={0.5}
              maximumValue={2.0}
              step={0.05}
              value={playbackSpeed}
              onSlidingComplete={(value) => {
                setPlaybackSpeed(value);
                sound?.setRateAsync(value, pitchCorrection);
              }}
              minimumTrackTintColor={theme.colors.primary}
              thumbTintColor={theme.colors.primary}
            />
            <View style={styles.switchContainer}>
              <Text>Pitch Correction</Text>
              <Switch value={pitchCorrection} onValueChange={setPitchCorrection} />
            </View>
          </Dialog.Content>
        </Dialog>

        <Dialog visible={showTrackDetails && !!editingTrack} onDismiss={() => setShowTrackDetails(false)}>
          <Dialog.Title>Track Details</Dialog.Title>
          <Dialog.Content>
            <Text>Title: {editingTrack?.title}</Text>
            <Text>Artist: {editingTrack?.artist}</Text>
            <Text>Duration: {formatTime(editingTrack?.duration ?? 0)}</Text>
            <Text>File URI: {editingTrack?.uri}</Text>
          </Dialog.Content>
        </Dialog>
        
        <Dialog visible={showTagEditor && !!editingTrack} onDismiss={() => setShowTagEditor(false)}>
          <Dialog.Title>Edit Tags</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Title" value={editingTrack?.title} style={styles.textInput}/>
            <TextInput label="Artist" value={editingTrack?.artist} style={styles.textInput}/>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowTagEditor(false)}>Cancel</Button>
            <Button onPress={() => setShowTagEditor(false)}>Save</Button>
          </Dialog.Actions>
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
  additionalControlsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: 'center',
  },
  trackListContainer: {
    paddingBottom: 16,
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
  equalizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  equalizerLabel: {
    fontSize: 16,
    width: 60,
  },
  equalizerSlider: {
    flex: 1,
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
  dialogLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  dialogSlider: {
    width: '100%',
    height: 40,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  textInput: {
    marginBottom: 8,
  },
  searchSortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sortButton: {
    marginLeft: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  favoriteButton: {
    marginLeft: 8,
  },
  playPauseButton: {
    margin: 0,
  },
  iconButton: {
    marginHorizontal: 4,
  },
});

