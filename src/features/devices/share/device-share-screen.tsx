import type { CreateShareModalRef } from '@/features/devices/share/components/create-share-modal';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useRef } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';
import { CustomHeader, HeaderIconButton } from '@/components/base/header/CustomHeader';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { Button } from '@/components/ui';
import { CreateShareModal } from '@/features/devices/share/components/create-share-modal';
import { useDeviceShares, useRemoveDeviceShare } from '@/hooks/use-devices';
import { translate } from '@/lib/i18n';

function Divider() {
  return <View className="ml-4 h-px bg-neutral-100 dark:bg-neutral-700" />;
}

function AvatarFallback({ name, email }: { name?: string | null; email?: string | null }) {
  const initial = name?.charAt(0) || email?.charAt(0) || '?';
  return (
    <View className="size-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
      <Text className="text-lg font-bold text-blue-600 dark:text-blue-300">
        {initial.toUpperCase()}
      </Text>
    </View>
  );
}

export function DeviceShareScreen({ deviceId }: { deviceId: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useUniwind();
  const isDark = theme === 'dark';

  const modalRef = useRef<CreateShareModalRef>(null);

  const { data: shares, isLoading, refetch } = useDeviceShares(deviceId);
  const removeShare = useRemoveDeviceShare(deviceId);

  const handleAddPress = useCallback(() => {
    modalRef.current?.present();
  }, []);

  const handleDelete = useCallback((userId: string, _targetName: string) => {
    Alert.alert(
      translate('deviceShare.remove') as string,
      translate('deviceShare.confirmDelete') as string,
      [
        { text: (translate('deviceShare.cancel') as string) || 'Cancel', style: 'cancel' },
        {
          text: (translate('base.deleteButton') as string) || 'Delete',
          style: 'destructive',
          onPress: () => {
            removeShare.mutate(userId, {
              onSuccess: () => refetch(),
            });
          },
        },
      ],
    );
  }, [removeShare, refetch]);

  return (
    <BaseLayout>
      <View className="relative w-full flex-1">
        <CustomHeader
          title={(translate('deviceShare.title') as string) || 'Chia sẻ thiết bị'}
          tintColor={isDark ? '#FFF' : '#1B1B1B'}
          leftContent={(
            <HeaderIconButton onPress={() => router.back()}>
              <MaterialCommunityIcons name="chevron-left" size={28} color={isDark ? '#FFF' : '#1B1B1B'} />
            </HeaderIconButton>
          )}
          rightContent={(
            <HeaderIconButton onPress={handleAddPress}>
              <MaterialCommunityIcons name="plus" size={28} color={isDark ? '#FFF' : '#1B1B1B'} />
            </HeaderIconButton>
          )}
        />

        <Image
          source={
            isDark
              ? require('@@/assets/base/background-dark.webp')
              : require('@@/assets/base/background-light.webp')
          }
          style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
          contentFit="contain"
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 108, paddingBottom: insets.bottom + 32 }}
        >
          {isLoading
            ? (
                <ActivityIndicator size="large" className="mt-10" />
              )
            : shares && shares.length > 0
              ? (
                  <View className="mx-4 overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-800">
                    {shares.map((share, index) => {
                      const isLast = index === shares.length - 1;
                      const displayName = share.user.firstName
                        ? `${share.user.firstName} ${share.user.lastName || ''}`.trim()
                        : (share.user.email || share.user.phone || 'Unknown User');

                      return (
                        <View key={share.id}>
                          <View className="flex-row items-center justify-between p-4">
                            <View className="flex-1 flex-row items-center pr-4">
                              {share.user.avatar
                                ? (
                                    <Image
                                      source={{ uri: share.user.avatar }}
                                      style={{ width: 40, height: 40, borderRadius: 20 }}
                                    />
                                  )
                                : (
                                    <AvatarFallback name={share.user.firstName} email={share.user.email} />
                                  )}
                              <View className="ml-3 flex-1 flex-col">
                                <Text
                                  className="text-[16px] font-medium text-neutral-900 dark:text-white"
                                  numberOfLines={1}
                                >
                                  {displayName}
                                </Text>
                                <Text className="mt-0.5 text-[13px] text-neutral-500 dark:text-neutral-400">
                                  {share.permission === 'EDITOR' ? 'Editor' : 'Viewer'}
                                </Text>
                              </View>
                            </View>
                            <HeaderIconButton
                              onPress={() => handleDelete(share.userId, displayName)}
                            >
                              <MaterialCommunityIcons name="trash-can-outline" size={24} color="#ef4444" />
                            </HeaderIconButton>
                          </View>
                          {!isLast && <Divider />}
                        </View>
                      );
                    })}
                  </View>
                )
              : (
                  <View className="mx-4 mt-10 items-center justify-center rounded-2xl bg-white p-8 shadow-sm dark:bg-neutral-800">
                    <MaterialCommunityIcons name="account-group-outline" size={64} color={isDark ? '#525252' : '#a3a3a3'} />
                    <Text className="mt-4 mb-6 text-center text-base text-neutral-500 dark:text-neutral-400">
                      {translate('deviceShare.noShares')}
                    </Text>
                    <Button size="default" onPress={handleAddPress} className="w-full">
                      <Text className="font-semibold text-white">
                        {translate('deviceShare.addFirstShare')}
                      </Text>
                    </Button>
                  </View>
                )}
        </ScrollView>
      </View>
      <CreateShareModal ref={modalRef} deviceId={deviceId} onSuccess={refetch} />
    </BaseLayout>
  );
}
