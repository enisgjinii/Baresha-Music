// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type ValidWeight = 'regular' | 'medium' | 'bold' | 'heavy';
type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'music.note': 'music-note',
  'list.bullet': 'list',
  'heart.fill': 'favorite',
  gear: 'settings',
  'person.fill': 'person',
  'coffee': 'coffee',
  'house': 'home',
  'music': 'music-note',
  'list': 'list',
  'heart': 'favorite',
  'settings': 'settings',
} as const;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
}: {
  name: string;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: ValidWeight;
}) {
  const iconName = MAPPING[name as keyof typeof MAPPING] || 'help';
  if (!MAPPING[name as keyof typeof MAPPING]) {
    console.warn(`IconSymbol: Unmapped icon name '${name}', using fallback 'help' icon.`);
  }
  return <MaterialIcons color={color} size={size} name={iconName} style={style} />;
}
