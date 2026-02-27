import { Image } from 'expo-image';
import { usePathname } from 'expo-router';

import { twMerge } from 'tailwind-merge';

import { useUniwind } from 'uniwind';
import { View } from '@/components/ui';

const listPathNameSupportDarkBg = [
  '/signUp',
  '/signIn',
  '/addServer',
  '/onboarding',
];

export function FullLayout({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { theme } = useUniwind();
  const pathName = usePathname();

  return (
    <View
      className={twMerge(
        'relative w-full flex-1 items-center justify-center',
        className,
      )}
    >
      <Image
        source={require('@@/assets/base/dark-bg-image.png')}
        className={twMerge(
          'absolute inset-0 size-full',
          theme === 'light'
          && !listPathNameSupportDarkBg.includes(pathName)
          && 'opacity-0',
        )}
        contentFit="cover"
        style={{ width: '100%', height: '100%', position: 'absolute' }}
        priority="high"
      />

      <View className="w-full flex-1">{children}</View>
    </View>
  );
}
