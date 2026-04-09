import type { TxKeyPath } from '@/lib/i18n';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import * as React from 'react';
import Popover, { PopoverPlacement } from 'react-native-popover-view';

import { useUniwind } from 'uniwind';
import { Text, TouchableOpacity, View, WIDTH } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';
import { TimelineTabView } from './timeline-tab-view';
import 'dayjs/locale/vi';

dayjs.locale('vi');

type Props = {
  title: string;
  onViewAll: () => void;
  trigger: React.ReactElement;
  fallbackDeviceName?: string;
  contextType: 'home' | 'device';
  targetId: string;
};

export function SharedTimelinePopover({
  title,
  onViewAll,
  trigger,
  fallbackDeviceName,
  contextType,
  targetId,
}: Props) {
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;
  const [isVisible, setIsVisible] = React.useState(false);
  const triggerRef = React.useRef<any>(null);

  // Safety: only open if the native view is still mounted
  const openPopover = React.useCallback(() => {
    if (triggerRef.current) {
      setIsVisible(true);
    }
  }, []);

  return (
    <>
      <TouchableOpacity
        ref={triggerRef}
        onPress={openPopover}
        activeOpacity={0.7}
      >
        {trigger}
      </TouchableOpacity>

      <Popover
        isVisible={isVisible}
        onRequestClose={() => setIsVisible(false)}
        placement={PopoverPlacement.BOTTOM}
        from={triggerRef}
        popoverStyle={{
          borderRadius: 16,
          backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7',
          width: WIDTH * 0.75,
        }}
        onCloseComplete={() => {
          // Ensure state is clean after close animation finishes
          setIsVisible(false);
        }}
      >
        <View className="w-full rounded-2xl p-4">
          <View className="flex-row items-center justify-between px-1">
            <Text className="text-base font-bold text-neutral-900 dark:text-white">
              {title}
            </Text>
            <TouchableOpacity onPress={() => setIsVisible(false)} className="p-1">
              <MaterialCommunityIcons name="close" size={20} color={isDark ? '#FFF' : '#111'} />
            </TouchableOpacity>
          </View>

          <View className="h-[350px] max-h-[60vh] w-full">
            <TimelineTabView
              contextType={contextType}
              targetId={targetId}
              isModal={true}
              fallbackDeviceName={fallbackDeviceName}
            />
          </View>

          <TouchableOpacity
            onPress={() => {
              setIsVisible(false);
              setTimeout(onViewAll, 150);
            }}
            className="mt-3 items-center justify-center border-t border-black/5 py-2 dark:border-white/5"
          >
            <Text className="text-sm font-semibold text-blue-500">
              {(translate('deviceDetail.timeline.viewAll' as TxKeyPath) || 'Xem tất cả lịch sử') as string}
            </Text>
          </TouchableOpacity>
        </View>
      </Popover>
    </>
  );
}
