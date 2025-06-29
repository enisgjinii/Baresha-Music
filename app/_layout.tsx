import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeStore } from '@/store/useThemeStore';
import { Stack } from 'expo-router';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function Layout() {
  const systemScheme = useColorScheme();
  const { preference } = useThemeStore();
  const colorScheme = preference === 'system' ? (systemScheme ?? 'light') : preference;
  
  // Create custom theme with brand colors
  const paperTheme = colorScheme === 'dark' 
    ? {
        ...MD3DarkTheme,
        colors: {
          ...MD3DarkTheme.colors,
          primary: '#FF5E5B',
          secondary: '#0A7EA4',
        },
      }
    : {
        ...MD3LightTheme,
        colors: {
          ...MD3LightTheme.colors,
          primary: '#FF5E5B',
          secondary: '#0A7EA4',
        },
      };

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" options={{ headerShown: true, title: 'Not Found' }} />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
} 