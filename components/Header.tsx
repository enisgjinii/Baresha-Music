import { DrawerActions, useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const theme = useTheme();
  const navigation = useNavigation();

  return (
    <Appbar.Header style={{ backgroundColor: theme.colors.primary }}>
      <Appbar.Action icon="menu" onPress={() => navigation.dispatch(DrawerActions.openDrawer())} />
      <Appbar.Content title={title} titleStyle={styles.title} />
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
  title: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 