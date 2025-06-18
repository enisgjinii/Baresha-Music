import * as MediaLibrary from 'expo-media-library';
import { Platform } from 'react-native';

interface MusicMetadata {
  title: string;
  artist: string;
  album: string;
  artwork: string | null;
  genre: string;
  year: string;
  duration: number;
}

export class MusicMetadataService {
  private static instance: MusicMetadataService;
  private metadataCache: Map<string, MusicMetadata> = new Map();

  private constructor() {}

  static getInstance(): MusicMetadataService {
    if (!MusicMetadataService.instance) {
      MusicMetadataService.instance = new MusicMetadataService();
    }
    return MusicMetadataService.instance;
  }

  async getMetadata(asset: MediaLibrary.Asset): Promise<MusicMetadata> {
    // Check cache first
    const cached = this.metadataCache.get(asset.id);
    if (cached) return cached;

    try {
      // Get basic metadata from the asset
      const metadata: MusicMetadata = {
        title: asset.filename.replace(/\.[^/.]+$/, ''),
        artist: 'Unknown Artist',
        album: 'Unknown Album',
        artwork: null,
        genre: 'Unknown',
        year: 'Unknown',
        duration: asset.duration || 0,
      };

      // Try to extract metadata from filename
      this.extractMetadataFromFilename(asset.filename, metadata);

      // Try to get artwork
      if (Platform.OS === 'ios') {
        const artwork = await this.getArtworkFromAsset(asset);
        if (artwork) {
          metadata.artwork = artwork;
        }
      }

      // Cache the result
      this.metadataCache.set(asset.id, metadata);
      return metadata;
    } catch (error) {
      console.error('Error fetching metadata:', error);
      return {
        title: asset.filename.replace(/\.[^/.]+$/, ''),
        artist: 'Unknown Artist',
        album: 'Unknown Album',
        artwork: null,
        genre: 'Unknown',
        year: 'Unknown',
        duration: asset.duration || 0,
      };
    }
  }

  private extractMetadataFromFilename(filename: string, metadata: MusicMetadata): void {
    // Remove file extension
    const name = filename.replace(/\.[^/.]+$/, '');
    
    // Try to match common patterns
    const patterns = [
      // Artist - Title
      /^(.+?)\s*-\s*(.+)$/,
      // Artist - Title (Year)
      /^(.+?)\s*-\s*(.+?)\s*\((\d{4})\)$/,
      // Artist - Album - Title
      /^(.+?)\s*-\s*(.+?)\s*-\s*(.+)$/,
    ];

    for (const pattern of patterns) {
      const match = name.match(pattern);
      if (match) {
        if (match[1]) metadata.artist = match[1].trim();
        if (match[2]) metadata.title = match[2].trim();
        if (match[3]) {
          if (match[3].length === 4) {
            metadata.year = match[3];
          } else {
            metadata.album = match[3].trim();
          }
        }
        break;
      }
    }
  }

  private async getArtworkFromAsset(asset: MediaLibrary.Asset): Promise<string | null> {
    try {
      // Try to get artwork from the asset
      const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
      if (assetInfo.creationTime) {
        // For iOS, we can try to get artwork from the asset's creation time
        const artwork = await this.searchArtwork(asset.filename, new Date(assetInfo.creationTime));
        if (artwork) return artwork;
      }
    } catch (error) {
      console.error('Error getting artwork:', error);
    }
    return null;
  }

  private async searchArtwork(filename: string, creationTime: Date): Promise<string | null> {
    // This is a placeholder for actual artwork search logic
    // In a real app, you would:
    // 1. Use a music metadata API (like MusicBrainz, Last.fm, or iTunes)
    // 2. Search for artwork based on the filename and creation time
    // 3. Cache the results
    return null;
  }

  clearCache(): void {
    this.metadataCache.clear();
  }
} 