import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, Chip, IconButton, Searchbar, Surface, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = 'https://openwhyd.org/hot/electro?format=json';
const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;

interface Track {
  _id: string;
  eId: string;
  name: string;
  img: string;
  uId: string;
  uNm: string;
  pl: {
    id: number;
    name: string;
  } | null;
  pId: string;
  nbR: number;
  nbL: number;
  score: number;
  trackUrl: string;
}

interface OpenWhydResponse {
  hasMore: {
    skip: number;
  };
  tracks: Track[];
}

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchBar: {
    elevation: 2,
    borderRadius: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 24,
  },
  title: {
    fontSize: 32,
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
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  tracksScroll: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  trackCardContainer: {
    width: CARD_WIDTH,
    marginRight: 20,
  },
  trackCard: {
    width: '100%',
    borderRadius: 16,
    elevation: 4,
    overflow: 'hidden',
  },
  trackImageContainer: {
    position: 'relative',
  },
  trackCover: {
    height: CARD_WIDTH,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  trackOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playButton: {
    borderRadius: 20,
  },
  trackContent: {
    padding: 16,
  },
  trackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 14,
    marginBottom: 8,
  },
  playlistContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  playlistName: {
    fontSize: 12,
    flex: 1,
  },
  trackStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackStat: {
    fontSize: 12,
    marginLeft: -8,
  },
});

export default function HomeScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const scrollX = new Animated.Value(0);

  const fetchTracks = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get<OpenWhydResponse>(API_URL);
      
      if (response.data?.tracks) {
        setTracks(response.data.tracks);
        if (!searchQuery) {
          setSearchResults(response.data.tracks);
        }
      } else {
        setTracks([]);
        setSearchResults([]);
      }
    } catch (err) {
      setError('Failed to fetch tracks. Please try again.');
      console.error('Fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  const searchTracks = (query: string) => {
    if (!query.trim()) {
      setSearchResults(tracks);
      return;
    }

    const filteredTracks = tracks.filter(track => 
      track.name.toLowerCase().includes(query.toLowerCase()) ||
      track.uNm.toLowerCase().includes(query.toLowerCase()) ||
      (track.pl?.name.toLowerCase().includes(query.toLowerCase()) ?? false)
    );
    setSearchResults(filteredTracks);
  };

  const debouncedSearch = useCallback(
    debounce((query: string) => searchTracks(query), 300),
    [tracks]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTracks();
    setRefreshing(false);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleTrackPress = (track: Track) => {
    setSelectedTrack(track);
    // TODO: Implement track playback
    console.log('Track pressed:', track);
  };

  const renderTrackCard = ({ item, index }: { item: Track; index: number }) => {
    const inputRange = [
      (index - 1) * CARD_WIDTH,
      index * CARD_WIDTH,
      (index + 1) * CARD_WIDTH,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.85, 1, 0.85],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.7, 1, 0.7],
      extrapolate: 'clamp',
    });

    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [10, 0, 10],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.trackCardContainer,
          {
            transform: [{ scale }, { translateY }],
            opacity,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => handleTrackPress(item)}
        >
          <Card style={[styles.trackCard, { backgroundColor: theme.colors.surfaceVariant }]}>
            <View style={styles.trackImageContainer}>
              <Card.Cover source={{ uri: item.img }} style={styles.trackCover} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.gradient}
              />
              <View style={styles.trackOverlay}>
                <Chip
                  icon="play"
                  mode="flat"
                  style={[styles.playButton, { backgroundColor: theme.colors.primary }]}
                >
                  Play
                </Chip>
              </View>
            </View>
            <Card.Content style={styles.trackContent}>
              <Text style={styles.trackTitle} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={[styles.trackArtist, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
                {item.uNm}
              </Text>
              {item.pl && (
                <View style={styles.playlistContainer}>
                  <IconButton icon="playlist-music" size={16} />
                  <Text style={[styles.playlistName, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
                    {item.pl.name}
                  </Text>
                </View>
              )}
              <View style={styles.trackStats}>
                <View style={styles.statItem}>
                  <IconButton icon="play" size={16} />
                  <Text style={[styles.trackStat, { color: theme.colors.onSurfaceVariant }]}>
                    {item.nbR}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <IconButton icon="heart" size={16} />
                  <Text style={[styles.trackStat, { color: theme.colors.onSurfaceVariant }]}>
                    {item.nbL}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <IconButton icon="star" size={16} />
                  <Text style={[styles.trackStat, { color: theme.colors.onSurfaceVariant }]}>
                    {item.score}
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left', 'right', 'bottom']}>
      <Surface style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: 16 }]}>
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search songs, artists, or playlists..."
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.searchBar}
            iconColor={theme.colors.primary}
            elevation={2}
          />
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
              <Button 
                mode="contained" 
                onPress={fetchTracks}
                style={styles.retryButton}
              >
                Retry
              </Button>
            </View>
          ) : (
            <>
              <View style={styles.header}>
                <Text style={styles.title}>Hot Electro Tracks</Text>
                <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
                  {searchQuery ? 'Search Results' : 'Trending Now'}
                </Text>
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <IconButton icon="music" size={24} iconColor={theme.colors.primary} />
                  <Text style={styles.sectionTitle}>
                    {searchQuery ? 'Search Results' : 'Featured Tracks'}
                  </Text>
                </View>
                {searchResults.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                      No tracks found. Try a different search term.
                    </Text>
                  </View>
                ) : (
                  <Animated.FlatList
                    data={searchResults}
                    renderItem={renderTrackCard}
                    keyExtractor={(item) => item._id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tracksScroll}
                    snapToInterval={CARD_WIDTH + 20}
                    decelerationRate="fast"
                    onScroll={Animated.event(
                      [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                      { useNativeDriver: true }
                    )}
                    scrollEventThrottle={16}
                  />
                )}
              </View>
            </>
          )}
        </ScrollView>
      </Surface>
    </SafeAreaView>
  );
}
