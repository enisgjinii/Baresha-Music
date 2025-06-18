import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { List, Surface, Switch, Text, useTheme } from 'react-native-paper';

export default function SettingsScreen() {
  const theme = useTheme();
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [isHighQuality, setIsHighQuality] = React.useState(true);
  const [isOfflineMode, setIsOfflineMode] = React.useState(false);

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        <List.Section>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <List.Item
            title="Dark Mode"
            titleStyle={styles.itemTitle}
            left={props => <List.Icon {...props} icon="weather-night" color={theme.colors.primary} />}
            right={() => (
              <Switch
                value={isDarkMode}
                onValueChange={setIsDarkMode}
                color={theme.colors.primary}
              />
            )}
          />
        </List.Section>

        <List.Section>
          <Text style={styles.sectionTitle}>Playback</Text>
          <List.Item
            title="High Quality Streaming"
            titleStyle={styles.itemTitle}
            left={props => <List.Icon {...props} icon="music-note" color={theme.colors.primary} />}
            right={() => (
              <Switch
                value={isHighQuality}
                onValueChange={setIsHighQuality}
                color={theme.colors.primary}
              />
            )}
          />
          <List.Item
            title="Offline Mode"
            titleStyle={styles.itemTitle}
            left={props => <List.Icon {...props} icon="download" color={theme.colors.primary} />}
            right={() => (
              <Switch
                value={isOfflineMode}
                onValueChange={setIsOfflineMode}
                color={theme.colors.primary}
              />
            )}
          />
        </List.Section>

        <List.Section>
          <Text style={styles.sectionTitle}>About</Text>
          <List.Item
            title="Version 1.0.0"
            titleStyle={styles.itemTitle}
            left={props => <List.Icon {...props} icon="information" color={theme.colors.primary} />}
          />
        </List.Section>
      </ScrollView>
    </Surface>
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
}); 