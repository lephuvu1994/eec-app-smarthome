import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import type { TxKeyPath } from '@/lib/i18n';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Modal, Text, View } from '@/components/ui';
import { useDeviceTimelinePreview } from '@/features/devices/hooks/use-device-timeline';
import { translate } from '@/lib/i18n';
import 'dayjs/locale/vi';

dayjs.locale('vi');

type Props = {
  modalRef: React.RefObject<BottomSheetModal | null>;
  deviceId: string;
};

export function TimelinePopover({ modalRef, deviceId }: Props) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data, isLoading, isError } = useDeviceTimelinePreview(deviceId, 5);
  const items = data?.data || [];

  const handleViewAll = () => {
    modalRef.current?.dismiss();
    router.push(`/device/${deviceId}/timeline`);
  };

  const renderIcon = (type: string, event: string) => {
    if (type === 'connection') {
      return (
        <View className={`size-8 items-center justify-center rounded-full ${event === 'online' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
          <MaterialCommunityIcons
            name={event === 'online' ? 'wifi' : 'wifi-off'}
            size={16}
            color={event === 'online' ? '#10B981' : '#EF4444'}
          />
        </View>
      );
    }
    return (
      <View className="size-8 items-center justify-center rounded-full bg-blue-500/20">
        <MaterialCommunityIcons name="history" size={16} color="#3B82F6" />
      </View>
    );
  };

  const renderDescription = (item: any) => {
    if (item.type === 'connection') {
      return item.event === 'online' ? 'Thiết bị trực tuyến' : 'Thiết bị ngoại tuyến';
    }
    const sourceStr = item.source ? ` (qua ${item.source === 'app' ? 'Ứng dụng' : item.source.toUpperCase()})` : '';
    const nameStr = item.entityName ? `[${item.entityName}] ` : '';
    return `${nameStr}Trạng thái: ${item.event}${sourceStr}`;
  };

  return (
    <Modal ref={modalRef} snapPoints={['60%']} title={(translate('deviceDetail.timeline.title' as TxKeyPath) || 'Lịch sử hoạt động') as string}>
      <ScrollView contentContainerClassName="p-5" showsVerticalScrollIndicator={false}>
        {isLoading && (
          <View className="items-center justify-center py-10">
            <ActivityIndicator size="small" color="#888" />
          </View>
        )}

        {isError && (
          <Text className="py-4 text-center text-sm text-red-500">Lỗi tải dữ liệu. Vui lòng thử lại sau.</Text>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <View className="items-center justify-center py-10">
            <MaterialCommunityIcons name="clipboard-text-outline" size={48} color="#555" />
            <Text className="mt-4 text-sm text-neutral-400">Chưa có lịch sử hoạt động</Text>
          </View>
        )}

        {items.map(item => (
          <View key={item.id} className="mb-4 flex-row items-start gap-4">
            {renderIcon(item.type, item.event)}

            <View className="flex-1 border-b border-neutral-800 pb-4">
              <Text className="text-sm font-semibold text-white">
                {renderDescription(item)}
              </Text>
              <Text className="mt-1 text-xs text-neutral-400">
                {dayjs(item.createdAt).format('HH:mm - DD/MM/YYYY')}
              </Text>
            </View>
          </View>
        ))}

        {!isLoading && !isError && items.length > 0 && (
          <TouchableOpacity
            onPress={handleViewAll}
            activeOpacity={0.8}
            className="mt-4 mb-10 w-full items-center rounded-2xl border border-neutral-800 bg-[#1B1B1B] py-3.5"
            style={{ marginBottom: insets.bottom + 20 }}
          >
            <Text className="text-sm font-semibold text-white">
              {(translate('deviceDetail.timeline.viewAll' as TxKeyPath) || 'Xem tất cả lịch sử') as string}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </Modal>
  );
}
