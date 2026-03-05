import type { LayoutChangeEvent, TextInput, TextInputProps } from 'react-native';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { I18nManager, TextInput as NTextInput, PixelRatio, StyleSheet, View } from 'react-native';

import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, Mask, Rect } from 'react-native-svg';
import { twMerge } from 'tailwind-merge';
import { tv } from 'tailwind-variants/lite';

import { Text } from './text';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const inputTv = tv({
  slots: {
    container: 'relative w-full',
    input:
      'bg-transparent px-4 py-4 text-base/5 font-medium text-white',
  },
  variants: {
    disabled: {
      true: {
        input: 'rounded-xl bg-white/10 opacity-70',
      },
    },
  },
});

type NInputProps = TextInputProps & {
  label?: string;
  disabled?: boolean;
  error?: string;
  inputClassName?: string;
  rightIcon?: React.ReactNode; // Thêm prop để nhận Icon từ bên ngoài
  labelTextColor?: string;
  labelTextColorInactive?: string;
  borderColor?: {
    active: string;
    inactive: string;
  };
  containerClassName?: string;
};

export function FloatInput({ ref, ...props }: NInputProps & { ref?: React.RefObject<TextInput | null> }) {
  const {
    label,
    error,
    testID,
    disabled,
    inputClassName,
    rightIcon, // Lấy Icon ra
    value,
    placeholderTextColor,
    labelTextColor,
    labelTextColorInactive,
    borderColor,
    containerClassName,
    ...inputProps
  } = props;

  const [isFocussed, setIsFocussed] = useState(false);
  const [labelWidth, setLabelWidth] = useState(0);
  const [box, setBox] = useState({ width: 0, height: 0 });

  const strokeWidth = 1.5;

  // --- KHỐI ANIMATION CHO ERROR MESSAGE ---
  // Shared value để điều khiển animation (0: ẩn, 1: hiện)
  const errorAnimation = useSharedValue(0);

  const onBlur = React.useCallback((e: any) => {
    setIsFocussed(false);
    inputProps.onBlur?.(e);
  }, [inputProps]);

  const onFocus = React.useCallback((e: any) => {
    setIsFocussed(true);
    inputProps.onFocus?.(e);
  }, [inputProps]);

  const fontScale = PixelRatio.getFontScale();
  const INPUT_HEIGHT = 50 * fontScale;

  const styles = React.useMemo(
    () => inputTv({ disabled: Boolean(disabled) }),
    [disabled],
  );

  const hasValue = Boolean(value && value.toString().length > 0);
  const animation = useSharedValue(hasValue ? 1 : 0);

  // LOGIC THÔNG MINH: Chỉ hiện lỗi khi có lỗi VÀ input đang không được focus
  const shouldShowError = Boolean(error && !isFocussed);

  // Kích hoạt animation ẩn/hiện Error
  useEffect(() => {
    if (shouldShowError) {
      errorAnimation.value = withTiming(1, { duration: 300 });
    }
    else {
      errorAnimation.value = withTiming(0, { duration: 200 });
    }
  }, [shouldShowError]);

  useEffect(() => {
    if (hasValue || isFocussed) {
      animation.value = withTiming(1, { duration: 200 });
    }
    else {
      animation.value = withTiming(0, { duration: 200 });
    }
  }, [hasValue, isFocussed]);

  const handleLabelLayout = (e: LayoutChangeEvent) => {
    setLabelWidth(e.nativeEvent.layout.width);
  };

  const labelContainerAnimatedStyle = useAnimatedStyle(() => {
    // Dịch chuyển lên trên đúng bằng MỘT NỬA chiều cao của hộp (Đảm bảo luôn nằm trên đường viền)
    const currentHeight = box.height > 0 ? box.height : INPUT_HEIGHT;
    const translateY = interpolate(animation.value, [0, 1], [0, -currentHeight / 2]);
    const scale = interpolate(animation.value, [0, 1], [1, 0.85]);
    return {
      transformOrigin: 'left center',
      transform: [{ translateY }, { scale }],
    };
  });
  const textAnimatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      animation.value,
      [0, 1],
      [labelTextColorInactive ?? 'rgba(255,255,255,0.7)', labelTextColor ?? '#FFFFFF'],
    );
    const opacity = interpolate(animation.value, [0, 1], [0.6, 1]);
    // Dùng shouldShowError để quyết định màu đỏ
    return { color: shouldShowError ? '#ef4444' : color, opacity };
  });

  const animatedMaskProps = useAnimatedProps(() => {
    const gapWidth = interpolate(animation.value, [0, 1], [0, labelWidth * 0.85 + 8]);
    return { width: gapWidth };
  });

  // Màu viền và màu chữ tin nhắn lỗi
  const currentBorderColor = (error && !isFocussed)
    ? '#ef4444'
    : isFocussed
      ? (borderColor
          ? borderColor.active
          : '#FFFFFF')
      : (borderColor ? borderColor.inactive : 'rgba(255,255,255,0.4)');

  // --- ANIMATED STYLE CHO KHỐI ERROR MESSAGE ---
  // Interpolate chiều cao từ 0 đến khoảng 24px (hoặc tự động đo)
  const errorContainerAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(errorAnimation.value, [0, 1], [0, 24]),
      opacity: errorAnimation.value,
      marginTop: interpolate(errorAnimation.value, [0, 1], [0, 4]),
    };
  });

  return (
    <View className={styles.container()}>
      {/* KHỐI INPUT CHÍNH (Vẽ Viền, Ô nhập liệu, Label và Icon) */}
      <View
        className={twMerge('relative w-full justify-center rounded-xl', containerClassName)}
        onLayout={(e) => {
          setBox({
            width: e.nativeEvent.layout.width,
            height: e.nativeEvent.layout.height,
          });
        }}
      >
        {/* 1. KHỐI VẼ SVG */}
        {box.width > 0 && (
          <View style={StyleSheet.absoluteFill} pointerEvents="none" className="z-0">
            <Svg width={box.width} height={box.height}>
              <Defs>
                <Mask id={`gap-mask-${testID || label}`}>
                  <Rect x="0" y="0" width={box.width} height={box.height} fill="white" />
                  <AnimatedRect
                    x="12"
                    y="-10"
                    height="20"
                    fill="black"
                    animatedProps={animatedMaskProps}
                  />
                </Mask>
              </Defs>
              <Rect
                x={strokeWidth / 2}
                y={strokeWidth / 2}
                width={box.width - strokeWidth}
                height={box.height - strokeWidth}
                fill="none"
                stroke={currentBorderColor}
                strokeWidth={strokeWidth}
                rx="12"
                ry="12"
                mask={`url(#gap-mask-${testID || label})`}
              />
            </Svg>
          </View>
        )}

        {/* 2. KHỐI NHẬP LIỆU */}
        <NTextInput
          {...inputProps}
          testID={testID}
          ref={ref}
          placeholder={isFocussed ? inputProps.placeholder : ''}
          placeholderTextColor={placeholderTextColor}
          // Nếu có rightIcon, thêm padding right 'pr-12' để text không lẹm vào icon
          className={twMerge(styles.input(), rightIcon ? 'pr-12' : '', inputClassName)}
          editable={!disabled}
          onBlur={onBlur}
          onFocus={onFocus}
          value={value}
          style={[
            { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
            { textAlign: I18nManager.isRTL ? 'right' : 'left' },
            inputProps.style,
          ]}
        />

        {/* 3. KHỐI CHỨA LABEL (Dùng top-0 bottom-0 justify-center để canh giữa tuyệt đối) */}
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              left: 16,
              top: 0,
              bottom: 0,
              justifyContent: 'center', // Căn giữa chính xác 100% theo chiều dọc
            },
            labelContainerAnimatedStyle,
          ]}
        >
          <Animated.Text
            onLayout={handleLabelLayout}
            className="text-base font-medium"
            style={[textAnimatedStyle]}
            numberOfLines={1}
          >
            {label}
          </Animated.Text>
        </Animated.View>

        {/* 4. KHỐI CHỨA ICON (Dùng top-0 bottom-0 justify-center để canh giữa tuyệt đối) */}
        {rightIcon && (
          <View className="absolute inset-y-0 right-4 z-20 justify-center">
            {rightIcon}
          </View>
        )}

      </View>

      {/* --- 5. KHỐI BÁO LỖI VỚI ANIMATION CHIỀU CAO --- */}
      {/* Chỉ render Animated.View khi Shared Value > 0 hoặc khi có lỗi để tránh lỗi layout lúc đầu */}
      <Animated.View style={[errorContainerAnimatedStyle, { paddingHorizontal: 8 }]}>
        {error && (
          <Text
            testID={testID ? `${testID}-error` : undefined}
            className="text-sm font-medium"
            style={{ color: '#ef4444' }}
          >
            {error}
          </Text>
        )}
      </Animated.View>
    </View>
  );
}
