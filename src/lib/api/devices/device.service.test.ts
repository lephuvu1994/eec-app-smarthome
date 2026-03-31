import { deviceService } from './device.service';
import { client } from '../common/client';

jest.mock('../common/client', () => ({
  client: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('deviceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateNotifyConfig', () => {
    it('should successfully update notification config', async () => {
      (client.patch as jest.Mock).mockResolvedValue({ status: 200, data: { success: true } });

      const deviceId = 'dev-123';
      const config = { enabled: true };

      await deviceService.updateNotifyConfig(deviceId, config);

      expect(client.patch).toHaveBeenCalledWith(`/devices/${deviceId}/notify-config`, {
        notify: config,
      });
    });

    it('should throw error when API fails', async () => {
      (client.patch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const deviceId = 'dev-123';
      const config = { enabled: false };

      await expect(deviceService.updateNotifyConfig(deviceId, config)).rejects.toThrow('Network error');

      expect(client.patch).toHaveBeenCalledWith(`/devices/${deviceId}/notify-config`, {
        notify: config,
      });
    });
  });
});
