import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FocusAwareStatusBar, View } from '@/components/ui';

type FullLayoutProps = {
  children: React.ReactNode;
  className?: string;
  hasTabBar?: boolean;
};

export function FullLayout({ children }: FullLayoutProps) {
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
      <FocusAwareStatusBar />
      {children}
    </View>
  );
};
