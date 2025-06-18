import Header from '@/components/Header';
import { StorageService } from '@/services/StorageService';
import { useThemeStore, type ThemePreference } from '@/store/useThemeStore';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Divider, List, RadioButton, Surface, Switch, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AppSettings {
  isHighQuality: boolean;
  isOfflineMode: boolean;
  isAutoPlay: boolean;
  isCrossfade: boolean;
}

export default function SettingsScreen() {
  const theme = useTheme();
  const { preference, setPreference } = useThemeStore();
  const [settings, setSettings] = useState<AppSettings>({
    isHighQuality: true,
    isOfflineMode: false,
    isAutoPlay: true,
    isCrossfade: false,
  });
  const [storageService] = useState(() => StorageService.getInstance());

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const savedSettings = await storageService.getSettings();
    setSettings({
      isHighQuality: savedSettings.isHighQuality ?? true,
      isOfflineMode: savedSettings.isOfflineMode ?? false,
      isAutoPlay: savedSettings.isAutoPlay ?? true,
      isCrossfade: savedSettings.isCrossfade ?? false,
    });
  };

  const updateSetting = async (key: keyof AppSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await storageService.saveSettings({
      ...newSettings,
      isShuffle: false,
      repeatMode: 'off',
      playbackSpeed: 1.0,
      sleepTimerMinutes: 5,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left', 'right', 'bottom']}>
      <Header title="Settings" />
      <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView>
          <List.Section>
            <Text style={styles.sectionTitle}>Appearance</Text>
            <RadioButton.Group onValueChange={(value: string) => setPreference(value as ThemePreference)} value={preference}>
              <RadioButton.Item
                label="System Default"
                value="system"
                labelStyle={styles.itemTitle}
                color={theme.colors.primary}
              />
              <RadioButton.Item
                label="Light Theme"
                value="light"
                labelStyle={styles.itemTitle}
                color={theme.colors.primary}
              />
              <RadioButton.Item
                label="Dark Theme"
                value="dark"
                labelStyle={styles.itemTitle}
                color={theme.colors.primary}
              />
            </RadioButton.Group>
            <Divider />
          </List.Section>

          <List.Section>
            <Text style={styles.sectionTitle}>Playback</Text>
            <List.Item
              title="High Quality Streaming"
              description="Stream music in high quality (uses more data)"
              titleStyle={styles.itemTitle}
              descriptionStyle={styles.itemDescription}
              left={props => <List.Icon {...props} icon="music-note" color={theme.colors.primary} />}
              right={() => (
                <Switch
                  value={settings.isHighQuality}
                  onValueChange={(value) => updateSetting('isHighQuality', value)}
                  color={theme.colors.primary}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Offline Mode"
              description="Only play downloaded music"
              titleStyle={styles.itemTitle}
              descriptionStyle={styles.itemDescription}
              left={props => <List.Icon {...props} icon="download" color={theme.colors.primary} />}
              right={() => (
                <Switch
                  value={settings.isOfflineMode}
                  onValueChange={(value) => updateSetting('isOfflineMode', value)}
                  color={theme.colors.primary}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Auto Play"
              description="Automatically play next track"
              titleStyle={styles.itemTitle}
              descriptionStyle={styles.itemDescription}
              left={props => <List.Icon {...props} icon="play" color={theme.colors.primary} />}
              right={() => (
                <Switch
                  value={settings.isAutoPlay}
                  onValueChange={(value) => updateSetting('isAutoPlay', value)}
                  color={theme.colors.primary}
                />
              )}
            />
            <Divider />
            <List.Item
              title="Crossfade"
              description="Smooth transition between tracks"
              titleStyle={styles.itemTitle}
              descriptionStyle={styles.itemDescription}
              left={props => <List.Icon {...props} icon="music-note-eighth" color={theme.colors.primary} />}
              right={() => (
                <Switch
                  value={settings.isCrossfade}
                  onValueChange={(value) => updateSetting('isCrossfade', value)}
                  color={theme.colors.primary}
                />
              )}
            />
          </List.Section>

          <List.Section>
            <Text style={styles.sectionTitle}>About</Text>
            <List.Item
              title="Version"
              description="1.0.0"
              titleStyle={styles.itemTitle}
              descriptionStyle={styles.itemDescription}
              left={props => <List.Icon {...props} icon="information" color={theme.colors.primary} />}
            />
            <Divider />
            <List.Item
              title="Terms of Service"
              titleStyle={styles.itemTitle}
              left={props => <List.Icon {...props} icon="file-document" color={theme.colors.primary} />}
              onPress={() => {}}
            />
            <Divider />
            <List.Item
              title="Privacy Policy"
              titleStyle={styles.itemTitle}
              left={props => <List.Icon {...props} icon="shield-account" color={theme.colors.primary} />}
              onPress={() => {}}
            />
          </List.Section>
        </ScrollView>
      </Surface>
    </SafeAreaView>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  itemTitle: {
    fontSize: 16,
  },
  itemDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
});
