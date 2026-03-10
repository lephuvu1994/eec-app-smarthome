import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BASE_TAB_HEIGHT, EXTRA_GLASS_SPACE } from '@/constants';

export function useSmartTabBarHeight(hasTabBar: boolean = true) {
  const insets = useSafeAreaInsets();

  if (!hasTabBar)
    return 0;

  // Tổng cộng khoảng 110px - 120px trên iPhone 15
  return insets.bottom + BASE_TAB_HEIGHT + EXTRA_GLASS_SPACE;
}
