import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import { useUniwind } from 'uniwind';

import { CustomHeader, HeaderIconButton, useHeaderOffset } from '@/components/base/header/CustomHeader';
import { BaseLayout } from '@/components/layout/BaseLayout';
import { View } from '@/components/ui';
import { ETheme } from '@/types/base';

import 'dayjs/locale/vi';

dayjs.locale('vi');
type Props = {
  title?: string;
  showBackButton?: boolean;
  children?: React.ReactNode;
};

export function SharedTimelineScreen({
  title,
  showBackButton = false,
  children,
}: Props) {
  const { theme } = useUniwind();
  const router = useRouter();
  const headerHeight = useHeaderOffset();

  return (
    <BaseLayout>
      <View className="relative w-full flex-1">
        <Image
          source={theme === ETheme.Dark ? require('@@/assets/base/background-dark.webp') : require('@@/assets/base/background-light.webp')}
          style={[{
            width: '100%',
            height: '100%',
            position: 'absolute',
          }, StyleSheet.absoluteFillObject]}
          contentFit="cover"
        />

        {title && (
          <View className="z-10">
            <CustomHeader
              title={title}
              style={{ backgroundColor: 'transparent' }}
              leftContent={showBackButton
                ? (
                    <HeaderIconButton onPress={() => router.canGoBack() && router.back()}>
                      <Ionicons name="chevron-back" size={28} color={theme === ETheme.Dark ? '#FFF' : '#111'} />
                    </HeaderIconButton>
                  )
                : undefined}
            />
          </View>
        )}

        <View className="w-full flex-1" style={{ paddingTop: title ? headerHeight : 24 }}>
          {children}
        </View>
      </View>
    </BaseLayout>
  );
}
