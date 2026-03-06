import { WIDTH } from '@/components/ui';
import { MAX_WIDTH } from './constants';

// Hàm tính toán Center Offset tĩnh
export function calculateCenterOffset(minWidths: number[], index: number, isExpandedState: boolean) {
  let offset = 0;
  const gap = 8;
  for (let i = 0; i < index; i++) {
    offset += (isExpandedState ? MAX_WIDTH : minWidths[i]) + gap;
  }
  const currentWidth = isExpandedState ? MAX_WIDTH : minWidths[index];
  const centerOffset = offset + (currentWidth / 2) - (WIDTH / 2) + 16;
  return Math.max(0, centerOffset);
}
