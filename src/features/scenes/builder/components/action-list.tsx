import type { OrderChangeParams } from 'react-native-sortables';
import type { TSceneAction } from '../hooks/use-scene-builder';
import { useCallback, useRef } from 'react';
import Sortable from 'react-native-sortables';
import { Text, View } from '@/components/ui';
import { translate } from '@/lib/i18n';
import { ActionItem } from './action-item';

// ─── ActionList ────────────────────────────────────────────────────────────────

type TProps = {
  actions: TSceneAction[];
  onReorder: (newActions: TSceneAction[]) => void;
  onRemove: (index: number) => void;
};

export function ActionList({ actions, onReorder, onRemove }: TProps) {
  // Bọc vào ref để truy cập giá trị latest bên trong callback mà ko bị stale
  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  const handleOrderChange = useCallback(({ indexToKey }: OrderChangeParams) => {
    // indexToKey trả về mảng các key tương ứng với thứ tự mới.
    // Vì key của ta là dạng string(index), ta có thể ép về số và lấy lại từ actions gốc
    const reorderedCount = indexToKey.length;
    if (reorderedCount === 0)
      return;

    // Vì React Native Sortable cho indexToKey có thể rỗng lúc mới mount hoặc không đổi
    const newOrder = indexToKey.map((keyStr) => {
      const originalIdx = Number.parseInt(keyStr, 10);
      return actionsRef.current[originalIdx];
    }).filter(Boolean) as TSceneAction[];

    // Chỉ notify nếu số lượng khớp
    if (newOrder.length === actionsRef.current.length) {
      onReorder(newOrder);
    }
  }, [onReorder]);

  if (actions.length === 0) {
    return (
      <View className="items-center py-6">
        <Text className="text-sm text-[#9CA3AF]">
          {translate('scenes.builder.noActions')}
        </Text>
      </View>
    );
  }

  return (
    <Sortable.Flex
      onOrderChange={handleOrderChange}
      flexDirection="column"
      gap={8}
    >
      {actions.map((action, index) => (
        <View key={String(index)} className="w-full">
          <ActionItem
            action={action}
            index={index}
            onRemove={onRemove}
          />
        </View>
      ))}
    </Sortable.Flex>
  );
}
