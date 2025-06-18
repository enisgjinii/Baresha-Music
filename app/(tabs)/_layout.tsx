import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Drawer
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: theme.colors.onPrimary,
        drawerStyle: {
          backgroundColor: theme.colors.background,
        },
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.onSurfaceVariant,
        drawerType: 'slide',
        overlayColor: 'rgba(0, 0, 0, 0.5)',
      }}
      drawerContent={props => (
        <DrawerContentScrollView {...props}>
          {props.state.routes.map((route, index) => {
            const { options } = props.descriptors[route.key];
            const isFocused = props.state.index === index;

            return (
              <DrawerItem
                key={route.key}
                label={typeof options.title === 'string' ? options.title : route.name}
                onPress={() => props.navigation.navigate(route.name)}
                style={[
                  styles.drawerItem,
                  isFocused && styles.drawerItemActive
                ]}
                labelStyle={[
                  styles.drawerLabel,
                  { color: isFocused ? '#FF5E5B' : '#222' },
                  isFocused && styles.drawerLabelActive
                ]}
              />
            );
          })}
        </DrawerContentScrollView>
      )}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: 'Home',
          drawerLabel: 'Home',
        }}
      />
      <Drawer.Screen
        name="player"
        options={{
          title: 'Player',
          drawerLabel: 'Player',
        }}
      />
      <Drawer.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          drawerLabel: 'Favorites',
        }}
      />
      <Drawer.Screen
        name="playlists"
        options={{
          title: 'Playlists',
          drawerLabel: 'Playlists',
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          title: 'Settings',
          drawerLabel: 'Settings',
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerItem: {
    marginVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  drawerItemActive: {
    backgroundColor: 'rgba(255, 94, 91, 0.08)',
  },
  drawerLabel: {
    fontSize: 16,
  },
  drawerLabelActive: {
    fontWeight: 'bold',
  },
});
