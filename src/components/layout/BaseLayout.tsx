import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FocusAwareStatusBar, View } from '@/components/ui';

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
        top: insets.top,
        left: insets.left,
        bottom: insets.bottom,
        right: insets.right,
        position: 'absolute',
        width: '100%',
        height: '100%',
      }}
    >
      <FocusAwareStatusBar />
      {children}
    </View>
  );
};
