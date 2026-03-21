import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock dependencies
jest.mock('@/lib/api/homes/home.service', () => ({
  homeService: {
    assignRoomsToFloor: jest.fn(),
    assignFeaturesToRoom: jest.fn(),
    assignScenesToRoom: jest.fn(),
  },
}));

jest.mock('@/stores/home/home-data-store', () => ({
  useHomeDataStore: {
    getState: jest.fn(() => ({
      updateFloor: jest.fn(),
      updateRoom: jest.fn(),
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

import { useAssignRooms, useAssignFeaturesToRoom, useAssignScenesToRoom } from './use-homes';
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

describe('useAssignFeaturesToRoom', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should call homeService.assignFeaturesToRoom and update store on success', async () => {
    const mockRoom = { id: 'room1', name: 'Phòng khách' };
    const mockUpdateRoom = jest.fn();
    (useHomeDataStore.getState as jest.Mock).mockReturnValue({
      updateRoom: mockUpdateRoom,
    });
    (homeService.assignFeaturesToRoom as jest.Mock).mockResolvedValue(mockRoom);

    const { result } = renderHook(() => useAssignFeaturesToRoom(), { wrapper });

    result.current.mutate({ roomId: 'room1', body: { featureIds: ['feat1', 'feat2'] } });

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy();
    });

    expect(homeService.assignFeaturesToRoom).toHaveBeenCalledWith('room1', {
      featureIds: ['feat1', 'feat2'],
    });
    expect(mockUpdateRoom).toHaveBeenCalledWith('room1', mockRoom);
    expect(showSuccessMessage).toHaveBeenCalledWith('roomManagement.featuresAssigned');
  });

  it('should show error message on failure', async () => {
    const mockError = new Error('Network Error');
    (homeService.assignFeaturesToRoom as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => useAssignFeaturesToRoom(), { wrapper });

    result.current.mutate({ roomId: 'room1', body: { featureIds: [] } });

    await waitFor(() => {
      expect(result.current.isError).toBeTruthy();
    });

    expect(homeService.assignFeaturesToRoom).toHaveBeenCalledWith('room1', { featureIds: [] });
    expect(showErrorMessage).toHaveBeenCalledWith('Network Error');
  });
});

describe('useAssignScenesToRoom', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should call homeService.assignScenesToRoom and update store on success', async () => {
    const mockRoom = { id: 'room1', name: 'Phòng khách' };
    const mockUpdateRoom = jest.fn();
    (useHomeDataStore.getState as jest.Mock).mockReturnValue({
      updateRoom: mockUpdateRoom,
    });
    (homeService.assignScenesToRoom as jest.Mock).mockResolvedValue(mockRoom);

    const { result } = renderHook(() => useAssignScenesToRoom(), { wrapper });

    result.current.mutate({ roomId: 'room1', body: { sceneIds: ['scene1', 'scene2'] } });

    await waitFor(() => {
      expect(result.current.isSuccess).toBeTruthy();
    });

    expect(homeService.assignScenesToRoom).toHaveBeenCalledWith('room1', {
      sceneIds: ['scene1', 'scene2'],
    });
    expect(mockUpdateRoom).toHaveBeenCalledWith('room1', mockRoom);
    expect(showSuccessMessage).toHaveBeenCalledWith('roomManagement.scenesAssigned');
  });

  it('should show error message on failure', async () => {
    const mockError = new Error('Network Error');
    (homeService.assignScenesToRoom as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => useAssignScenesToRoom(), { wrapper });

    result.current.mutate({ roomId: 'room1', body: { sceneIds: [] } });

    await waitFor(() => {
      expect(result.current.isError).toBeTruthy();
    });

    expect(homeService.assignScenesToRoom).toHaveBeenCalledWith('room1', { sceneIds: [] });
    expect(showErrorMessage).toHaveBeenCalledWith('Network Error');
  });
});
