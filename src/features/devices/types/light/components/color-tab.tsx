import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as React from 'react';
import { Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import Svg, { Defs, FeBlend, FeFlood, FeGaussianBlur, Filter, G, LinearGradient, Path, Stop } from 'react-native-svg';
import { colors, Text, TouchableOpacity, View, WIDTH } from '@/components/ui';
import { BASE_SPACE_HORIZONTAL } from '@/constants';
import { translate } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { LightSlider } from './light-slider';

type Props = {
  isOn: boolean;
  color: { h: number; s: number; b: number };
  brightness: number;
  onToggle: () => void;
  onChangeColor: (val: { h: number; s: number; b: number }) => void;
  onChangeBrightness: (val: number) => void;
};

function hsvToHslString(h: number, s: number, v: number): string {
  const l = (v / 100) * (200 - s) / 200;
  const sl = l === 0 || l === 1 ? 0 : ((v / 100) - l) / Math.min(l, 1 - l);
  return `hsl(${h}, ${Math.round(sl * 100)}%, ${Math.round(l * 100)}%)`;
}

export function ColorTab({ isOn, color, brightness, onToggle, onChangeColor, onChangeBrightness }: Props) {
  const [localH, setLocalH] = React.useState(color?.h || 0);
  const [localS, setLocalS] = React.useState(color?.s || 100);

  const previewColor = React.useMemo(() => hsvToHslString(localH, localS, 100), [localH, localS]);

  const screenWidth = Dimensions.get('window').width;

  const animatedBeamStyle = useAnimatedStyle(() => {
    // Độ sáng (0-100) map thành Opacity (0.15 - 1.0) để beam ánh sáng không bị mờ hụt quá nhanh
    const targetOpacity = isOn ? (0.15 + (brightness / 100) * 0.85) : 0;
    return {
      opacity: withTiming(targetOpacity, { duration: 300 }),
      backgroundColor: 'transparent',
    };
  });

  const commitColor = () => {
    onChangeColor({ h: Math.round(localH), s: Math.round(localS), b: brightness });
  };

  const width = WIDTH - BASE_SPACE_HORIZONTAL * 2;

  return (
    <View className="flex-1 items-center pt-8">
      {/* Figma Lamp + Beam section */}
      <View className="relative mb-10 w-full items-center justify-center pt-4">

        {/* Lamp Icon */}
        <View className="w-full items-center justify-center px-4">
          <View className="relative w-full">
            <Image source={require('@@/assets/device/light/light-2-on.png')} style={{ width, height: 5 * width / 6 }} />
            {(() => {
              const svgWidth = width * 72 / 100;
              const svgHeight = width * 72 / 200; // strictly proportional height

              return (
                <Animated.View className="pointer-events-none absolute inset-0 w-full items-center justify-center" style={[{ bottom: -2 * svgHeight + 40 }, animatedBeamStyle]}>
                  {/* Tăng viewBox Y lên 128 để khớp với Filter (Figma hay export lỗi viewBox hụt mất phần blur) */}
                  <Svg width={svgWidth} height={svgHeight * (128 / 112)} viewBox="0 0 216 128" fill="none" style={{ overflow: 'visible' }}>
                    <G filter="url(#filter0_f_64192_7020)">
                      <Path d="M148.142 15H69.3539L15 113H201L148.142 15Z" fill="url(#paint0_linear_64192_7020)" />
                    </G>
                    <Defs>
                      {/* Filter cũng cho width=240, height=140 để đảm bảo viền blur lan ra không đụng giới hạn */}
                      <Filter id="filter0_f_64192_7020" x="-10" y="0" width="240" height="140" filterUnits="userSpaceOnUse">
                        <FeFlood floodOpacity="0" result="BackgroundImageFix" />
                        <FeBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                        <FeGaussianBlur stdDeviation="7.5" result="effect1_foregroundBlur_64192_7020" />
                      </Filter>
                      <LinearGradient id="paint0_linear_64192_7020" x1="108" y1="15" x2="108" y2="113" gradientUnits="userSpaceOnUse">
                        <Stop stopColor={previewColor} stopOpacity="0.32" />
                        <Stop offset="1" stopColor={previewColor} stopOpacity="0" />
                      </LinearGradient>
                    </Defs>
                  </Svg>
                </Animated.View>
              );
            })()}
          </View>
        </View>

      </View>

      <View className="mt-8 w-full max-w-sm gap-8 px-2">
        <View>
          <Text className="mb-3 text-center text-sm font-medium text-neutral-500 dark:text-neutral-400">{translate('deviceDetail.light.colorHue')}</Text>
          <LightSlider
            value={localH / 360}
            onChange={v => setLocalH(v * 360)}
            onSlidingComplete={commitColor}
            width={screenWidth - 48}
            height={16}
            colors={['#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF', '#FF0000']}
          />
        </View>

        <View>
          <Text className="mb-3 text-center text-sm font-medium text-neutral-500 dark:text-neutral-400">{translate('deviceDetail.light.colorSaturation')}</Text>
          <LightSlider
            value={localS / 100}
            onChange={v => setLocalS(v * 100)}
            onSlidingComplete={commitColor}
            width={screenWidth - 48}
            height={16}
            colors={['rgba(255,255,255,0.7)', previewColor]}
          />
        </View>

        <View>
          <Text className="mb-3 text-center text-sm font-medium text-neutral-500 dark:text-neutral-400">{translate('deviceDetail.light.brightness')}</Text>
          <LightSlider
            value={brightness / 100}
            onChange={(_v) => {}} // Local update is handled in parent mostly, but we can emit
            onSlidingComplete={v => onChangeBrightness(v * 100)}
            width={screenWidth - 48}
            height={16}
            colors={['rgba(200,200,200,0.2)', '#FFF3E0']}
          />
        </View>
      </View>

      {/* Floating ON/OFF Round Button - Directly below the light */}
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.8}
        className={cn('mt-8 flex size-14 items-center justify-center rounded-full shadow-lg')}
        style={isOn && {
          backgroundColor: colors.neon,
        }}
      >
        <MaterialCommunityIcons name="power" size={26} color="#1B1B1B" />
      </TouchableOpacity>
    </View>
  );
}
