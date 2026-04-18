import { useRouter } from 'expo-router';
import { useCallback, useState, useMemo } from 'react';
import { FlatList, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { CustomHeader, HeaderBackButton, useHeaderOffset } from '@/components/base/header/CustomHeader';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { Text, View } from '@/components/ui';
import { useDevices } from '@/hooks/use-devices';
import { translate } from '@/lib/i18n';
import { useHomeDataStore } from '@/stores/home/home-data-store';
import { useHomeStore } from '@/stores/home/home-store';

import { DeviceActionConfigSheet } from './components/device-action-config-sheet';
import { IS_IOS } from '@/components/ui';
import { useModal } from '@/components/ui/modal';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

// ─── FilterChipRow ──────────────────────────────────────────────────────────────

type TChip = { id: string; label: string };

function FilterChipRow({
  chips,
  selected,
  onSelect,
}: {
  chips: TChip[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 6 }}
    >
      {chips.map((chip) => {
        const isActive = selected === chip.id;
        return (
          <Pressable
            key={chip.id}
            onPress={() => onSelect(chip.id)}
            className={`h-7 items-center justify-center rounded-full px-3 border ${isActive
              ? 'border-transparent bg-[#1B1B1B] dark:bg-emerald-500'
              : 'border-gray-200 bg-[#F3F4F6] dark:border-white/10 dark:bg-charcoal-800'
              }`}
          >
            <Text
              className={`text-[11px] font-semibold ${isActive ? 'text-white' : 'text-[#6B7280] dark:text-neutral-400'
                }`}
            >
              {chip.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ─── DeviceSelectorScreen ───────────────────────────────────────────────────────

export function DeviceSelectorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const homeId = useHomeStore.use.selectedHomeId();
  const { data: devicesData } = useDevices({ homeId: homeId || undefined });
  const heightOffset = useHeaderOffset();

  // Home structure
  const floors = useHomeDataStore(s => s.floors ?? []);
  const rooms = useHomeDataStore(s => s.rooms ?? []);

  const deviceConfigSheet = useModal();
  const [selectedDevice, setSelectedDevice] = useState<{ id: string; token: string; name: string } | null>(null);

  // ─── Filter State ─────────────────────────────────────────────────────────────
  const [selectedFloor, setSelectedFloor] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Layer 1: Tầng
  const floorChips = useMemo<TChip[]>(() => [
    { id: 'all', label: 'Tất cả' },
    ...floors.map(f => ({ id: f.id, label: f.name })),
  ], [floors]);

  // Layer 2: Phòng — lọc theo tầng, embed tên tầng vào label khi chỉ có 1 tầng
  const roomChips = useMemo<TChip[]>(() => {
    const multiFloor = floors.length >= 2;
    const filteredRooms = (multiFloor && selectedFloor !== 'all')
      ? rooms.filter(r => r.floorId === selectedFloor)
      : rooms;

    return [
      { id: 'all', label: 'Tất cả' },
      ...filteredRooms.map(r => {
        // Chỉ 1 tầng: hiển thị "Tầng X - Phòng Y" để người dùng biết ngữ cảnh
        if (!multiFloor && floors.length === 1) {
          const floorName = floors[0].name;
          return { id: r.id, label: `${floorName} · ${r.name}` };
        }
        return { id: r.id, label: r.name };
      }),
    ];
  }, [rooms, floors, selectedFloor]);

  // Layer 3: Loại thiết bị
  const typeChips = useMemo<TChip[]>(() => {
    const types = new Set<string>();
    devicesData?.data?.forEach(d => {
      if (d.modelName) types.add(d.modelName);
    });
    return [
      { id: 'all', label: 'Tất cả' },
      ...Array.from(types).map(t => ({ id: t, label: t })),
    ];
  }, [devicesData]);

  // Filtered devices applying all 3 layers
  const filteredDevices = useMemo(() => {
    if (!devicesData?.data) return [];
    return devicesData.data.filter(d => {
      // Layer 1 — Tầng: room phải thuộc floor được chọn
      if (selectedFloor !== 'all') {
        const room = rooms.find(r => r.id === d.room?.id);
        if (room?.floorId !== selectedFloor) return false;
      }
      // Layer 2 — Phòng
      if (selectedRoom !== 'all' && d.room?.id !== selectedRoom) return false;
      // Layer 3 — Loại
      if (selectedType !== 'all' && d.modelName !== selectedType) return false;
      return true;
    });
  }, [devicesData, selectedFloor, selectedRoom, selectedType, rooms]);

  const handleSelectDevice = useCallback((deviceId: string, deviceToken: string, deviceName: string) => {
    setSelectedDevice({ id: deviceId, token: deviceToken, name: deviceName });
    setTimeout(() => {
      deviceConfigSheet.present();
    }, 100);
  }, [deviceConfigSheet]);

  // Reset room when floor changes
  const handleFloorChange = useCallback((id: string) => {
    setSelectedFloor(id);
    setSelectedRoom('all');
  }, []);

  return (
    <BaseLayout>
      <CustomHeader
        title={translate('scenes.builder.selectDevice')}
        leftContent={<HeaderBackButton onPress={() => router.back()} />}
      />

      {/* 3-layer Filter Section */}
      <View style={{ paddingTop: heightOffset + 6, paddingBottom: 8, gap: 4 }}>
        {floors.length >= 2 && (
          <FilterChipRow chips={floorChips} selected={selectedFloor} onSelect={handleFloorChange} />
        )}
        {roomChips.length > 1 && (
          <FilterChipRow chips={roomChips} selected={selectedRoom} onSelect={setSelectedRoom} />
        )}
        <FilterChipRow chips={typeChips} selected={selectedType} onSelect={setSelectedType} />
      </View>

      <FlatList
        data={filteredDevices}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 20, paddingTop: 4 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="mb-3 flex-row items-center justify-between rounded-xl bg-white p-3 shadow-[0_2px_8px_rgb(0,0,0,0.04)] dark:bg-charcoal-900 border border-transparent dark:border-white/5"
            onPress={() => handleSelectDevice(item.id, item.token, item.name)}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center gap-3">
              <View className="size-12 rounded-xl bg-gray-50 dark:bg-charcoal-800 items-center justify-center">
                <MaterialCommunityIcons name="devices" size={24} color="#6B7280" />
              </View>
              <View>
                <Text className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {item.name}
                </Text>
                <View className="flex-row items-center mt-1">
                  <View className={`size-2.5 rounded-full mr-1.5 ${item.status === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <Text className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {item.status === 'online' ? translate('base.online') : translate('base.offline')}
                  </Text>
                </View>
              </View>
            </View>
            <View className="size-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 items-center justify-center">
              <MaterialCommunityIcons name="plus" size={20} color="#10B981" />
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View className="mt-10 items-center justify-center">
            <Text className="text-gray-500">{translate('scenes.builder.noDevicesInArea')}</Text>
          </View>
        )}
      />
      {IS_IOS ? (
        <BottomSheetModalProvider>
          <DeviceActionConfigSheet
            ref={deviceConfigSheet.ref}
            deviceId={selectedDevice?.id ?? null}
            deviceToken={selectedDevice?.token ?? null}
            deviceName={selectedDevice?.name ?? null}
            onSuccess={() => router.back()}
          />
        </BottomSheetModalProvider>
      ) : (
        <DeviceActionConfigSheet
          ref={deviceConfigSheet.ref}
          deviceId={selectedDevice?.id ?? null}
          deviceToken={selectedDevice?.token ?? null}
          deviceName={selectedDevice?.name ?? null}
          onSuccess={() => router.back()}
        />
      )}
    </BaseLayout>
  );
}
