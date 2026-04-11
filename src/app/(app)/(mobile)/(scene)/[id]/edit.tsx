import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { IS_IOS } from '@/components/ui';
import { EditSceneScreen } from '@/features/scenes/builder/edit-scene-screen';

export default function EditSceneRoute() {
  const content = <EditSceneScreen />;

  if (IS_IOS) {
    return <BottomSheetModalProvider>{content}</BottomSheetModalProvider>;
  }
  return content;
}
