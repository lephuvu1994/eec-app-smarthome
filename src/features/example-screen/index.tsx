import type { Href } from 'expo-router';
import type { TMenuElement } from '@/components/ui/NativeMenu';
import { router } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, ScrollView, Text, View } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { NativeMenu } from '@/components/ui/NativeMenu';
import { translate } from '@/lib/i18n';

export default function ExampleScreen() {
  const [showStatus, setShowStatus] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  // 1. Basic Menu
  const basicElements: TMenuElement[] = [
    {
      key: 'add device',
      title: translate('base.addDevice'),
      icon: { ios: 'plus' },
      onPress: () => router.push('/(app)/(mobile)/(home)/add-device' as Href),
    },
    {
      key: 'add scene',
      title: translate('base.addScene'),
      icon: { ios: 'plus' },
      onPress: () => router.push('/(app)/(mobile)/(home)/add-scene' as Href),
    },
    {
      type: 'separator',
      key: 'sep-1',
    },
    {
      key: 'scan',
      title: translate('base.scan'),
      icon: { ios: 'trash' },
      isDestructive: true,
      onPress: () => router.push('/(app)/(mobile)/(home)/scan' as Href),
    },
  ];

  // 2. Complex Menu (Groups & Submenus)
  const complexElements: TMenuElement[] = [
    {
      type: 'group',
      key: 'view-options',
      title: 'Tùy chọn hiển thị',
      items: [
        {
          type: 'checkbox',
          key: 'status',
          title: 'Hiển thị trạng thái',
          value: showStatus,
          onValueChange: val => setShowStatus(val),
        },
        {
          type: 'checkbox',
          key: 'favorite',
          title: 'Yêu thích',
          value: isFavorite,
          icon: { ios: 'star' },
          onValueChange: val => setIsFavorite(val),
        },
      ],
    },
    {
      type: 'separator',
      key: 'sep-2',
    },
    {
      key: 'share',
      title: 'Chia sẻ...',
      icon: { ios: 'square.and.arrow.up' },
      children: [
        {
          key: 'share-message',
          title: 'Tin nhắn',
          icon: { ios: 'message' },
          onPress: () => console.log('Share via Message'),
        },
        {
          key: 'share-mail',
          title: 'Email',
          icon: { ios: 'envelope' },
          onPress: () => console.log('Share via Email'),
        },
        {
          type: 'separator',
          key: 'sep-sub',
        },
        {
          key: 'share-more',
          title: 'Thêm...',
          onPress: () => console.log('Share more'),
        },
      ],
    },
    {
      key: 'hidden-item',
      title: 'Ẩn',
      isHidden: true,
      onPress: () => {},
    },
  ];

  // 3. Align Options
  const alignElements: TMenuElement[] = [
    { key: 'a', title: 'Option A' },
    { key: 'b', title: 'Option B' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#F8F9FA]">
      <ScrollView contentContainerStyle={{ padding: 20, gap: 30 }}>
        <Text className="mb-2.5 text-center text-2xl font-bold">SharedNativeMenu Showcase</Text>

        <View className="items-center gap-3 rounded-xl bg-white p-5 shadow-sm">
          <Text className="self-start text-lg font-semibold text-[#333]">1. Basic Actions</Text>
          <NativeMenu
            triggerComponent={<Button label="Basic Menu" />}
            elements={basicElements}
            menuTitle="Actions"
          />
        </View>

        <View className="items-center gap-3 rounded-xl bg-white p-5 shadow-sm">
          <Text className="self-start text-lg font-semibold text-[#333]">2. Groups & Submenus & Checkbox</Text>
          <View className="mb-2 w-full rounded-lg bg-[#F1F3F5] p-2.5">
            <Text>
              Status:
              {' '}
              {showStatus ? 'Visible' : 'Hidden'}
            </Text>
            <Text>
              Favorite:
              {' '}
              {isFavorite ? 'Yes' : 'No'}
            </Text>
          </View>
          <NativeMenu
            triggerComponent={<Button label="Complex Menu" variant="outline" />}
            elements={complexElements}
          />
        </View>

        <View className="items-center gap-3 rounded-xl bg-white p-5 shadow-sm">
          <Text className="self-start text-lg font-semibold text-[#333]">3. Alignment Options</Text>
          <View className="flex-row gap-2.5">
            <NativeMenu
              triggerComponent={<Button label="Start" size="sm" />}
              elements={alignElements}
              align="start"
            />
            <NativeMenu
              triggerComponent={<Button label="Center" size="sm" />}
              elements={alignElements}
              align="center"
            />
            <NativeMenu
              triggerComponent={<Button label="End" size="sm" />}
              elements={alignElements}
              align="end"
            />
          </View>
        </View>

        <View className="items-center gap-3 rounded-xl bg-white p-5 shadow-sm">
          <Text className="self-start text-lg font-semibold text-[#333]">4. Context Usage</Text>
          <Text className="mb-2 text-sm text-[#666]">Bấm vào icon bên dưới để mở menu quản lý</Text>
          <NativeMenu
            triggerComponent={(
              <View className="h-10 w-10 items-center justify-center rounded-full bg-[#E9ECEF]">
                <Text className="text-2xl text-[#495057]">⋮</Text>
              </View>
            )}
            elements={basicElements}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
