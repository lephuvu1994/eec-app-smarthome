import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from '@/components/ui';

type BaseLayoutProps = {
  children: React.ReactNode;
  className?: string;
  hasTabBar?: boolean;
};

export function BaseLayout({ children }: BaseLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        top: 0,
        left: insets.left,
        bottom: 0,
        right: insets.right,
        position: 'absolute',
        width: '100%',
        height: '100%',
      }}
    >
      {children}
    </View>
  );
};
