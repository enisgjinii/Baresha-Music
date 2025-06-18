import Slider from '@react-native-community/slider';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Dialog, Portal, Text, useTheme } from 'react-native-paper';

interface EqualizerProps {
  visible: boolean;
  onDismiss: () => void;
  onApply: (settings: EqualizerSettings) => void;
  initialSettings?: EqualizerSettings;
}

export interface EqualizerSettings {
  bass: number;
  mid: number;
  treble: number;
  reverb: number;
  preamp: number;
}

const defaultSettings: EqualizerSettings = {
  bass: 50,
  mid: 50,
  treble: 50,
  reverb: 0,
  preamp: 100,
};

const presets: { name: string; settings: EqualizerSettings }[] = [
  {
    name: 'Flat',
    settings: { ...defaultSettings },
  },
  {
    name: 'Bass Boost',
    settings: { ...defaultSettings, bass: 80, mid: 50, treble: 40, preamp: 60 },
  },
  {
    name: 'Vocal Boost',
    settings: { ...defaultSettings, bass: 40, mid: 75, treble: 65, preamp: 55 },
  },
  {
    name: 'Rock',
    settings: { ...defaultSettings, bass: 60, mid: 45, treble: 75, preamp: 65 },
  },
  {
    name: 'Classical',
    settings: { ...defaultSettings, bass: 45, mid: 60, treble: 70, preamp: 50 },
  },
];

export const Equalizer: React.FC<EqualizerProps> = ({
  visible,
  onDismiss,
  onApply,
  initialSettings = defaultSettings,
}) => {
  const theme = useTheme();
  const [settings, setSettings] = useState<EqualizerSettings>(initialSettings);

  const handlePresetSelect = (preset: EqualizerSettings) => {
    setSettings(preset);
  };

  const handleApply = () => {
    onApply(settings);
    onDismiss();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Equalizer</Dialog.Title>
        <Dialog.Content>
          <View style={styles.presets}>
            {presets.map((preset) => (
              <Button
                key={preset.name}
                mode="outlined"
                onPress={() => handlePresetSelect(preset.settings)}
                style={styles.presetButton}
              >
                {preset.name}
              </Button>
            ))}
          </View>

          <View style={styles.sliderContainer}>
            <Text>Preamp</Text>
            <Slider
              value={settings.preamp}
              onValueChange={(value: number) =>
                setSettings((prev) => ({ ...prev, preamp: value }))
              }
              minimumValue={0}
              maximumValue={100}
              step={1}
            />
            <Text>Bass</Text>
            <Slider
              value={settings.bass}
              onValueChange={(value: number) =>
                setSettings((prev) => ({ ...prev, bass: value }))
              }
              minimumValue={0}
              maximumValue={100}
              step={1}
            />
            <Text>Mid</Text>
            <Slider
              value={settings.mid}
              onValueChange={(value: number) =>
                setSettings((prev) => ({ ...prev, mid: value }))
              }
              minimumValue={0}
              maximumValue={100}
              step={1}
            />
            <Text>Treble</Text>
            <Slider
              value={settings.treble}
              onValueChange={(value: number) =>
                setSettings((prev) => ({ ...prev, treble: value }))
              }
              minimumValue={0}
              maximumValue={100}
              step={1}
            />
            <Text>Reverb</Text>
            <Slider
              value={settings.reverb}
              onValueChange={(value: number) =>
                setSettings((prev) => ({ ...prev, reverb: value }))
              }
              minimumValue={0}
              maximumValue={100}
              step={1}
            />
          </View>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button onPress={handleApply}>Apply</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
  },
  presetButton: {
    margin: 4,
  },
  sliderContainer: {
    gap: 8,
  },
}); 