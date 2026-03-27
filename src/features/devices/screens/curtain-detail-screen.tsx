import { FontAwesome, FontAwesome6, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useLayoutEffect } from 'react';

import { TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';
import { Text, View } from '@/components/ui';
import { useModal } from '@/components/ui/modal';
import { useShutterControl } from '@/features/devices/hooks/use-shutter-control';

import { translate } from '@/lib/i18n';
import { getPrimaryEntities } from '@/lib/utils/device-entity-helper';
import { useConfigManager } from '@/stores/config/config';
import { useDeviceStore } from '@/stores/device/device-store';
import { ETheme } from '@/types/base';
import { ShutterBackgroundModal } from '../components/modals/shutter-background-modal';
import { getShutterBackgroundSource } from '../utils/shutter-constants';

type Props = {
  deviceId: string;
  entityId?: string;
};

export function CurtainDetailScreen({ deviceId, entityId }: Props) {
  const devices = useDeviceStore(s => s.devices);
  const device = devices.find(d => d.id === deviceId);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useUniwind();

  // Custom Hook Logic
  const primaryEntity = entityId
    ? device?.entities.find(e => e.id === entityId)
    : device ? getPrimaryEntities(device)[0] : undefined;

  const { position, isControlling, handleOpen, handleClose, handleStop } = useShutterControl(device, primaryEntity);

  // Background State
  const backgroundId = useConfigManager(s => s.shutterBackgrounds[deviceId]) || '1';
  const bgSource = getShutterBackgroundSource(backgroundId);
  const modal = useModal();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          className="size-9 items-center justify-center"
        >
          <MaterialCommunityIcons name="close" size={24} color={theme === ETheme.Dark ? '#FFF' : '#1B1B1B'} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={modal.present}
          activeOpacity={0.7}
          className="h-9 w-12 items-center justify-center"
        >
          <FontAwesome name="cog" size={18} color={theme === ETheme.Dark ? '#FFF' : '#1B1B1B'} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, modal.present, theme]);

  return (
    <View className="flex-1" style={{ paddingTop: insets.top, paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right }}>
      <View className="relative flex-1">
        <Image
          source={bgSource}
          style={{ width: '100%', height: '100%', inset: 0, position: 'absolute' }}
          contentFit="contain"
        />

        {/* Roller Shutter UI */}
        <View className="flex-1 items-center justify-center">
          <Text className="text-6xl font-bold text-white drop-shadow-md">
            {position}
            %
          </Text>
          <Text className="mt-2 text-lg font-medium text-white/80">
            {translate('deviceDetail.shutter.position' as any, { defaultValue: 'Position' })}
          </Text>
        </View>

        {/* Controls */}
        <View className="mb-10 w-full flex-row items-center justify-between px-6">
          {/* DOWN/CLOSE */}
          <TouchableOpacity
            className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-white shadow-md"
            onPress={handleClose}
            disabled={isControlling}
            activeOpacity={0.7}
          >
            <FontAwesome6 name="chevron-down" size={24} color="#1B1B1B" />
          </TouchableOpacity>

          {/* STOP */}
          <TouchableOpacity
            className="flex h-[88px] w-[88px] items-center justify-center rounded-full bg-[#A3E635] shadow-md"
            onPress={handleStop}
            disabled={isControlling}
            activeOpacity={0.7}
          >
            <FontAwesome6 name="pause" size={24} color="#1B1B1B" />
          </TouchableOpacity>

          {/* UP/OPEN */}
          <TouchableOpacity
            className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-white shadow-md"
            onPress={handleOpen}
            disabled={isControlling}
            activeOpacity={0.7}
          >
            <FontAwesome6 name="chevron-up" size={24} color="#1B1B1B" />
          </TouchableOpacity>
        </View>
      </View>
      <ShutterBackgroundModal modalRef={modal.ref} deviceId={deviceId} />
    </View>
  );
}
