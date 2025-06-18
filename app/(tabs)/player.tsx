import Header from '@/components/Header';
import { PlayerControls } from '@/components/PlayerControls';
import { MusicMetadataService } from '@/services/MusicMetadataService';
import { OpenSubtitlesService } from '@/services/OpenSubtitlesService';
import { StorageService } from '@/services/StorageService';
import { FlashList } from '@shopify/flash-list';
import { Audio } from 'expo-av';
import { Image } from 'expo-image';
import * as MediaLibrary from 'expo-media-library';
import React, { useEffect, useState } from 'react';
import { Share, StyleSheet, View } from 'react-native';
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
  Surface,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const defaultThumbnail = require('../../assets/images/icon.png');

interface LocalTrack {
  id: string;
  filename: string;
  uri: string;
  duration: number;
  title: string;
  artist?: string;
  album?: string;
  artwork?: string | null;
  genre?: string;
  year?: string;
}

interface Playlist {
  id: string;
  name: string;
  tracks: LocalTrack[];
}

export default function PlayerScreen() {
  const theme = useTheme();
  const [tracks, setTracks] = useState<LocalTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [sortOption, setSortOption] = useState<'Title' | 'Duration'>('Title');
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>('off');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [menuVisibleId, setMenuVisibleId] = useState<string | null>(null);
  const [soundObj, setSoundObj] = useState<Audio.Sound | null>(null);
  const [currentId, setCurrentId] = useState<string | null>(null);

  // Playlist management
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);
  const [selectedForPlaylist, setSelectedForPlaylist] = useState<LocalTrack | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  // Lyrics dialog
  const [showLyricsDialog, setShowLyricsDialog] = useState(false);
  const [lyricsText, setLyricsText] = useState('');

  // Details dialog
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [detailsTrack, setDetailsTrack] = useState<LocalTrack | null>(null);

  // Sleep timer
  const [showSleepDialog, setShowSleepDialog] = useState(false);
  const [sleepMinutes, setSleepMinutes] = useState('5');
  const [sleepTimerId, setSleepTimerId] = useState<any>(null);

  // Playback speed
  const [showSpeedDialog, setShowSpeedDialog] = useState(false);
  const [speed, setSpeed] = useState('1.0');

  // New state for PlayerControls
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTrack, setCurrentTrack] = useState<LocalTrack | null>(null);

  const [metadataService] = useState(() => MusicMetadataService.getInstance());
  const [storageService] = useState(() => StorageService.getInstance());

  // Load persistent data
  useEffect(() => {
    const loadPersistentData = async () => {
      const [savedFavorites, savedPlaylists, settings] = await Promise.all([
        storageService.getFavorites(),
        storageService.getPlaylists(),
        storageService.getSettings()
      ]);

      setFavorites(savedFavorites);
      setPlaylists(savedPlaylists);
      setIsShuffle(settings.isShuffle);
      setRepeatMode(settings.repeatMode);
      setSpeed(settings.playbackSpeed.toString());
      setSleepMinutes(settings.sleepTimerMinutes.toString());
    };

    loadPersistentData();
  }, []);

  // Save favorites when changed
  useEffect(() => {
    storageService.saveFavorites(favorites);
  }, [favorites]);

  // Save playlists when changed
  useEffect(() => {
    storageService.savePlaylists(playlists);
  }, [playlists]);

  // Save settings when changed
  useEffect(() => {
    storageService.saveSettings({
      isShuffle,
      repeatMode,
      playbackSpeed: parseFloat(speed) || 1.0,
      sleepTimerMinutes: parseInt(sleepMinutes, 10) || 5,
      isHighQuality: true,
      isOfflineMode: false,
      isAutoPlay: true,
      isCrossfade: false
    });
  }, [isShuffle, repeatMode, speed, sleepMinutes]);

  // Load tracks with metadata
  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === 'granted') {
        const media = await MediaLibrary.getAssetsAsync({ mediaType: 'audio', first: 200 });
        const allTracks = await Promise.all(
          media.assets.map(async (a) => {
            const metadata = await metadataService.getMetadata(a);
            return {
              id: a.id,
              filename: a.filename,
              uri: a.uri,
              ...metadata,
              duration: Math.round(a.duration * 1000),
            };
          })
        );
        setTracks(allTracks);
      }
      setIsLoading(false);
    })();
    return () => { soundObj?.unloadAsync(); };
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(id) 
        ? prev.filter(x => x !== id) 
        : [...prev, id];
      return newFavorites;
    });
  };

  const onSort = (opt: 'Title' | 'Duration') => {
    setSortOption(opt);
    setSortMenuVisible(false);
  };

  const cycleRepeat = () => {
    setRepeatMode(prev => prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off');
  };

  const playTrack = async (uri: string, id: string) => {
    if (soundObj) {
      await soundObj.unloadAsync();
      setSoundObj(null);
    }
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true },
      (status) => {
        if (status.isLoaded) {
          setPosition(status.positionMillis);
          setDuration(status.durationMillis || 0);
          setIsPlaying(status.isPlaying);
          if (status.didJustFinish) {
            handleTrackEnd();
          }
        }
      }
    );
    setSoundObj(sound);
    setCurrentId(id);
    setCurrentTrack(tracks.find(t => t.id === id) || null);
    setIsPlaying(true);
  };

  const handleTrackEnd = () => {
    if (repeatMode === 'one') {
      soundObj?.replayAsync();
    } else if (repeatMode === 'all') {
      const currentIndex = tracks.findIndex(t => t.id === currentId);
      const nextIndex = (currentIndex + 1) % tracks.length;
      playTrack(tracks[nextIndex].uri, tracks[nextIndex].id);
    } else {
      const currentIndex = tracks.findIndex(t => t.id === currentId);
      if (currentIndex < tracks.length - 1) {
        playTrack(tracks[currentIndex + 1].uri, tracks[currentIndex + 1].id);
      }
    }
  };

  const handlePlayPause = async () => {
    if (!soundObj) return;
    if (isPlaying) {
      await soundObj.pauseAsync();
    } else {
      await soundObj.playAsync();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = async (value: number) => {
    if (!soundObj) return;
    await soundObj.setPositionAsync(value);
    setPosition(value);
  };

  const handleNext = () => {
    if (!currentId) return;
    const currentIndex = tracks.findIndex(t => t.id === currentId);
    const nextIndex = (currentIndex + 1) % tracks.length;
    playTrack(tracks[nextIndex].uri, tracks[nextIndex].id);
  };

  const handlePrevious = () => {
    if (!currentId) return;
    const currentIndex = tracks.findIndex(t => t.id === currentId);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    playTrack(tracks[prevIndex].uri, tracks[prevIndex].id);
  };

  // Dialog handlers
  const handleAddToPlaylist = (track: LocalTrack) => {
    setSelectedForPlaylist(track);
    setShowPlaylistDialog(true);
    setMenuVisibleId(null);
  };
  const addToPlaylist = (playlistId: string) => {
    if (selectedForPlaylist) {
      setPlaylists(prev => prev.map(pl => 
        pl.id === playlistId 
          ? { ...pl, tracks: [...pl.tracks, selectedForPlaylist] } 
          : pl
      ));
      setShowPlaylistDialog(false);
    }
  };
  const createPlaylist = () => {
    if (newPlaylistName.trim()) {
      setPlaylists(prev => [...prev, { 
        id: Date.now().toString(), 
        name: newPlaylistName.trim(), 
        tracks: [] 
      }]);
      setNewPlaylistName('');
    }
  };

  const handleShare = (track: LocalTrack) => {
    Share.share({ message: track.filename, url: track.uri });
  };

  const handleLyrics = async (track: LocalTrack) => {
    setMenuVisibleId(null);
    const results = await OpenSubtitlesService.getInstance().searchSongs(track.filename);
    setLyricsText(results[0]?.title || 'Lyrics not found');
    setShowLyricsDialog(true);
  };

  const handleDetails = (track: LocalTrack) => {
    setDetailsTrack(track);
    setShowDetailsDialog(true);
    setMenuVisibleId(null);
  };

  const handleDelete = async (track: LocalTrack) => {
    await MediaLibrary.deleteAssetsAsync([track.id]);
    setTracks(prev => prev.filter(t => t.id !== track.id));
    setMenuVisibleId(null);
  };

  const startSleepTimer = () => {
    if (sleepTimerId) clearTimeout(sleepTimerId);
    const mins = parseInt(sleepMinutes, 10) || 0;
    const id = setTimeout(() => { soundObj?.pauseAsync(); setCurrentId(null); }, mins * 60000);
    setSleepTimerId(id);
    setShowSleepDialog(false);
    storageService.saveSettings({
      isShuffle: isShuffle,
      repeatMode: repeatMode,
      playbackSpeed: parseFloat(speed) || 1.0,
      sleepTimerMinutes: mins,
      isHighQuality: true,
      isOfflineMode: false,
      isAutoPlay: true,
      isCrossfade: false
    });
  };

  const applySpeed = () => {
    const sp = parseFloat(speed) || 1;
    soundObj?.setRateAsync(sp, true);
    setShowSpeedDialog(false);
    storageService.saveSettings({
      isShuffle: isShuffle,
      repeatMode: repeatMode,
      playbackSpeed: sp,
      sleepTimerMinutes: parseInt(sleepMinutes, 10) || 5,
      isHighQuality: true,
      isOfflineMode: false,
      isAutoPlay: true,
      isCrossfade: false
    });
  };

  // Filter, sort, shuffle
  let displayed = tracks.filter(t => t.filename.toLowerCase().includes(searchQuery.toLowerCase()));
  displayed.sort((a, b) => sortOption === 'Title' ? a.filename.localeCompare(b.filename) : a.duration - b.duration);
  if (isShuffle) displayed = displayed.sort(() => Math.random() - 0.5);

  const renderTrackItem = ({ item }: { item: LocalTrack }) => (
    <Card
      style={[
        styles.trackCard,
        { backgroundColor: theme.colors.surfaceVariant },
        currentId === item.id && { backgroundColor: theme.colors.primaryContainer }
      ]}
      onPress={() => playTrack(item.uri, item.id)}
      mode="elevated"
    >
      <Card.Content style={styles.trackContent}>
        <View style={styles.trackImageContainer}>
          {item.artwork ? (
            <Image
              source={{ uri: item.artwork }}
              style={styles.trackImage}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[styles.trackImage, styles.placeholderImage]}>
              <IconButton icon="music" size={24} />
            </View>
          )}
        </View>
        <View style={styles.trackInfo}>
          <Text variant="titleMedium" numberOfLines={1}>
            {item.title}
          </Text>
          <Text variant="bodySmall" numberOfLines={1} style={{ opacity: 0.7 }}>
            {item.artist}
          </Text>
          {item.album && (
            <Text variant="bodySmall" numberOfLines={1} style={{ opacity: 0.5 }}>
              {item.album}
            </Text>
          )}
        </View>
        <View style={styles.trackActions}>
          <IconButton
            icon={favorites.includes(item.id) ? 'heart' : 'heart-outline'}
            iconColor={theme.colors.primary}
            size={20}
            onPress={() => toggleFavorite(item.id)}
          />
          <Menu
            visible={menuVisibleId === item.id}
            onDismiss={() => setMenuVisibleId(null)}
            anchor={
              <IconButton 
                icon="dots-vertical" 
                onPress={() => setMenuVisibleId(item.id)}
              />
            }
          >
            <Menu.Item 
              onPress={() => {
                handleAddToPlaylist(item);
                setMenuVisibleId(null);
              }} 
              title="Add to Playlist" 
              leadingIcon="playlist-plus" 
            />
            <Menu.Item 
              onPress={() => {
                handleShare(item);
                setMenuVisibleId(null);
              }} 
              title="Share" 
              leadingIcon="share-variant" 
            />
            <Menu.Item 
              onPress={() => {
                handleLyrics(item);
                setMenuVisibleId(null);
              }} 
              title="Show Lyrics" 
              leadingIcon="text-box-search" 
            />
            <Menu.Item 
              onPress={() => {
                handleDetails(item);
                setMenuVisibleId(null);
              }} 
              title="View Details" 
              leadingIcon="information-outline" 
            />
            <Menu.Item 
              onPress={() => {
                handleDelete(item);
                setMenuVisibleId(null);
              }} 
              title="Delete" 
              leadingIcon="delete" 
            />
          </Menu>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left', 'right', 'bottom']}>  
      <Header title="Player" />
      <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>        
        <Searchbar
          placeholder="Search tracks"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.search}
        />
        <View style={styles.controls}>
          <Menu
            visible={sortMenuVisible}
            onDismiss={() => setSortMenuVisible(false)}
            anchor={<IconButton icon="sort" iconColor={theme.colors.primary} onPress={() => setSortMenuVisible(true)} />}
          >
            <Menu.Item onPress={() => onSort('Title')} title="Title" />
            <Menu.Item onPress={() => onSort('Duration')} title="Duration" />
          </Menu>
          <IconButton icon={isShuffle ? 'shuffle-variant' : 'shuffle'} iconColor={theme.colors.primary} onPress={() => setIsShuffle(!isShuffle)} />
          <IconButton icon={repeatMode === 'off' ? 'repeat-off' : repeatMode === 'all' ? 'repeat' : 'repeat-once'} iconColor={theme.colors.primary} onPress={cycleRepeat} />
          <IconButton icon="timer" iconColor={theme.colors.primary} onPress={() => setShowSleepDialog(true)} />
          <IconButton icon="speedometer" iconColor={theme.colors.primary} onPress={() => setShowSpeedDialog(true)} />
        </View>
        <FlashList
          data={displayed}
          renderItem={renderTrackItem}
          estimatedItemSize={80}
          ItemSeparatorComponent={() => <Divider />}
          contentContainerStyle={styles.listContent}
        />

        {currentTrack && (
          <PlayerControls
            sound={soundObj}
            isPlaying={isPlaying}
            currentTrack={currentTrack}
            onPlayPause={handlePlayPause}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSeek={handleSeek}
            onShuffle={() => setIsShuffle(!isShuffle)}
            onRepeat={cycleRepeat}
            repeatMode={repeatMode}
            isShuffle={isShuffle}
            position={position}
            duration={duration}
          />
        )}

        <Portal>
          {/* Playlist Dialog */}
          <Dialog visible={showPlaylistDialog} onDismiss={() => setShowPlaylistDialog(false)}>
            <Dialog.Title>Add to Playlist</Dialog.Title>
            <Dialog.Content>
              {playlists.map(pl => (
                <List.Item key={pl.id} title={pl.name} onPress={() => addToPlaylist(pl.id)} />
              ))}
              <TextInput
                label="New Playlist"
                value={newPlaylistName}
                onChangeText={setNewPlaylistName}
                style={{ marginTop: 8 }}
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={createPlaylist}>Create</Button>
              <Button onPress={() => setShowPlaylistDialog(false)}>Done</Button>
            </Dialog.Actions>
          </Dialog>
          {/* Lyrics Dialog */}
          <Dialog visible={showLyricsDialog} onDismiss={() => setShowLyricsDialog(false)}>
            <Dialog.Title>Lyrics</Dialog.Title>
            <Dialog.Content>
              <Text>{lyricsText}</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowLyricsDialog(false)}>Close</Button>
            </Dialog.Actions>
          </Dialog>
          {/* Details Dialog */}
          <Dialog visible={showDetailsDialog} onDismiss={() => setShowDetailsDialog(false)}>
            <Dialog.Title>Track Details</Dialog.Title>
            <Dialog.Content>
              <Text>Title: {detailsTrack?.title}</Text>
              <Text>Artist: {detailsTrack?.artist}</Text>
              <Text>Album: {detailsTrack?.album}</Text>
              <Text>Genre: {detailsTrack?.genre}</Text>
              <Text>Year: {detailsTrack?.year}</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowDetailsDialog(false)}>Close</Button>
            </Dialog.Actions>
          </Dialog>
          {/* Sleep Timer Dialog */}
          <Dialog visible={showSleepDialog} onDismiss={() => setShowSleepDialog(false)}>
            <Dialog.Title>Sleep Timer (min)</Dialog.Title>
            <Dialog.Content>
              <TextInput keyboardType="numeric" value={sleepMinutes} onChangeText={setSleepMinutes} />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={startSleepTimer}>Start</Button>
              <Button onPress={() => setShowSleepDialog(false)}>Cancel</Button>
            </Dialog.Actions>
          </Dialog>
          {/* Playback Speed Dialog */}
          <Dialog visible={showSpeedDialog} onDismiss={() => setShowSpeedDialog(false)}>
            <Dialog.Title>Playback Speed</Dialog.Title>
            <Dialog.Content>
              <TextInput keyboardType="numeric" value={speed} onChangeText={setSpeed} />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={applySpeed}>Apply</Button>
              <Button onPress={() => setShowSpeedDialog(false)}>Cancel</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </Surface>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  search: { margin: 16 },
  controls: { flexDirection: 'row', justifyContent: 'space-around' },
  listContent: {
    paddingBottom: 16,
  },
  trackCard: {
    marginHorizontal: 16,
    marginVertical: 4,
    elevation: 0,
    borderWidth: 0,
  },
  trackContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackImageContainer: {
    marginRight: 12,
  },
  trackImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  placeholderImage: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackInfo: {
    flex: 1,
    marginRight: 8,
  },
  trackActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

