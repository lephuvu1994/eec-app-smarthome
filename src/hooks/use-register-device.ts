import type { TRegisterDeviceResponse, TRegisterDeviceVariables } from '@/lib/api/devices/device.service';
import { createMutation } from 'react-query-kit';
import { deviceService } from '@/lib/api/devices/device.service';

export const useRegisterDevice = createMutation<
  TRegisterDeviceResponse,
  TRegisterDeviceVariables,
  Error
>({
  mutationFn: deviceService.registerDevice,
});
