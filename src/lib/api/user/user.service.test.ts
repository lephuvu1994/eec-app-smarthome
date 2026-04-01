import { client } from '../common';
import { userService } from './user.service';

// Mock the API client
jest.mock('../common', () => ({
  client: {
    put: jest.fn(),
  },
}));

describe('UserService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateProfile', () => {
    it('should successfully update user profile with data', async () => {
      // Mock successful response from the core-api endpoint
      const mockUpdateResponse = {
        data: {
          data: {
            id: '123',
            firstName: 'John',
            lastName: 'Doe',
            avatar: 'http://cloudinary.com/image.webp',
            userName: 'John Doe',
          },
        },
      };

      (client.put as jest.Mock).mockResolvedValue(mockUpdateResponse);

      const updatePayload = {
        firstName: 'John',
        lastName: 'Doe',
        avatar: 'http://cloudinary.com/image.webp',
      };

      const result = await userService.updateProfile(updatePayload);

      // Verify the correct endpoints and payload were used
      expect(client.put).toHaveBeenCalledWith('/user', updatePayload);
      
      // Verify the returned target maps correctly to the user object mapping
      expect(result).toEqual(mockUpdateResponse.data.data);
    });

    it('should handle API errors appropriately', async () => {
      // Mock failure response
      const errorMessage = 'Network Error';
      (client.put as jest.Mock).mockRejectedValue(new Error(errorMessage));

      await expect(userService.updateProfile({ firstName: 'Error' })).rejects.toThrow(errorMessage);
    });
  });
});
