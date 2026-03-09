/* eslint-disable unused-imports/no-unused-vars */
import { requireNativeModule } from 'expo-modules-core';

// 1. Tên 'SmartHomeSiri' phải khớp với Name("SmartHomeSiri") trong Swift
// eslint-disable-next-line import/no-mutable-exports
let SmartHomeSiri: any;

try {
  SmartHomeSiri = requireNativeModule('SmartHomeSiri');
}
catch (error) {
  // Trả về mock object nếu chưa build native xong
  SmartHomeSiri = {
    addListener: () => ({ remove: () => {} }),
    updateEntities: async () => console.warn('Native Module SmartHomeSiri missing!'),
  };
}

/**
 * Định nghĩa kiểu dữ liệu cho sự kiện
 */
export type SiriActionEvent = {
  deviceId: string;
  action: string;
};

/**
 * 2. Lắng nghe lệnh từ Siri
 * Vì SmartHomeSiri ĐÃ LÀ EventEmitter, bác gọi trực tiếp .addListener từ nó luôn
 */
export function addSiriListener(listener: (event: SiriActionEvent) => void) {
  // Không dùng new EventEmitter(SmartHomeSiri) nữa bác nhé
  return SmartHomeSiri.addListener('onSiriAction', listener);
}

/**
 * 3. Đồng bộ danh sách thiết bị xuống Native
 */
export async function updateSiriEntities(devices: { id: string; name: string }[]): Promise<void> {
  return await SmartHomeSiri.updateEntities(devices);
}

export default SmartHomeSiri;
