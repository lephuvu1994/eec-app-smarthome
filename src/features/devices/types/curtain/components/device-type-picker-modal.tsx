/* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect */
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

import type { SharedValue } from 'react-native-reanimated';
import { Image } from 'expo-image';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,

  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Modal, Text, View, WIDTH } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { useConfigManager } from '@/stores/config/config';
import { CURTAIN_DEVICE_TYPES } from '../utils/shutter-constants';

// ── Layout constants ───────────────────────────────────────────────────────
const CARD_WIDTH = WIDTH * 0.55;
const CARD_GAP = 12;
const SIDE_PADDING = (WIDTH - CARD_WIDTH) / 2;

type TDeviceTypePickerModalProps = {
  modalRef: React.RefObject<BottomSheetModal | null>;
  deviceId: string;
  currentTypeId: string;
};

// ── Individual carousel card ───────────────────────────────────────────────
function DeviceTypeCard({
  thumbnail,
  index,
  scrollX,
  isSelected,
}: {
  thumbnail: any;
  index: number;
  scrollX: SharedValue<number>;
  isSelected: boolean;
}) {
  // ★ All animations run on UI thread worklet — guaranteed 60fps
  const cardAnimStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * (CARD_WIDTH + CARD_GAP),
      index * (CARD_WIDTH + CARD_GAP),
      (index + 1) * (CARD_WIDTH + CARD_GAP),
    ];

    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.88, 1, 0.88],
      Extrapolation.CLAMP,
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.5, 1, 0.5],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        {
          width: CARD_WIDTH,
          marginRight: CARD_GAP,
          borderRadius: 16,
          overflow: 'hidden',
        },
        cardAnimStyle,
      ]}
    >
      <Image
        source={thumbnail}
        style={styles.cardImage}
        contentFit="cover"
      />
      {/* Selection indicator */}
      {isSelected && (
        <View className="absolute right-2 bottom-2 h-7 w-7 items-center justify-center rounded-full bg-[#A3E635] shadow-md">
          <Text className="text-sm font-bold text-[#1B1B1B]">✓</Text>
        </View>
      )}
      {/* Dark gradient overlay for non-selected */}
      {!isSelected && (
        <View
          style={StyleSheet.absoluteFill}
          className="bg-black/20"
          pointerEvents="none"
        />
      )}
    </Animated.View>
  );
}

// ── Dot indicator ──────────────────────────────────────────────────────────
function DotIndicator({
  types,
  scrollX,
}: {
  types: typeof CURTAIN_DEVICE_TYPES;
  scrollX: SharedValue<number>;
}) {
  return (
    <View className="mt-4 flex-row items-center justify-center gap-2">
      {types.map((type, i) => (
        <DotItem key={type.id} index={i} scrollX={scrollX} />
      ))}
    </View>
  );
}

function DotItem({ index, scrollX }: { index: number; scrollX: SharedValue<number> }) {
  const dotStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * (CARD_WIDTH + CARD_GAP),
      index * (CARD_WIDTH + CARD_GAP),
      (index + 1) * (CARD_WIDTH + CARD_GAP),
    ];

    const width = interpolate(
      scrollX.value,
      inputRange,
      [6, 20, 6],
      Extrapolation.CLAMP,
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.3, 1, 0.3],
      Extrapolation.CLAMP,
    );

    return { width, opacity };
  });

  return (
    <Animated.View
      style={[
        {
          height: 6,
          borderRadius: 3,
          backgroundColor: '#A3E635',
        },
        dotStyle,
      ]}
    />
  );
}

// ── Main Modal Component ───────────────────────────────────────────────────
export function DeviceTypePickerModal({
  modalRef,
  deviceId,
  currentTypeId,
}: TDeviceTypePickerModalProps) {
  const insets = useSafeAreaInsets();
  const setDeviceType = useConfigManager(s => s.setShutterDeviceType);
  const scrollX = useSharedValue(0);
  const scrollRef = React.useRef<Animated.ScrollView>(null);
  const [activeIndex, setActiveIndex] = React.useState(() => {
    const idx = CURTAIN_DEVICE_TYPES.findIndex(t => t.id === currentTypeId);
    return idx >= 0 ? idx : 0;
  });

  // ★ Scroll handler runs entirely on UI thread worklet
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const initialOffset = React.useMemo(() => {
    return activeIndex * (CARD_WIDTH + CARD_GAP);
  }, [activeIndex]);

  React.useEffect(() => {
    // eslint-disable-next-line react-compiler/react-compiler
    scrollX.value = initialOffset;
  }, [initialOffset, scrollX]);

  // Snap to the currently selected card when modal opens
  const handleModalChange = React.useCallback((index: number) => {
    if (index >= 0) {
      const idx = CURTAIN_DEVICE_TYPES.findIndex(t => t.id === currentTypeId);
      if (idx >= 0) {
        setActiveIndex(idx);
        // eslint-disable-next-line react-compiler/react-compiler
        scrollX.value = idx * (CARD_WIDTH + CARD_GAP);
        scrollRef.current?.scrollTo({
          x: idx * (CARD_WIDTH + CARD_GAP),
          animated: false,
        });
      }
    }
  }, [currentTypeId, scrollX]);

  const handleMomentumEnd = React.useCallback(
    (event: { nativeEvent: { contentOffset: { x: number } } }) => {
      const newIndex = Math.round(
        event.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_GAP),
      );
      const clampedIndex = Math.max(0, Math.min(newIndex, CURTAIN_DEVICE_TYPES.length - 1));
      setActiveIndex(clampedIndex);

      // Auto-select on snap
      const selectedType = CURTAIN_DEVICE_TYPES[clampedIndex];
      if (selectedType && selectedType.id !== currentTypeId) {
        setDeviceType(deviceId, selectedType.id);
      }
    },
    [currentTypeId, deviceId, setDeviceType],
  );

  const selectedName = CURTAIN_DEVICE_TYPES[activeIndex]?.name;

  return (
    <Modal
      ref={modalRef}
      snapPoints={[insets.bottom + 318]}
      title={translate('deviceDetail.shutter.deviceType' as any, { defaultValue: 'Device Type' })}
      onChange={handleModalChange}
    >
      <View
        className="flex-1 pt-2"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        {/* ── Carousel ─────────────────────────────────────────── */}
        <Animated.ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={CARD_WIDTH + CARD_GAP}
          snapToAlignment="start"
          contentOffset={{ x: initialOffset, y: 0 }}
          contentContainerStyle={{
            paddingLeft: SIDE_PADDING,
            paddingRight: SIDE_PADDING - CARD_GAP,
          }}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          onMomentumScrollEnd={handleMomentumEnd}
        >
          {CURTAIN_DEVICE_TYPES.map((type, index) => (
            <DeviceTypeCard
              key={type.id}
              thumbnail={type.thumbnail}
              index={index}
              scrollX={scrollX}
              isSelected={type.id === currentTypeId}
            />
          ))}
        </Animated.ScrollView>

        {/* ── Dot indicator ────────────────────────────────────── */}
        <DotIndicator types={CURTAIN_DEVICE_TYPES} scrollX={scrollX} />

        {/* ── Selected name ────────────────────────────────────── */}
        {selectedName && (
          <Text className="mt-3 text-center text-base font-semibold text-neutral-700 dark:text-neutral-300">
            {translate(selectedName as any, { defaultValue: 'Roller Shutter' })}
          </Text>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  cardImage: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
});
