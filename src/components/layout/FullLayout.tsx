import { Image } from 'expo-image';
import { usePathname } from 'expo-router';

import { twMerge } from 'tailwind-merge';

import { View } from '@/components/ui';
import { useUniwind } from 'uniwind';

const listPathNameSupportDarkBg = [
  '/signUp',
  '/signIn',
  '/addServer',
  '/onboarding',
];

export const FullLayout = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { theme } = useUniwind();
  const pathName = usePathname();

  return (
    <View
      className={twMerge(
        'w-full flex-1 justify-center items-center relative',
        className
      )}
    >
      <Image
        source={require('@@/assets/base/dark-bg-image.png')}
        className={twMerge(
          'absolute inset-0 w-full h-full',
          theme ==='light' &&
            !listPathNameSupportDarkBg.includes(pathName) &&
            'opacity-0'
        )}
        contentFit='cover'
        style={{ width: '100%', height: '100%', position: 'absolute' }}
        priority="high"
      />

      <View className="flex-1 w-full">{children}</View>
    </View>
  );
};
