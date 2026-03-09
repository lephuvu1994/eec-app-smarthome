import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useSmartTabBarHeight(hasTabBar: boolean = true) {
  const insets = useSafeAreaInsets();

  if (!hasTabBar)
    return 0;

  // 64 là chiều cao trung bình của Tab nội dung + 8 là padding cho hiệu ứng Glass
  const BASE_TAB_HEIGHT = 49;
  const EXTRA_GLASS_SPACE = 8;

  // Tổng cộng khoảng 110px - 120px trên iPhone 15
  return insets.bottom + BASE_TAB_HEIGHT + EXTRA_GLASS_SPACE;
}
