/* eslint-disable react-refresh/only-export-components */
/**
 * Modal
 * Dependencies:
 * - @gorhom/bottom-sheet.
 *
 * Props:
 * - All `BottomSheetModalProps` props.
 * - `title` (string | undefined): Optional title for the modal header.
 *
 * Usage Example:
 * import { Modal, useModal } from '@gorhom/bottom-sheet';
 *
 * function DisplayModal() {
 *   const { ref, present, dismiss } = useModal();
 *
 *   return (
 *     <View>
 *       <Modal
 *         snapPoints={['60%']} // optional
 *         title="Modal Title"
 *         ref={ref}
 *       >
 *         Modal Content
 *       </Modal>
 *     </View>
 *   );
 * }
 *
 */

import type {
  BottomSheetBackdropProps,
  BottomSheetModalProps,
} from '@gorhom/bottom-sheet';
import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import * as React from 'react';
import { Pressable, View } from 'react-native';
import { Path, Svg } from 'react-native-svg';
import { useUniwind } from 'uniwind';

import colors from './colors';
import { Text } from './text';

type ModalProps = BottomSheetModalProps & {
  title?: string;
};

type ModalRef = React.ForwardedRef<BottomSheetModal>;

type ModalHeaderProps = {
  title?: string;
  dismiss: () => void;
};

export function useModal() {
  const ref = React.useRef<BottomSheetModal>(null);
  const present = React.useCallback((data?: any) => {
    ref.current?.present(data);
  }, []);
  const dismiss = React.useCallback(() => {
    ref.current?.dismiss();
  }, []);
  return { ref, present, dismiss };
}

export function Modal({ ref, snapPoints: _snapPoints = ['60%'] as (string | number)[], title, detached = false, ...props }: ModalProps & { ref?: ModalRef }) {
  const detachedProps = React.useMemo(
    () => getDetachedProps(detached),
    [detached],
  );
  const modal = useModal();
  const snapPoints = React.useMemo(() => _snapPoints, [_snapPoints]);
  const { theme } = useUniwind();
  const isDark = theme === 'dark';

  React.useImperativeHandle(
    ref,
    () => (modal.ref.current as BottomSheetModal) || null,
  );

  const renderHandleComponent = React.useCallback(
    () => (
      <View className="items-center pt-2">
        <View className="h-1 w-12 rounded-lg bg-neutral-300 dark:bg-neutral-600" />
        <ModalHeader title={title} dismiss={modal.dismiss} />
      </View>
    ),
    [title, modal.dismiss],
  );

  return (
    <BottomSheetModal
      {...props}
      {...detachedProps}
      ref={modal.ref}
      index={0}
      snapPoints={snapPoints}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      backdropComponent={props.backdropComponent || renderBackdrop}
      enableDynamicSizing={false}
      handleComponent={renderHandleComponent}
      backgroundStyle={{
        backgroundColor: isDark ? colors.neutral[800] : colors.white,
        ...(props.backgroundStyle as object),
      }}
      handleIndicatorStyle={{
        backgroundColor: isDark ? colors.neutral[400] : colors.neutral[300],
        ...(props.handleIndicatorStyle as object),
      }}
    />
  );
}



export function renderBackdrop(props: BottomSheetBackdropProps) {
  return (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      opacity={0.4}
    />
  );
}

/**
 *
 * @param detached
 * @returns
 *
 * @description
 * In case the modal is detached, we need to add some extra props to the modal to make it look like a detached modal.
 */

function getDetachedProps(detached: boolean) {
  if (detached) {
    return {
      detached: true,
      bottomInset: 46,
      style: { marginHorizontal: 16, overflow: 'hidden' },
    } as Partial<BottomSheetModalProps>;
  }
  return {} as Partial<BottomSheetModalProps>;
}

/**
 * ModalHeader
 */

const ModalHeader = React.memo(({ title, dismiss }: ModalHeaderProps) => {
  return (
    <View className="w-full">
      {title && (
        <View className="flex-row items-center px-4 py-4">
          {/* Symmetric spacers to ensure absolute center */}
          <View className="size-9" />
          <View className="flex-1">
            <Text className="text-center text-[16px] font-bold text-[#26313D] dark:text-white">
              {title}
            </Text>
          </View>
          <View className="size-9" />
        </View>
      )}
      <CloseButton close={dismiss} />
    </View>
  );
});

function CloseButton({ close }: { close: () => void }) {
  return (
    <Pressable
      onPress={close}
      className="absolute top-3 right-3 size-6 items-center justify-center"
      hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
      accessibilityLabel="close modal"
      accessibilityRole="button"
      accessibilityHint="closes the modal"
    >
      <Svg
        className="fill-neutral-300 dark:fill-white"
        width={24}
        height={24}
        fill="none"
        viewBox="0 0 24 24"
      >
        <Path d="M18.707 6.707a1 1 0 0 0-1.414-1.414L12 10.586 6.707 5.293a1 1 0 0 0-1.414 1.414L10.586 12l-5.293 5.293a1 1 0 1 0 1.414 1.414L12 13.414l5.293 5.293a1 1 0 0 0 1.414-1.414L13.414 12l5.293-5.293Z" />
      </Svg>
    </Pressable>
  );
}
