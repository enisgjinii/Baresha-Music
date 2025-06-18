import Header from '@/components/Header';
import { StorageService } from '@/services/StorageService';
import { Image } from 'expo-image';
import * as MediaLibrary from 'expo-media-library';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Divider, IconButton, List, Surface, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FavoriteTrack {
  id: string;
  title: string;
  artist?: string;
  duration: number;
  artwork?: string;
}

export default function FavoritesScreen() {
  const theme = useTheme();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteTracks, setFavoriteTracks] = useState<FavoriteTrack[]>([]);
  const [storageService] = useState(() => StorageService.getInstance());

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const savedFavorites = await storageService.getFavorites();
    setFavorites(savedFavorites);

    // Load track details for each favorite
    const tracks = await Promise.all(
      savedFavorites.map(async (id) => {
        try {
          const asset = await MediaLibrary.getAssetInfoAsync(id);
          const track: FavoriteTrack = {
            id: asset.id,
            title: asset.filename,
            duration: Math.round(asset.duration * 1000),
            artwork: asset.uri
          };
          return track;
        } catch (error) {
          console.error('Error loading track:', error);
          return null;
        }
      })
    );

    setFavoriteTracks(tracks.filter((track): track is FavoriteTrack => track !== null));
  };

  const toggleFavorite = async (id: string) => {
    const newFavorites = favorites.includes(id)
      ? favorites.filter(favId => favId !== id)
      : [...favorites, id];
    
    await storageService.saveFavorites(newFavorites);
    setFavorites(newFavorites);
    setFavoriteTracks(prev => prev.filter(track => track.id !== id));
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left', 'right', 'bottom']}>
      <Header title="Favorites" />
      <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView>
          <Card style={styles.listCard}>
            {favoriteTracks.map((track, index) => (
              <React.Fragment key={track.id}>
                <List.Item
                  title={track.title}
                  description={track.artist}
                  left={props => (
                    track.artwork ? (
                      <Image
                        source={{ uri: track.artwork }}
                        style={styles.cover}
                        contentFit="cover"
                      />
                    ) : (
                      <List.Icon {...props} icon="music" />
                    )
                  )}
                  right={props => (
                    <View style={styles.rightContent}>
                      <Text style={[styles.duration, { color: theme.colors.onSurfaceVariant }]}>
                        {formatDuration(track.duration)}
                      </Text>
                      <IconButton 
                        icon="heart" 
                        size={24} 
                        iconColor={theme.colors.primary}
                        onPress={() => toggleFavorite(track.id)}
                      />
                    </View>
                  )}
                  onPress={() => {}}
                />
                {index < favoriteTracks.length - 1 && <Divider />}
              </React.Fragment>
            ))}
            {favoriteTracks.length === 0 && (
              <List.Item
                title="No favorites yet"
                description="Add songs to your favorites from the player"
                left={props => <List.Icon {...props} icon="heart-outline" />}
              />
            )}
          </Card>
        </ScrollView>
      </Surface>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listCard: {
    margin: 16,
    borderRadius: 12,
  },
  cover: {
    width: 56,
    height: 56,
    borderRadius: 4,
    margin: 8,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  duration: {
    fontSize: 14,
  },
});
