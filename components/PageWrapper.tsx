import React from 'react';
import { StyleSheet } from 'react-native';
import { Surface, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PageWrapperProps {
  children: React.ReactNode;
  style?: any;
}

export function PageWrapper({ children, style }: PageWrapperProps) {
  const theme = useTheme();

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <Surface style={[styles.surface, { backgroundColor: theme.colors.background }, style]}>
        {children}
      </Surface>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  surface: {
    flex: 1,
  },
}); 