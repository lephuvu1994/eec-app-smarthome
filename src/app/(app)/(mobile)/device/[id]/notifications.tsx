import { useLocalSearchParams } from 'expo-router';
import * as React from 'react';

import { DeviceNotificationsScreen } from '@/features/devices/screens/device-notifications-screen';

export default function NotificationsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) {
    return null;
  }

  return <DeviceNotificationsScreen deviceId={id} />;
}
