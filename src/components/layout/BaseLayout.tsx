import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { twMerge } from 'tailwind-merge';
import { View } from '@/components/ui';

export const BaseLayout = ({
  children,
  hasTabBar = false,
}: {
  children: React.ReactNode;
  hasTabBar?: boolean;
  className?: string;
  coverBottomTab?: boolean;
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      className={twMerge("absolute w-full overflow-hidden")}
      style={{
        top: 0,
        left: insets.left,
        bottom: 0,
        right: insets.right,
      }}
    >{children}
    </View>
  );
};
