import type { SharedValue } from 'react-native-reanimated';
import type { TDeviceResult } from '@/features/devices/management/add-device-screen/types';
import { Canvas, Circle as SkiaCircle, LinearGradient as SkiaLinearGradient, SweepGradient, vec } from '@shopify/react-native-skia';
import { Image } from 'expo-image';
import * as React from 'react';
import { View } from 'react-native';
import Animated, { interpolate, interpolateColor, useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated';
import { HIGHLIGHT_COLOR, RADAR_SIZE } from '../constants';

function RadarDeviceIcon({
  device,
  rotation,
  radarSize,
}: {
  device: TDeviceResult;
  rotation: SharedValue<number>;
  radarSize: number;
}) {
  const rad = (device.angle * Math.PI) / 180;
  const activeRadius = radarSize * 0.45;
  const x = radarSize / 2 + activeRadius * device.radius * Math.cos(rad);
  const y = radarSize / 2 + activeRadius * device.radius * Math.sin(rad);

  const ICON_CONTAINER_SIZE = 64;

  // 1. Calculate boolean state first.
  const isScanning = useDerivedValue(() => {
    'worklet';
    const currentRot = rotation.value % 360;
    let diff = currentRot - device.angle;
    if (diff < 0)
      diff += 360;
    return diff > 0 && diff < 133;
  });

  // 2. Animate progress as a shared value (NOT inside useAnimatedStyle).
  const progress = useDerivedValue(() => {
    'worklet';
    return withTiming(isScanning.value ? 1 : 0, { duration: 150 });
  });

  // 3. Read progress value safely in useAnimatedStyle.
  const outerStyle = useAnimatedStyle(() => {
    'worklet';
    const p = progress.value;
    return {
      transform: [{ scale: interpolate(p, [0, 1], [1, 1.1]) }],
      borderColor: interpolateColor(p, [0, 1], ['#E6E6E659', HIGHLIGHT_COLOR]),
      borderWidth: interpolate(p, [0, 1], [0.5, 2.5]),
      shadowOpacity: interpolate(p, [0, 1], [0.06, 0.35]),
      opacity: interpolate(p, [0, 1], [0.8, 1]),
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x - ICON_CONTAINER_SIZE / 2,
          top: y - ICON_CONTAINER_SIZE / 2,
          width: ICON_CONTAINER_SIZE,
          height: ICON_CONTAINER_SIZE,
          borderRadius: ICON_CONTAINER_SIZE / 2,
          shadowColor: HIGHLIGHT_COLOR,
          shadowOffset: { width: 0, height: 0 },
          shadowRadius: 12,
          elevation: 8,
        },
        outerStyle,
      ]}
    >
      <View
        style={{
          flex: 1,
          borderRadius: ICON_CONTAINER_SIZE / 2,
          overflow: 'hidden',
          backgroundColor: 'rgba(255, 255, 255, 0.45)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Image
          source={require('@@/assets/device/camera.png')}
          style={{
            width: ICON_CONTAINER_SIZE - 12,
            height: ICON_CONTAINER_SIZE - 12,
            borderRadius: (ICON_CONTAINER_SIZE - 12) / 2,
          }}
          contentFit="cover"
        />
      </View>
    </Animated.View>
  );
}

export function RadarView({
  devices,
  rotation,
  beamStyle,
  radarSize = RADAR_SIZE,
}: {
  devices: TDeviceResult[];
  rotation: SharedValue<number>;
  beamStyle: any;
  radarSize?: number;
}) {
  return (
    <View
      className="relative items-center justify-center"
      style={{ width: radarSize, height: radarSize }}
    >
      <Canvas style={{ position: 'absolute', width: radarSize, height: radarSize }}>
        <SkiaCircle cx={radarSize / 2} cy={radarSize / 2} r={radarSize * 0.48}>
          <SkiaLinearGradient
            start={vec(radarSize / 2, 0)}
            end={vec(radarSize / 2, radarSize)}
            colors={['rgba(163, 236, 62, 0.05)', 'rgba(163, 236, 62, 0.1)']}
          />
        </SkiaCircle>
        <SkiaCircle cx={radarSize / 2} cy={radarSize / 2} r={radarSize * 0.35}>
          <SkiaLinearGradient
            start={vec(radarSize / 2, 0)}
            end={vec(radarSize / 2, radarSize)}
            colors={['rgba(163, 236, 62, 0.05)', 'rgba(163, 236, 62, 0.2)']}
          />
        </SkiaCircle>
        <SkiaCircle cx={radarSize / 2} cy={radarSize / 2} r={radarSize * 0.20}>
          <SkiaLinearGradient
            start={vec(radarSize / 2, 0)}
            end={vec(radarSize / 2, radarSize)}
            colors={['rgba(163, 236, 62, 0.05)', 'rgba(163, 236, 62, 0.1)']}
          />
        </SkiaCircle>
      </Canvas>

      <Animated.View
        style={[beamStyle, { position: 'absolute', width: radarSize, height: radarSize }]}
      >
        <Canvas style={{ flex: 1 }}>
          <SkiaCircle cx={radarSize / 2} cy={radarSize / 2} r={radarSize / 2}>
            <SweepGradient
              c={vec(radarSize / 2, radarSize / 2)}
              colors={[
                'rgba(163, 236, 62, 0)',
                'rgba(163, 236, 62, 0)',
                'rgba(163, 236, 62, 0.5)',
              ]}
              positions={[0, 0.63019, 1]}
            />
          </SkiaCircle>
        </Canvas>
      </Animated.View>

      {devices.map(device => (
        <RadarDeviceIcon radarSize={radarSize} key={device.id} device={device} rotation={rotation} />
      ))}
    </View>
  );
}
