import { createMutation } from 'react-query-kit';
import { deviceService, RegisterDeviceResponse, RegisterDeviceVariables } from '@/lib/api/devices/device.service';
import type { AxiosError } from 'axios';

export const useRegisterDevice = createMutation<
  RegisterDeviceResponse,
  RegisterDeviceVariables,
  AxiosError
>({
  mutationFn: deviceService.registerDevice,
});
