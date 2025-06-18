import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Drawer } from 'expo-router/drawer';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Avatar, Button, Divider, Switch, Text, useTheme } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = useTheme();
  const [darkMode, setDarkMode] = useState(colorScheme === 'dark');

  // Dummy user data
  const user = {
    name: 'John Doe',
    email: 'john.doe@email.com',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=FF5E5B&color=fff',
    premium: true,
  };

  return (
    <SafeAreaProvider>
      <Drawer
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].background,
            width: 320,
          },
          drawerActiveTintColor: '#FF5E5B',
          drawerInactiveTintColor: theme.colors.onSurfaceVariant,
          drawerLabelStyle: {
            fontSize: 16,
            fontWeight: '700',
            letterSpacing: 0.2,
          },
          drawerItemStyle: {
            borderRadius: 18,
            marginHorizontal: 18,
            marginVertical: 8,
            height: 60,
          },
          drawerActiveBackgroundColor: 'rgba(255, 94, 91, 0.15)',
          drawerInactiveBackgroundColor: 'transparent',
        }}
        drawerContent={props => (
          <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
            <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
              {/* Profile Header with Gradient */}
              <View style={styles.profileHeader}>
                <View style={styles.gradientBg} />
                <View style={styles.profileAvatarContainer}>
                  <Pressable style={styles.avatarPressable} onPress={() => {}}>
                    <Avatar.Image
                      size={84}
                      source={{ uri: user.avatar }}
                      style={styles.avatar}
                    />
                    <View style={styles.editIconContainer}>
                      <MaterialCommunityIcons name="pencil" size={18} color="#fff" />
                    </View>
                  </Pressable>
                </View>
                <Text style={styles.profileName}>{user.name}</Text>
                <Text style={styles.profileEmail}>{user.email}</Text>
                {user.premium && (
                  <View style={styles.premiumBadge}>
                    <MaterialCommunityIcons name="crown" size={16} color="#FFD700" />
                    <Text style={styles.premiumBadgeText}>Premium User</Text>
                  </View>
                )}
              </View>

              {/* Navigation Items */}
              <View style={styles.drawerContent}>
                {props.state.routes.map((route, index) => {
                  const { options } = props.descriptors[route.key];
                  const isFocused = props.state.index === index;
                  return (
                    <DrawerItem
                      key={route.key}
                      label={typeof options.title === 'string' ? options.title : route.name}
                      icon={({ color, size }) => {
                        // Use the icon name from the options if available, otherwise fallback
                        let iconName = 'help';
                        if (options.drawerIcon) {
                          // Try to extract the name prop if IconSymbol is used
                          const iconElement = options.drawerIcon({ color: '', size: 24, focused: false });
                          if (
                            iconElement &&
                            typeof iconElement === 'object' &&
                            'props' in iconElement &&
                            iconElement.props &&
                            typeof iconElement.props === 'object' &&
                            'name' in iconElement.props &&
                            typeof iconElement.props.name === 'string'
                          ) {
                            iconName = iconElement.props.name;
                          }
                        }
                        return <IconSymbol size={28} name={iconName} color={color} />;
                      }}
                      onPress={() => {
                        props.navigation.navigate(route.name);
                      }}
                      style={[
                        styles.drawerItem,
                        isFocused && styles.drawerItemActive,
                      ]}
                      labelStyle={[
                        styles.drawerLabel,
                        isFocused && styles.drawerLabelActive,
                      ]}
                      pressColor="rgba(255, 94, 91, 0.15)"
                      pressOpacity={0.9}
                    />
                  );
                })}
              </View>

              <Divider style={styles.divider} />

              {/* Dark Mode Toggle & Logout */}
              <View style={styles.bottomSection}>
                <View style={styles.toggleRow}>
                  <MaterialCommunityIcons name="weather-night" size={22} color={theme.colors.onSurfaceVariant} />
                  <Text style={styles.toggleLabel}>Dark Mode</Text>
                  <Switch
                    value={darkMode}
                    onValueChange={() => setDarkMode(!darkMode)}
                    color="#FF5E5B"
                    style={{ marginLeft: 'auto' }}
                  />
                </View>
                <Pressable style={styles.logoutRow} onPress={() => {}}>
                  <MaterialCommunityIcons name="logout" size={22} color="#FF5E5B" />
                  <Text style={styles.logoutLabel}>Log Out</Text>
                </Pressable>
                <Button
                  mode="contained"
                  icon={({ size, color }) => (
                    <MaterialCommunityIcons name="coffee" size={size} color={color} />
                  )}
                  onPress={() => {}}
                  style={styles.kofiButton}
                  contentStyle={styles.kofiButtonContent}
                  labelStyle={styles.kofiButtonLabel}
                >
                  Buy me a coffee
                </Button>
                <Text style={styles.versionText}>Version 1.0.0 © 2024</Text>
              </View>
            </DrawerContentScrollView>
          </SafeAreaView>
        )}
      >
        {/* Drawer Screens */}
        <Drawer.Screen
          name="index"
          options={{
            title: 'Home',
            drawerIcon: ({ color, size }) => <IconSymbol size={size} name="house" color={color} />, // pass name for mapping
          }}
        />
        <Drawer.Screen
          name="player"
          options={{
            title: 'Music Player',
            drawerIcon: ({ color, size }) => <IconSymbol size={size} name="music" color={color} />, // pass name for mapping
          }}
        />
        <Drawer.Screen
          name="playlists"
          options={{
            title: 'Playlists',
            drawerIcon: ({ color, size }) => <IconSymbol size={size} name="list" color={color} />, // pass name for mapping
          }}
        />
        <Drawer.Screen
          name="favorites"
          options={{
            title: 'Favorites',
            drawerIcon: ({ color, size }) => <IconSymbol size={size} name="heart" color={color} />, // pass name for mapping
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            title: 'Settings',
            drawerIcon: ({ color, size }) => <IconSymbol size={size} name="settings" color={color} />, // pass name for mapping
          }}
        />
      </Drawer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    paddingTop: 48,
    paddingBottom: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    // TODO: Replace with a real gradient background using a library or SVG
    backgroundColor: '#FF7E6B',
  },
  profileAvatarContainer: {
    marginBottom: 10,
    position: 'relative',
  },
  avatarPressable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: -6,
    backgroundColor: '#FF5E5B',
    borderRadius: 12,
    padding: 2,
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 2,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
    marginTop: 2,
  },
  profileEmail: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.85,
    marginBottom: 6,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7D1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 4,
    gap: 5,
  },
  premiumBadgeText: {
    color: '#B8860B',
    fontWeight: '700',
    fontSize: 13,
  },
  drawerContent: {
    flex: 1,
    marginTop: 10,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginHorizontal: 18,
    marginVertical: 8,
    borderRadius: 18,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.01)',
  },
  drawerItemActive: {
    backgroundColor: 'rgba(255, 94, 91, 0.15)',
    shadowColor: '#FF5E5B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  drawerLabel: {
    marginLeft: 18,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
    color: '#222',
  },
  drawerLabelActive: {
    color: '#FF5E5B',
  },
  divider: {
    marginHorizontal: 18,
    marginVertical: 10,
  },
  bottomSection: {
    padding: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.07)',
    alignItems: 'center',
    gap: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  toggleLabel: {
    fontSize: 15,
    marginLeft: 10,
    color: '#222',
    fontWeight: '600',
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 2,
    marginBottom: 8,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,94,91,0.07)',
    paddingHorizontal: 10,
  },
  logoutLabel: {
    fontSize: 15,
    marginLeft: 10,
    color: '#FF5E5B',
    fontWeight: '700',
  },
  kofiButton: {
    backgroundColor: '#FF5E5B',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: 8,
    width: '100%',
  },
  kofiButtonContent: {
    height: 48,
    paddingHorizontal: 24,
  },
  kofiButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  versionText: {
    marginTop: 10,
    fontSize: 12,
    color: 'rgba(0,0,0,0.4)',
    alignSelf: 'center',
  },
});
