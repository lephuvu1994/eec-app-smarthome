import type { BottomSheetBackdropProps, BottomSheetModal } from '@gorhom/bottom-sheet';
import { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as React from 'react';
import { useCallback, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUniwind } from 'uniwind';

import { Button, IS_IOS, Modal, Text, View, WheelPicker } from '@/components/ui';
import { useDelayScene } from '@/features/scenes/common/use-scenes';
import { translate } from '@/lib/i18n';
import { ETheme } from '@/types/base';

export type TSceneDelaySheetProps = {
  sceneId: string | null;
  onSuccess?: () => void;
};

export function SceneDelaySheet({ ref, sceneId, onSuccess }: TSceneDelaySheetProps & { ref?: React.RefObject<BottomSheetModal | null> }) {
  const { bottom } = useSafeAreaInsets();
  const { mutate: runDelay, isPending } = useDelayScene();
  const { theme } = useUniwind();
  const isDark = theme === ETheme.Dark;

  const [durationDate, setDurationDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 5, 0, 0);
    return d;
  });

  const handleConfirm = useCallback(() => {
    if (!sceneId)
      return;

    const totalSeconds = durationDate.getHours() * 3600 + durationDate.getMinutes() * 60;
    runDelay(
      { sceneId, delaySeconds: totalSeconds },
      {
        onSuccess: () => {
          if (ref && 'current' in ref) {
            ref.current?.dismiss();
          }
          onSuccess?.();
        },
      },
    );
  }, [durationDate, sceneId, runDelay, onSuccess, ref]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.4} pressBehavior="none" />
    ),
    [],
  );

  return (
    <Modal ref={ref} snapPoints={[bottom + 340]} enableContentPanningGesture={IS_IOS} backdropComponent={!IS_IOS ? renderBackdrop : undefined}>
      <View className="flex-1 pb-4">
        <View className="mb-4 flex-row items-center justify-between px-4">
          <Text className="text-lg font-bold text-[#1B1B1B] dark:text-white">
            {translate('scenes.builder.delay' as any) || 'Hẹn giờ kịch bản'}
          </Text>
        </View>

        <View className="flex-1 px-4">
          <View className="mb-4 w-full items-center justify-center">
            {IS_IOS
              ? (
                  <DateTimePicker
                    display="spinner"
                    value={durationDate}
                    mode="countdown"
                    onChange={(_event, selectedDate) => {
                      if (selectedDate)
                        setDurationDate(selectedDate);
                    }}
                    textColor={isDark ? '#FFFFFF' : '#000000'}
                    themeVariant={isDark ? 'dark' : 'light'}
                    style={{ height: 180 }}
                  />
                )
              : (
                  <View className="flex-row items-center justify-center gap-8 px-8">
                    <View className="items-center">
                      <WheelPicker
                        data={Array.from({ length: 24 }, (_, i) => i)}
                        value={durationDate.getHours()}
                        onValueChange={(h) => {
                          const d = new Date(durationDate);
                          d.setHours(h);
                          setDurationDate(d);
                        }}
                        formatLabel={val => val.toString().padStart(2, '0')}
                      />
                      <Text className="mt-2 text-xs font-semibold text-neutral-500 uppercase">Giờ</Text>
                    </View>
                    <Text className="pb-6 text-2xl font-bold dark:text-white">:</Text>
                    <View className="items-center">
                      <WheelPicker
                        data={Array.from({ length: 60 }, (_, i) => i)}
                        value={durationDate.getMinutes()}
                        onValueChange={(m) => {
                          const d = new Date(durationDate);
                          d.setMinutes(m);
                          setDurationDate(d);
                        }}
                        formatLabel={val => val.toString().padStart(2, '0')}
                      />
                      <Text className="mt-2 text-xs font-semibold text-neutral-500 uppercase">Phút</Text>
                    </View>
                  </View>
                )}
          </View>

          <View className="flex-row gap-3 pt-2">
            <Button
              label={translate('base.confirmButton' as any) || 'Xác nhận'}
              onPress={handleConfirm}
              loading={isPending}
              disabled={isPending || (durationDate.getHours() === 0 && durationDate.getMinutes() === 0)}
              className={`h-12 flex-1 rounded-full p-0 shadow-sm ${(durationDate.getHours() === 0 && durationDate.getMinutes() === 0) || isPending ? 'bg-[#A3E635]/50 dark:bg-[#A3E635]/50' : 'bg-[#A3E635] dark:bg-[#A3E635]'}`}
              textClassName="text-base font-semibold text-[#0F0F0F] dark:text-[#0F0F0F]"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

SceneDelaySheet.displayName = 'SceneDelaySheet';
