import type { TxKeyPath } from '@/lib/i18n';
import { BlurView } from 'expo-blur';
import * as React from 'react';
import { twMerge } from 'tailwind-merge';
import { useUniwind } from 'uniwind';
import { Text, View } from '@/components/ui';

type Props = {
  children: React.ReactNode;
  title?: TxKeyPath;
};

export function ItemsContainer({ children, title }: Props) {
  const { theme } = useUniwind();
  return (
    <View className="w-full rounded-xl">
      {title && (
        <Text
          className="p-2 text-lg text-black dark:text-white"
          tx={title}
        />
      )}
      <View
        className={twMerge(
          'overflow-hidden rounded-lg border-neutral-200 bg-white shadow-sm dark:border-none dark:bg-white/10',
          theme !== 'dark' ? 'border' : '',
        )}
      >
        <BlurView
          intensity={80}
          className="w-full gap-2 rounded-lg py-2"
          tint={theme === 'dark' ? 'dark' : 'light'}
        >
          {children}
        </BlurView>
      </View>
    </View>
  );
}
