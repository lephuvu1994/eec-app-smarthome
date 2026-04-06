/* eslint-disable react-compiler/react-compiler */
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useUniwind } from 'uniwind';
import { ETheme } from '@/types/base';
import { Text } from './text';

const ITEM_HEIGHT = 44;

type WheelPickerProps = {
  data: number[];
  value: number;
  onValueChange: (value: number) => void;
  renderItem?: (value: number) => React.ReactNode;
  formatLabel?: (value: number) => string;
};

export function WheelPicker({
  data,
  value,
  onValueChange,
  formatLabel,
}: WheelPickerProps) {
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;
  const scrollViewRef = useRef<ScrollView>(null);
  const [internalValue, setInternalValue] = useState(value);

  const halfHeight = ITEM_HEIGHT * 1.5;

  // Scroll to initial value
  useEffect(() => {
    const index = data.indexOf(value);
    let timeoutId: NodeJS.Timeout;
    if (index >= 0 && scrollViewRef.current) {
      timeoutId = setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: index * ITEM_HEIGHT,
          animated: false,
        });
      }, 100);
    }
    return () => {
      if (timeoutId)
        clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    let index = Math.round(offsetY / ITEM_HEIGHT);

    // clamp
    if (index < 0)
      index = 0;
    if (index >= data.length)
      index = data.length - 1;

    const selectedVal = data[index];
    if (selectedVal !== internalValue) {
      setInternalValue(selectedVal);
    }
  };

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    let index = Math.round(offsetY / ITEM_HEIGHT);

    if (index < 0)
      index = 0;
    if (index >= data.length)
      index = data.length - 1;

    const selectedVal = data[index];
    onValueChange(selectedVal);
  };

  return (
    <View style={styles.container}>
      {/* Highlight bar in the middle */}
      <View
        style={[
          styles.highlight,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          },
        ]}
        pointerEvents="none"
      />

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        snapToAlignment="center"
        decelerationRate="fast"
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingVertical: halfHeight,
        }}
      >
        {data.map((item) => {
          const isSelected = item === internalValue;
          return (
            <View key={String(item)} style={styles.itemContainer}>
              <Text
                style={[
                  styles.itemText,
                  {
                    color: isSelected
                      ? isDark
                        ? '#FFFFFF'
                        : '#000000'
                      : isDark
                        ? '#525252'
                        : '#A3A3A3',
                    fontSize: isSelected ? 24 : 20,
                    fontWeight: isSelected ? '600' : '400',
                  },
                ]}
              >
                {formatLabel ? formatLabel(item) : item}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT * 4,
    width: 80,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlight: {
    position: 'absolute',
    top: ITEM_HEIGHT * 1.5,
    width: '100%',
    height: ITEM_HEIGHT,
    borderRadius: 8,
  },
  itemContainer: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    textAlign: 'center',
  },
});
