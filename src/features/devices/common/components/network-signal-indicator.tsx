import * as React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { EDeviceProtocol } from '@/lib/api/devices/device.service';

function WifiSignalIcon({ level, size = 20, activeColor = '#10B981', inactiveColor = '#3F3F46' }: { level: number; size?: number; activeColor?: string; inactiveColor?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {/* 5 bars (4 arcs + 1 dot) */}
      <Path d="M1 5.5a16 16 0 0 1 22 0" stroke={level >= 5 ? activeColor : inactiveColor} />
      <Path d="M3.5 9a12 12 0 0 1 17 0" stroke={level >= 4 ? activeColor : inactiveColor} />
      <Path d="M6 12.5a8 8 0 0 1 12 0" stroke={level >= 3 ? activeColor : inactiveColor} />
      <Path d="M9 16.5a4 4 0 0 1 6 0" stroke={level >= 2 ? activeColor : inactiveColor} />
      <Path d="M12 20h.01" stroke={level >= 1 ? activeColor : inactiveColor} strokeWidth={3} />
    </Svg>
  );
}

function CellularSignalIcon({ level, size = 20, maxBars = 5, activeColor = '#10B981', inactiveColor = '#3F3F46' }: { level: number; size?: number; maxBars?: number; activeColor?: string; inactiveColor?: string }) {
  const bars = Array.from({ length: maxBars });
  const barWidth = Math.max(3, Math.floor(size / (maxBars * 1.5)));

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 1, height: size * 0.8, alignSelf: 'center' }}>
      {bars.map((_, i) => {
        const barLevel = i + 1;
        const heightPct = Math.max(25, (barLevel / maxBars) * 100);
        return (
          <View
            key={`bar-${_}`}
            style={{
              width: barWidth,
              height: `${heightPct}%`,
              backgroundColor: level >= barLevel ? activeColor : inactiveColor,
              borderRadius: barWidth / 2,
            }}
          />
        );
      })}
    </View>
  );
}

function SignalWrapper({ children, level, size }: { children: React.ReactNode; level: number; size: number }) {
  return (
    <View className="relative items-center justify-center">
      {children}
      {level === 0 && (
        <View
          style={{
            position: 'absolute',
            width: size * 1.2,
            height: 2,
            backgroundColor: '#EF4444',
            transform: [{ rotate: '45deg' }],
            borderRadius: 1,
          }}
        />
      )}
    </View>
  );
}

type Props = {
  protocol: EDeviceProtocol;
  isOnline?: boolean;
  rssi?: number | null;
  linkquality?: number | null;
  color?: string;
  size?: number;
};

/**
 * Unified signal quality indicator for both Wi-Fi (RSSI dBm) and Zigbee (LQI 0-255).
 * Renders appropriate icon + numeric readout based on device protocol.
 */
export function NetworkSignalIndicator({ protocol, isOnline, rssi, linkquality, size = 20 }: Props) {
  if (protocol === EDeviceProtocol.WIFI || protocol === EDeviceProtocol.MQTT) {
    if (rssi === undefined || rssi === null) {
      return null;
    }

    // 5 levels for RSSI
    let level = 0;
    if (isOnline === false)
      level = 0;
    else if (rssi >= -50)
      level = 5;
    else if (rssi >= -65)
      level = 4;
    else if (rssi >= -75)
      level = 3;
    else if (rssi >= -85)
      level = 2;
    else level = 1;

    return (
      <View className="flex-row items-center gap-1.5">
        <SignalWrapper level={level} size={size}>
          <WifiSignalIcon level={level} size={size} activeColor="#10B981" inactiveColor="#52525B" />
        </SignalWrapper>
      </View>
    );
  }

  if (protocol === EDeviceProtocol.ZIGBEE) {
    const value = protocol === EDeviceProtocol.ZIGBEE ? linkquality : rssi;
    if (value === undefined || value === null) {
      return null;
    }

    let level = 0;
    if (isOnline === false)
      level = 0;
    else if (value >= 200)
      level = 5;
    else if (value >= 150)
      level = 4;
    else if (value >= 100)
      level = 3;
    else if (value >= 50)
      level = 2;
    else level = 1;

    // Normalize LQI to percentage for display

    return (
      <View className="flex-row items-center gap-1">
        <SignalWrapper level={level} size={size}>
          <CellularSignalIcon level={level} size={size} activeColor="#10B981" inactiveColor="#52525B" />
        </SignalWrapper>
      </View>
    );
  }

  return null;
}
