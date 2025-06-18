import {
    DarkTheme,
    DefaultTheme,
    Theme as NavigationTheme,
    ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
    adaptNavigationTheme,
    MD3DarkTheme,
    MD3LightTheme,
    MD3Theme,
    PaperProvider,
} from 'react-native-paper';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

const { LightTheme, DarkTheme: NavigationDarkTheme } = adaptNavigationTheme({
  reactNavigationLight: DefaultTheme,
  reactNavigationDark: DarkTheme,
});

const paperLightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1DB954',
    secondary: '#1DB954',
  },
};

const paperDarkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#1DB954',
    secondary: '#1DB954',
  },
};

const navigationLightTheme: NavigationTheme = {
  ...LightTheme,
  colors: {
    ...LightTheme.colors,
    primary: '#1DB954',
    card: MD3LightTheme.colors.surface,
    text: MD3LightTheme.colors.onSurface,
    border: MD3LightTheme.colors.outline,
    notification: MD3LightTheme.colors.error,
  },
};

const navigationDarkTheme: NavigationTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    primary: '#1DB954',
    card: MD3DarkTheme.colors.surface,
    text: MD3DarkTheme.colors.onSurface,
    border: MD3DarkTheme.colors.outline,
    notification: MD3DarkTheme.colors.error,
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  const paperTheme = colorScheme === 'dark' ? paperDarkTheme : paperLightTheme;
  const navigationTheme = colorScheme === 'dark' ? navigationDarkTheme : navigationLightTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={paperTheme}>
        <NavigationThemeProvider value={navigationTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </NavigationThemeProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
