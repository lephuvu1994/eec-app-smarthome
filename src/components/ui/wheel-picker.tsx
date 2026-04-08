import type { PickerItem } from '@quidone/react-native-wheel-picker';

import QWheelPicker, { usePickerItemHeight, useScrollContentOffset } from '@quidone/react-native-wheel-picker';
import { memo, useMemo } from 'react';
import { Animated, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { useUniwind } from 'uniwind';
import { ETheme } from '@/types/base';

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;

export type WheelPickerProps = {
  data: number[];
  value: number;
  onValueChange: (value: number) => void;
  formatLabel?: (value: number) => string;
  /** Optional width override (default: 80) */
  width?: number;
  /**
   * @deprecated No longer needed — the library handles nested scrolling natively.
   */
  ScrollViewComponent?: React.ElementType;
};

// Custom item container that adds scale transform on top of the library's
// built-in rotateX, translateY, opacity animations.
const ScaledPickerItemContainer = memo(({
  listRef,
  item,
  index,
  faces,
  renderItem,
  itemTextStyle,
  enableScrollByTapOnItem,
  readOnly,
}: any) => {
  const offset = useScrollContentOffset();
  const height = usePickerItemHeight();

  const { opacity, rotateX, translateY, scale } = useMemo(() => {
    const inputRange = faces.map((f: any) => height * (index + f.index));
    return {
      opacity: offset.interpolate({
        inputRange,
        outputRange: faces.map((x: any) => x.opacity),
        extrapolate: 'clamp',
      }),
      rotateX: offset.interpolate({
        inputRange,
        outputRange: faces.map((x: any) => `${x.deg}deg`),
        extrapolate: 'extend',
      }),
      translateY: offset.interpolate({
        inputRange,
        outputRange: faces.map((x: any) => x.offsetY),
        extrapolate: 'extend',
      }),
      // Scale: center item = 1.15, items further away = smaller
      scale: offset.interpolate({
        inputRange: [
          (index - 2) * height,
          (index - 1) * height,
          index * height,
          (index + 1) * height,
          (index + 2) * height,
        ],
        outputRange: [0.75, 0.85, 1.15, 0.85, 0.75],
        extrapolate: 'clamp',
      }),
    };
  }, [faces, height, index, offset]);

  const animatedView = (
    <Animated.View
      style={{
        height,
        opacity,
        transform: [
          { translateY },
          { rotateX },
          { scale },
          { perspective: 1000 },
        ],
      }}
    >
      {renderItem({ item, index, itemTextStyle })}
    </Animated.View>
  );

  if (!enableScrollByTapOnItem || readOnly) {
    return animatedView;
  }

  return (
    <TouchableWithoutFeedback
      onPress={() => listRef.current?.scrollToIndex({ index, animated: true })}
    >
      {animatedView}
    </TouchableWithoutFeedback>
  );
});

export function WheelPicker({
  data,
  value,
  onValueChange,
  formatLabel,
  width = 80,
}: WheelPickerProps) {
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;

  // Transform number[] into PickerItem[] for @quidone format
  const pickerData: PickerItem<number>[] = useMemo(
    () =>
      data.map(num => ({
        value: num,
        label: formatLabel ? formatLabel(num) : String(num),
      })),
    [data, formatLabel],
  );

  return (
    <View style={styles.wrapper}>
      <QWheelPicker
        data={pickerData}
        value={value}
        onValueChanged={({ item: { value: v } }: { item: PickerItem<number> }) => onValueChange(v)}
        itemHeight={ITEM_HEIGHT}
        visibleItemCount={VISIBLE_ITEMS}
        width={width}
        enableScrollByTapOnItem
        itemTextStyle={{
          fontSize: 20,
          fontWeight: '500',
          color: isDark ? '#FFFFFF' : '#000000',
          fontVariant: ['tabular-nums'],
        }}
        overlayItemStyle={{
          backgroundColor: isDark
            ? 'rgba(255, 255, 255, 0.5)'
            : 'rgba(80, 80, 90, 1)',
          borderRadius: 12,
          elevation: 6,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 5,
        }}
        // Override the item container to add animated scale
        renderItemContainer={({ key, ...props }: any) => (
          <ScaledPickerItemContainer key={key} {...props} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
