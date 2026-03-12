import type { AxiosError } from 'axios';
import type { RegisterDeviceResponse, RegisterDeviceVariables } from '@/lib/api/devices/device.service';
import { createMutation } from 'react-query-kit';
import { deviceService } from '@/lib/api/devices/device.service';

export const useRegisterDevice = createMutation<
  RegisterDeviceResponse,
  RegisterDeviceVariables,
  AxiosError
>({
  mutationFn: deviceService.registerDevice,
});
