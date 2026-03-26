import { FontAwesome, FontAwesome6 } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text, View } from '@/components/ui';
import { useModal } from '@/components/ui/modal';
import { useShutterControl } from '@/features/devices/hooks/use-shutter-control';
import { translate } from '@/lib/i18n';
import { getPrimaryEntities } from '@/lib/utils/device-entity-helper';
import { useConfigManager } from '@/stores/config/config';
import { useDeviceStore } from '@/stores/device/device-store';

import { ShutterBackgroundModal } from '../components/modals/shutter-background-modal';
import { getShutterBackgroundSource } from '../utils/shutter-constants';

type Props = {
  deviceId: string;
  entityId?: string;
};

export function CurtainDetailScreen({ deviceId, entityId }: Props) {
  const router = useRouter();
  const devices = useDeviceStore(s => s.devices);
  const device = Array.isArray(devices) ? devices.find(d => d.id === deviceId) : undefined;

  // Custom Hook Logic
  const primaryEntity = entityId 
    ? device?.entities.find(e => e.id === entityId)
    : device ? getPrimaryEntities(device)[0] : undefined;
    
  const { position, isControlling, handleOpen, handleClose, handleStop } = useShutterControl(device, primaryEntity);

  // Background State
  const backgroundId = useConfigManager(s => s.shutterBackgrounds[deviceId]) || '1';
  const bgSource = getShutterBackgroundSource(backgroundId);
  const modal = useModal();

  if (!device) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-black">
        <Text className="mt-12 text-white">{translate('base.somethingWentWrong')}</Text>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* Background Image */}
      <Image
        source={bgSource}
        contentFit="cover"
        className="absolute inset-0 h-full w-full"
      />

      {/* Overlay gradient/darken */}
      <View className="absolute inset-0 bg-black/40" pointerEvents="none" />

      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-3">
          <TouchableOpacity onPress={() => router.back()} className="h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/25">
            <FontAwesome name="chevron-left" size={18} color="#fff" />
          </TouchableOpacity>
          <Text className="text-xl font-bold tracking-wide text-white">
            {device.name}
          </Text>
          <TouchableOpacity onPress={modal.present} className="h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/25">
            <FontAwesome name="cog" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

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
      </SafeAreaView>

      <ShutterBackgroundModal modalRef={modal.ref} deviceId={deviceId} />
    </View>
  );
}
