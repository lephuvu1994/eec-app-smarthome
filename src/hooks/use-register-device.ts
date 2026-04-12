import { TRegisterDeviceResponse, TRegisterDeviceVariables } from '@/types/device';
import { createMutation } from 'react-query-kit';
import { deviceService } from '@/lib/api/devices/device.service';

export const useRegisterDevice = createMutation<
  TRegisterDeviceResponse,
  TRegisterDeviceVariables,
  Error
>({
  mutationFn: deviceService.registerDevice,
});
