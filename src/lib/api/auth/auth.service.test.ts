import { authService } from './auth.service';
import { client } from '../common/client';

jest.mock('../common/client', () => ({
  client: {
    post: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  },
}));

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updatePushToken', () => {
    it('should successfully update push token and return true', async () => {
      (client.patch as jest.Mock).mockResolvedValue({ status: 200 });

      const result = await authService.updatePushToken('expo-token-abc');

      expect(client.patch).toHaveBeenCalledWith('/user/sessions/push-token', {
        pushToken: 'expo-token-abc',
      });
      expect(result).toBeUndefined();
    });

    it('should throw an error on failure', async () => {
      (client.patch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(authService.updatePushToken('expo-token-abc')).rejects.toThrow('Network error');

      expect(client.patch).toHaveBeenCalledWith('/user/sessions/push-token', {
        pushToken: 'expo-token-abc',
      });
    });
  });
});
