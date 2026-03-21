import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock dependencies
jest.mock('@/lib/api/homes/home.service', () => ({
  homeService: {
    assignRoomsToFloor: jest.fn(),
  },
}));

jest.mock('@/stores/home/home-data-store', () => ({
  useHomeDataStore: {
    getState: jest.fn(() => ({
      updateFloor: jest.fn(),
    })),
  },
}));

jest.mock('@/components/ui', () => ({
  showSuccessMessage: jest.fn(),
  showErrorMessage: jest.fn(),
}));

jest.mock('@/lib/i18n', () => ({
  translate: jest.fn((key) => key),
}));

import { useAssignRooms } from './use-homes';
import { homeService } from '@/lib/api/homes/home.service';
import { useHomeDataStore } from '@/stores/home/home-data-store';
import { showSuccessMessage, showErrorMessage } from '@/components/ui';

describe('useAssignRooms', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should call homeService.assignRoomsToFloor and update store on success', async () => {
    const mockFloor = { id: 'floor1', name: 'Tầng 1', rooms: [] };
    const mockUpdateFloor = jest.fn();
    (useHomeDataStore.getState as jest.Mock).mockReturnValue({
      updateFloor: mockUpdateFloor,
    });
    (homeService.assignRoomsToFloor as jest.Mock).mockResolvedValue(mockFloor);

    const { result } = renderHook(() => useAssignRooms(), { wrapper });

    result.current.mutate({ floorId: 'floor1', body: { roomIds: ['room1', 'room2'] } });

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy();
    });

    expect(homeService.assignRoomsToFloor).toHaveBeenCalledWith('floor1', {
      roomIds: ['room1', 'room2'],
    });
    expect(mockUpdateFloor).toHaveBeenCalledWith('floor1', mockFloor);
    expect(showSuccessMessage).toHaveBeenCalledWith('roomManagement.floorUpdated');
  });

  it('should show error message on failure', async () => {
    const mockError = new Error('Network Error');
    (homeService.assignRoomsToFloor as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => useAssignRooms(), { wrapper });

    result.current.mutate({ floorId: 'floor1', body: { roomIds: [] } });

    await waitFor(() => {
      expect(result.current.isError).toBeTruthy();
    });

    expect(homeService.assignRoomsToFloor).toHaveBeenCalledWith('floor1', { roomIds: [] });
    expect(showErrorMessage).toHaveBeenCalledWith('Network Error');
  });
});
