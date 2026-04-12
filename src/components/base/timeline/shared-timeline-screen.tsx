import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { useRouter } from 'expo-router';
import * as React from 'react';
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
