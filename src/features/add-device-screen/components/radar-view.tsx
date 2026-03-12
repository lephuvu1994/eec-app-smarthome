import type { DeviceResult } from '../types';
import { Canvas, Circle as SkiaCircle, LinearGradient as SkiaLinearGradient, SweepGradient, vec } from '@shopify/react-native-skia';
import { Image } from 'expo-image';
import * as React from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { CENTER, HIGHLIGHT_COLOR, RADAR_SIZE } from '../constants';

function RadarDeviceIcon({
  device,
  currentBeamRotation,
}: {
  device: DeviceResult;
  currentBeamRotation: number;
}) {
  const rad = (device.angle * Math.PI) / 180;
  const activeRadius = RADAR_SIZE * 0.45;
  const x = CENTER + activeRadius * device.radius * Math.cos(rad);
  const y = CENTER + activeRadius * device.radius * Math.sin(rad);

  const ICON_CONTAINER_SIZE = 64;

  const animatedStyle = useAnimatedStyle(() => {
    const currentRot = currentBeamRotation % 360;
    let diff = currentRot - device.angle;
    if (diff < 0)
      diff += 360;
    const isScanning = diff > 0 && diff < 133;

    return {
      transform: [{ scale: withTiming(isScanning ? 1.15 : 1, { duration: 300 }) }],
      borderColor: withTiming(isScanning ? HIGHLIGHT_COLOR : 'transparent', { duration: 300 }),
      borderWidth: withTiming(isScanning ? 3 : 0, { duration: 300 }),
      opacity: withTiming(isScanning ? 1 : 0.7, { duration: 300 }),
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
          backgroundColor: 'white',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 6,
        },
        animatedStyle,
      ]}
    >
      <Image
        source={{ uri: device.imageUrl }}
        style={{
          width: ICON_CONTAINER_SIZE - 12,
          height: ICON_CONTAINER_SIZE - 12,
          borderRadius: (ICON_CONTAINER_SIZE - 12) / 2,
        }}
        contentFit="cover"
      />
    </Animated.View>
  );
}

export function RadarView({
  devices,
  rotation,
  beamStyle,
}: {
  devices: DeviceResult[];
  rotation: { value: number };
  beamStyle: any;
}) {
  return (
    <View
      className="relative items-center justify-center"
      style={{ width: RADAR_SIZE, height: RADAR_SIZE }}
    >
      <Canvas style={{ position: 'absolute', width: RADAR_SIZE, height: RADAR_SIZE }}>
        <SkiaCircle cx={CENTER} cy={CENTER} r={RADAR_SIZE * 0.48}>
          <SkiaLinearGradient
            start={vec(CENTER, 0)}
            end={vec(CENTER, RADAR_SIZE)}
            colors={['rgba(163, 236, 62, 0.05)', 'rgba(163, 236, 62, 0.1)']}
          />
        </SkiaCircle>
        <SkiaCircle cx={CENTER} cy={CENTER} r={RADAR_SIZE * 0.35}>
          <SkiaLinearGradient
            start={vec(CENTER, 0)}
            end={vec(CENTER, RADAR_SIZE)}
            colors={['rgba(163, 236, 62, 0.05)', 'rgba(163, 236, 62, 0.2)']}
          />
        </SkiaCircle>
        <SkiaCircle cx={CENTER} cy={CENTER} r={RADAR_SIZE * 0.20}>
          <SkiaLinearGradient
            start={vec(CENTER, 0)}
            end={vec(CENTER, RADAR_SIZE)}
            colors={['rgba(163, 236, 62, 0.05)', 'rgba(163, 236, 62, 0.1)']}
          />
        </SkiaCircle>
      </Canvas>

      <Animated.View
        style={[beamStyle, { position: 'absolute', width: RADAR_SIZE, height: RADAR_SIZE }]}
      >
        <Canvas style={{ flex: 1 }}>
          <SkiaCircle cx={CENTER} cy={CENTER} r={RADAR_SIZE / 2}>
            <SweepGradient
              c={vec(CENTER, CENTER)}
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
        <RadarDeviceIcon key={device.id} device={device} currentBeamRotation={rotation.value} />
      ))}
    </View>
  );
}
