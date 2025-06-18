import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';

interface AudioVisualizerProps {
  isPlaying: boolean;
  bars?: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  bars = 20,
}) => {
  const theme = useTheme();
  const animations = useRef<Animated.Value[]>([]).current;

  useEffect(() => {
    // Initialize animations
    if (animations.length === 0) {
      for (let i = 0; i < bars; i++) {
        animations.push(new Animated.Value(0.3));
      }
    }
  }, [bars]);

  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        const animations = Array.from({ length: bars }, () => {
          return Animated.sequence([
            Animated.timing(new Animated.Value(0.3), {
              toValue: Math.random() * 0.7 + 0.3,
              duration: Math.random() * 500 + 200,
              useNativeDriver: true,
            }),
            Animated.timing(new Animated.Value(0.3), {
              toValue: 0.3,
              duration: Math.random() * 500 + 200,
              useNativeDriver: true,
            }),
          ]);
        });

        Animated.parallel(animations).start(() => {
          if (isPlaying) {
            animate();
          }
        });
      };

      animate();
    }
  }, [isPlaying, bars]);

  return (
    <View style={styles.container}>
      {Array.from({ length: bars }).map((_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              backgroundColor: theme.colors.primary,
              transform: [
                {
                  scaleY: animations[index] || new Animated.Value(0.3),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    paddingHorizontal: 8,
  },
  bar: {
    width: 3,
    height: 20,
    marginHorizontal: 2,
    borderRadius: 1.5,
  },
}); 