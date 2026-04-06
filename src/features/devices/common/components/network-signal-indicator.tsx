import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as React from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui';
import { EDeviceProtocol } from '@/lib/api/devices/device.service';
import { translate } from '@/lib/i18n';

type Props = {
  protocol: EDeviceProtocol;
  rssi?: number | null;
  linkquality?: number | null;
  color?: string;
  size?: number;
};

/**
 * Unified signal quality indicator for both Wi-Fi (RSSI dBm) and Zigbee (LQI 0-255).
 * Renders appropriate icon + numeric readout based on device protocol.
 */
export function NetworkSignalIndicator({ protocol, rssi, linkquality, color = '#A1A1AA', size = 20 }: Props) {
  if (protocol === EDeviceProtocol.WIFI) {
    if (rssi === undefined || rssi === null) {
      return null;
    }

    // Wi-Fi RSSI thresholds (dBm): ≥-50 excellent, ≥-65 good, ≥-80 fair, else weak
    let iconName: keyof typeof MaterialCommunityIcons.glyphMap = 'wifi-strength-outline';
    if (rssi >= -50) {
      iconName = 'wifi-strength-4';
    }
    else if (rssi >= -65) {
      iconName = 'wifi-strength-3';
    }
    else if (rssi >= -80) {
      iconName = 'wifi-strength-2';
    }
    else {
      iconName = 'wifi-strength-1';
    }

    return (
      <View className="flex-row items-center gap-1">
        <MaterialCommunityIcons name={iconName} size={size} color={color} />
        <Text className="text-xs font-medium" style={{ color }}>
          {rssi}
          {` ${translate('device.signal.dBm')}`}
        </Text>
      </View>
    );
  }

  if (protocol === EDeviceProtocol.ZIGBEE) {
    if (linkquality === undefined || linkquality === null) {
      return null;
    }

    // Zigbee LQI thresholds (0-255): ≥200 excellent, ≥100 good, else weak
    let iconName: keyof typeof MaterialCommunityIcons.glyphMap = 'access-point';
    if (linkquality >= 200) {
      iconName = 'access-point';
    }
    else if (linkquality >= 100) {
      iconName = 'access-point-network';
    }
    else {
      iconName = 'access-point-network-off';
    }

    // Normalize LQI to percentage for display
    const pct = Math.round((linkquality / 255) * 100);

    return (
      <View className="flex-row items-center gap-1">
        <MaterialCommunityIcons name={iconName} size={size} color={color} />
        <Text className="text-xs font-medium" style={{ color }}>
          {translate('device.signal.lqi', { pct, lqi: linkquality })}
        </Text>
      </View>
    );
  }

  return null;
}
