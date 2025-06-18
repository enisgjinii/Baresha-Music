import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Divider, List, Surface, Switch, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const theme = useTheme();
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [isHighQuality, setIsHighQuality] = React.useState(true);
  const [isOfflineMode, setIsOfflineMode] = React.useState(false);
  const [isAutoPlay, setIsAutoPlay] = React.useState(true);
  const [isCrossfade, setIsCrossfade] = React.useState(false);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right', 'bottom']}>
      <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView>
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
          </View>

          <List.Section>
            <Text style={styles.sectionTitle}>Appearance</Text>
            <List.Item
              title="Dark Mode"
              description="Switch between light and dark theme"
              titleStyle={styles.itemTitle}
              descriptionStyle={styles.itemDescription}
              left={props => (
                <List.Icon {...props} icon="weather-night" color={theme.colors.primary} />
              )}
              right={() => (
                <Switch
                  value={isDarkMode}
                  onValueChange={setIsDarkMode}
                  color={theme.colors.primary}
                />
              )}
            />
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
                  value={isHighQuality}
                  onValueChange={setIsHighQuality}
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
                  value={isOfflineMode}
                  onValueChange={setIsOfflineMode}
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
                  value={isAutoPlay}
                  onValueChange={setIsAutoPlay}
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
                  value={isCrossfade}
                  onValueChange={setIsCrossfade}
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
