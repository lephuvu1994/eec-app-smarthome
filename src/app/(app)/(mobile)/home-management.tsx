import type { THomeManagementHandle } from '@/features/settings-screen/home-management-screen';

import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { useLayoutEffect, useRef } from 'react';
import { useUniwind } from 'uniwind';

import { View } from '@/components/ui';
import { ZeegoNativeMenu } from '@/components/ui/zeego-native-menu';
import {
  HomeManagement,
} from '@/features/settings-screen/home-management-screen';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';

export default function HomeManagementRoute() {
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;
  const screenRef = useRef<THomeManagementHandle>(null);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <ZeegoNativeMenu
          style={{ alignSelf: 'flex-end' }}
          elements={[
            {
              key: 'add-room',
              title: translate('roomManagement.addRoom'),
              icon: { ios: 'plus.square' },
              onPress: () => screenRef.current?.addRoom(),
            },
            {
              key: 'add-floor',
              title: translate('roomManagement.addFloor'),
              icon: { ios: 'square.stack.3d.up' },
              onPress: () => screenRef.current?.addFloor(),
            },
            { type: 'separator' as const, key: 'sep-1' },
            {
              key: 'edit',
              title: translate('roomManagement.edit'),
              icon: { ios: 'pencil' },
              onPress: () => screenRef.current?.edit(),
            },
          ]}
          triggerComponent={(
            <View pointerEvents="none" className="size-9 items-center justify-center">
              <AntDesign name="plus" size={20} color={isDark ? '#fff' : '#737373'} />
            </View>
          )}
        />
      ),
    });
  }, [isDark, navigation]);

  return (
    <HomeManagement ref={screenRef} />
  );
}
