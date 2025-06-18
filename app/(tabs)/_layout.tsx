import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Drawer } from 'expo-router/drawer';
import React, { useState } from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import { Avatar, Badge, Divider, IconButton, Surface, Text, useTheme } from 'react-native-paper';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '../../components/ThemedText';

const DRAWER_WIDTH = Math.min(Dimensions.get('window').width * 0.85, 320);
const AnimatedSurface = Animated.createAnimatedComponent(Surface);

export default function TabLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerProgress = useSharedValue(0);

  const getIconName = (routeName: string) => {
    switch (routeName) {
      case 'index':
        return 'home';
      case 'player':
        return 'play-circle';
      case 'favorites':
        return 'heart';
      case 'playlists':
        return 'playlist-music';
      case 'settings':
        return 'cog';
      default:
        return 'circle';
    }
  };

  const styles = StyleSheet.create({
    drawerContent: {
      flex: 1,
    },
    drawerHeader: {
      paddingHorizontal: 16,
      paddingBottom: 4,
    },
    logoContainer: {
      alignItems: 'center',
      paddingVertical: 16,
    },
    logo: {
      width: 60,
      height: 60,
      borderRadius: 12,
      marginBottom: 8,
    },
    appTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
    divider: {
      marginVertical: 8,
    },
    drawerItemsContainer: {
      paddingTop: 4,
      flex: 1,
    },
    drawerItem: {
      marginHorizontal: 8,
      marginVertical: 2,
      borderRadius: 8,
      overflow: 'hidden',
    },
    drawerItemActive: {
      backgroundColor: `${theme.colors.primary}20`,
    },
    drawerLabel: {
      fontSize: 15,
      marginLeft: -8,
      letterSpacing: 0.15,
    },
    drawerLabelActive: {
      fontWeight: '600',
    },
    footer: {
      paddingHorizontal: 16,
      paddingBottom: insets.bottom || 16,
    },
    version: {
      fontSize: 12,
      textAlign: 'center',
      opacity: 0.5,
    },
    userSection: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      marginBottom: 8,
    },
    userInfo: {
      marginLeft: 12,
      flex: 1,
    },
    userName: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    userEmail: {
      fontSize: 12,
      opacity: 0.7,
    },
    badge: {
      position: 'absolute',
      top: -4,
      right: -4,
    },
    notificationContainer: {
      position: 'relative',
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: insets.top || 16,
      paddingBottom: 8,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      flex: 1,
      textAlign: 'center',
    },
    blurHeader: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: insets.top + 56,
      zIndex: 1000,
    },
  });

  // Animated styles for drawer
  const animatedDrawerStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(drawerProgress.value, [0, 1], [0.8, 1]),
      transform: [
        {
          translateX: interpolate(
            drawerProgress.value,
            [0, 1],
            [-20, 0]
          ),
        },
      ],
    };
  });

  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: theme.colors.background,
          width: DRAWER_WIDTH,
        },
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.onSurfaceVariant,
        drawerType: Platform.OS === 'ios' ? 'slide' : 'front',
        overlayColor: 'rgba(0, 0, 0, 0.5)',
        swipeEnabled: true,
        swipeEdgeWidth: 100,
      }}
      drawerContent={props => {
        // Update drawer animation progress
        if (props.state.history.length > 1) {
          drawerProgress.value = withTiming(1);
          setDrawerOpen(true);
        } else {
          drawerProgress.value = withTiming(0);
          setDrawerOpen(false);
        }
        
        return (
          <DrawerContentScrollView 
            {...props}
            contentContainerStyle={[
              styles.drawerContent,
              { paddingTop: insets.top }
            ]}
          >
            <AnimatedSurface style={[styles.drawerHeader, animatedDrawerStyle]} elevation={0}>
              <View style={styles.userSection}>
                <Avatar.Image 
                  size={50} 
                  source={require('../../assets/images/icon.png')} 
                />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>Music Lover</Text>
                  <Text style={styles.userEmail}>music@example.com</Text>
                </View>
                <View style={styles.notificationContainer}>
                  <IconButton 
                    icon="bell" 
                    size={24} 
                    onPress={() => {}} 
                  />
                  <Badge style={styles.badge}>3</Badge>
                </View>
              </View>
              
              <Divider style={styles.divider} />
            </AnimatedSurface>
            
            <AnimatedSurface style={[styles.drawerItemsContainer, animatedDrawerStyle]} elevation={0}>
              {props.state.routes.map((route, index) => {
                const { options } = props.descriptors[route.key];
                const isFocused = props.state.index === index;
                const iconName = getIconName(route.name);

                return (
                  <DrawerItem
                    key={route.key}
                    label={typeof options.title === 'string' ? options.title : route.name}
                    onPress={() => props.navigation.navigate(route.name)}
                    icon={({ size, color }) => (
                      <MaterialCommunityIcons 
                        name={iconName} 
                        size={22} 
                        color={isFocused ? theme.colors.primary : color} 
                      />
                    )}
                    style={[
                      styles.drawerItem,
                      isFocused && styles.drawerItemActive
                    ]}
                    labelStyle={[
                      styles.drawerLabel,
                      { 
                        color: isFocused ? theme.colors.primary : theme.colors.onSurface 
                      },
                      isFocused && styles.drawerLabelActive
                    ]}
                    pressColor={theme.colors.primaryContainer}
                    pressOpacity={0.08}
                  />
                );
              })}
            </AnimatedSurface>

            <AnimatedSurface style={[styles.footer, animatedDrawerStyle]} elevation={0}>
              <Divider style={styles.divider} />
              <ThemedText style={styles.version}>Version 1.0.0</ThemedText>
            </AnimatedSurface>
          </DrawerContentScrollView>
        );
      }}
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
