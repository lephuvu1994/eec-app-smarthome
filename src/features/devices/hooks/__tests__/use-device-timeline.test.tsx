import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

import { useDeviceTimelineInfinite, useDeviceTimelinePreview } from '../use-device-timeline';
import { deviceService } from '@/lib/api/devices/device.service';

// Mock the device service
jest.mock('@/lib/api/devices/device.service', () => ({
  deviceService: {
    getDeviceTimeline: jest.fn(),
  },
}));

describe('use-device-timeline hooks', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  const mockTimelineResponse = {
    data: [
      { id: '1', type: 'state', event: 'on' },
      { id: '2', type: 'connection', event: 'online' },
    ],
    meta: {
      page: 1,
      limit: 5,
      total: 10,
      lastPage: 2,
    },
  };

  describe('useDeviceTimelinePreview', () => {
    it('should fetch the latest timeline events with correct limit', async () => {
      (deviceService.getDeviceTimeline as jest.Mock).mockResolvedValueOnce(mockTimelineResponse);

      const { result } = renderHook(() => useDeviceTimelinePreview('dev-123', 5), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(deviceService.getDeviceTimeline).toHaveBeenCalledWith('dev-123', { page: 1, limit: 5 });
      expect(result.current.data).toEqual(mockTimelineResponse);
    });

    it('should not fetch if deviceId is empty', () => {
      const { result } = renderHook(() => useDeviceTimelinePreview('', 5), { wrapper });
      expect(result.current.fetchStatus).toBe('idle');
      expect(result.current.isLoading).toBe(false);
      expect(deviceService.getDeviceTimeline).not.toHaveBeenCalled();
    });
  });

  describe('useDeviceTimelineInfinite', () => {
    it('should fetch first page successfully', async () => {
      (deviceService.getDeviceTimeline as jest.Mock).mockResolvedValueOnce(mockTimelineResponse);

      const { result } = renderHook(() => useDeviceTimelineInfinite('dev-123', { limit: 10 }), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(deviceService.getDeviceTimeline).toHaveBeenCalledWith('dev-123', {
        page: 1,
        limit: 10,
        entityCode: undefined,
        from: undefined,
        to: undefined,
      });

      expect(result.current.data?.pages[0]).toEqual(mockTimelineResponse);
      expect(result.current.hasNextPage).toBe(true);
    });

    it('should calculate hasNextPage false when on last page', async () => {
      (deviceService.getDeviceTimeline as jest.Mock).mockResolvedValueOnce({
        ...mockTimelineResponse,
        meta: { ...mockTimelineResponse.meta, page: 2, lastPage: 2 }
      });
      
      const { result } = renderHook(() => useDeviceTimelineInfinite('dev-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.hasNextPage).toBe(false);
    });
  });
});
