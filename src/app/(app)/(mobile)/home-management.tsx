import type { THomeManagementHandle } from '@/features/settings-screen/home-management-screen';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { useRef } from 'react';
import { View } from 'react-native';
import { useUniwind } from 'uniwind';

import { CustomHeader, HeaderIconButton } from '@/components/base/header/CustomHeader';

import { HomeManagement } from '@/features/settings-screen/home-management-screen';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';

export default function HomeManagementRoute() {
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;
  const screenRef = useRef<THomeManagementHandle>(null);
  const navigation = useNavigation();
  const iconColor = isDark ? '#FFF' : '#1B1B1B';

  return (
    <View style={{ flex: 1 }}>
      <CustomHeader
        title={translate('base.roomManagement')}
        tintColor={iconColor}
        leftContent={(
          <HeaderIconButton onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={iconColor} />
          </HeaderIconButton>
        )}
        rightContent={(
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <HeaderIconButton onPress={() => screenRef.current?.addRoom()}>
              <MaterialCommunityIcons name="door-open" size={22} color={iconColor} />
            </HeaderIconButton>
            <HeaderIconButton onPress={() => screenRef.current?.addFloor()}>
              <MaterialCommunityIcons name="layers-plus" size={22} color={iconColor} />
            </HeaderIconButton>
            <HeaderIconButton onPress={() => screenRef.current?.edit()}>
              <MaterialCommunityIcons name="pencil-outline" size={20} color={iconColor} />
            </HeaderIconButton>
          </View>
        )}
      />
      <HomeManagement ref={screenRef} />
    </View>
  );
}
