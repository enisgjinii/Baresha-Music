import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, useTheme } from 'react-native-paper';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = useTheme();

  return (
    <Drawer
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
        },
        headerTintColor: Colors[colorScheme ?? 'light'].text,
        drawerStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          width: 280,
        },
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.onSurfaceVariant,
        drawerLabelStyle: {
          marginLeft: -20,
          fontSize: 14,
          fontWeight: 'medium',
          letterSpacing: 0.1,
        },
        drawerItemStyle: {
          borderRadius: 8,
          marginHorizontal: 8,
          marginVertical: 4,
          height: 48,
        },
        drawerActiveBackgroundColor: theme.colors.primaryContainer,
        drawerInactiveBackgroundColor: 'transparent',
      }}
      drawerContent={(props) => (
        <DrawerContentScrollView {...props}>
          <View style={styles.container}>
            <View style={styles.drawerContent}>
              {props.state.routes.map((route, index) => {
                const { options } = props.descriptors[route.key];
                const isFocused = props.state.index === index;

                return (
                  <View key={route.key} style={[
                    styles.drawerItem,
                    isFocused && { backgroundColor: theme.colors.primaryContainer }
                  ]}>
                    {options.drawerIcon?.({ 
                      color: isFocused ? theme.colors.primary : theme.colors.onSurfaceVariant,
                      size: 24,
                      focused: isFocused
                    })}
                    <Text style={[
                      styles.drawerLabel,
                      { color: isFocused ? theme.colors.primary : theme.colors.onSurfaceVariant }
                    ]}>
                      {options.title}
                    </Text>
                  </View>
                );
              })}
            </View>
            <View style={styles.bottomContainer}>
              <Button
                mode="contained"
                icon="coffee"
                onPress={() => {}}
                style={styles.kofiButton}
                contentStyle={styles.kofiButtonContent}
                labelStyle={styles.kofiButtonLabel}
              >
                Buy me a coffee
              </Button>
            </View>
          </View>
        </DrawerContentScrollView>
      )}>
      <Drawer.Screen
        name="index"
        options={{
          title: 'Home',
          drawerIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
            <IconSymbol size={size} name="house.fill" color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="player"
        options={{
          title: 'Music Player',
          drawerIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
            <IconSymbol size={size} name="music.note" color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="playlists"
        options={{
          title: 'Playlists',
          drawerIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
            <IconSymbol size={size} name="list.bullet" color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          drawerIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
            <IconSymbol size={size} name="heart.fill" color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          title: 'Settings',
          drawerIcon: ({ color, size, focused }: { color: string; size: number; focused: boolean }) => (
            <IconSymbol size={size} name="gear" color={color} />
          ),
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  drawerContent: {
    flex: 1,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 8,
    height: 48,
  },
  drawerLabel: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: 'medium',
    letterSpacing: 0.1,
  },
  bottomContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  kofiButton: {
    backgroundColor: '#FF5E5B',
    borderRadius: 8,
  },
  kofiButtonContent: {
    height: 40,
  },
  kofiButtonLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
