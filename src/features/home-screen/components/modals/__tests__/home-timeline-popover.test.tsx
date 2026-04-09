import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { HomeTimelinePopover } from '../home-timeline-popover';
import { useHomeTimelineInfinite } from '@/features/home-screen/hooks/use-home-timeline';

// Mock dependencies
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/stores/config/config', () => ({
  useConfigManager: jest.fn(() => 'dark'),
}));

jest.mock('@/features/home-screen/hooks/use-home-timeline', () => ({
  useHomeTimelineInfinite: jest.fn(),
}));

jest.mock('@/features/devices/automation/timeline/use-device-timeline', () => ({
  useDeviceTimelineInfinite: jest.fn(() => ({
    data: { pages: [{ data: [] }] },
    isLoading: false,
    isError: false,
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: jest.fn(),
  })),
}));

jest.mock('@/lib/i18n', () => ({
  translate: jest.fn((key) => key), // return the key itself
}));

jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons',
}));

// Mock Popover since react-native-popover-view is hard to test in JSDOM
jest.mock('react-native-popover-view', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    PopoverPlacement: { BOTTOM: 'BOTTOM' },
    default: ({ isVisible, children, from, onRequestClose }: any) => {
      return (
        <View testID="popover-wrapper">
          {/* Render children only if visible */}
          {isVisible && <View testID="popover-content">{children}</View>}
        </View>
      );
    },
  };
});

describe('HomeTimelinePopover', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders trigger button correctly', () => {
    (useHomeTimelineInfinite as jest.Mock).mockReturnValue({
      data: { pages: [{ data: [] }] },
      isLoading: false,
      isError: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: jest.fn(),
    });

    render(
      <HomeTimelinePopover
        homeId="home1"
        trigger={(
          <TouchableOpacity testID="trigger-btn">
            <Text>Open</Text>
          </TouchableOpacity>
        )}
      />
    );
    expect(screen.getByTestId('trigger-btn')).toBeTruthy();
  });

  it('shows empty state when no data exists', async () => {
    (useHomeTimelineInfinite as jest.Mock).mockReturnValue({
      data: { pages: [{ data: [] }] },
      isLoading: false,
      isError: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: jest.fn(),
    });

    render(
      <HomeTimelinePopover
        homeId="home1"
        trigger={(
          <TouchableOpacity testID="trigger-btn">
            <Text>Open</Text>
          </TouchableOpacity>
        )}
      />
    );

    fireEvent.press(screen.getByTestId('trigger-btn'));

    await waitFor(() => {
      expect(screen.getByText('deviceDetail.timeline.noActivity')).toBeTruthy();
    });
  });

  it('shows error state correctly', async () => {
    (useHomeTimelineInfinite as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: jest.fn(),
    });

    render(
      <HomeTimelinePopover
        homeId="home1"
        trigger={(
          <TouchableOpacity testID="trigger-btn">
            <Text>Open</Text>
          </TouchableOpacity>
        )}
      />
    );

    fireEvent.press(screen.getByTestId('trigger-btn'));

    await waitFor(() => {
      expect(screen.getByText('deviceDetail.timeline.errorLoadData')).toBeTruthy();
    });
  });

  it('renders timeline items and view all button', async () => {
    const mockItems = [
      {
        id: '1',
        type: 'state',
        event: 'on',
        deviceName: 'Light Bulb 1',
        createdAt: new Date().toISOString(),
      },
    ];

    (useHomeTimelineInfinite as jest.Mock).mockReturnValue({
      data: { pages: [{ data: mockItems }] },
      isLoading: false,
      isError: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: jest.fn(),
    });

    render(
      <HomeTimelinePopover
        homeId="home1"
        trigger={(
          <TouchableOpacity testID="trigger-btn">
            <Text>Open</Text>
          </TouchableOpacity>
        )}
      />
    );

    fireEvent.press(screen.getByTestId('trigger-btn'));

    await waitFor(() => {
      // TimelineItemCard renders: deviceName on first line, "Trạng thái: {eventKey}" on second line
      expect(screen.getByText('Light Bulb 1')).toBeTruthy();
      // event 'on' → translate returns the key itself in test env
      expect(screen.getByText(/Trạng thái:/)).toBeTruthy();
      expect(screen.getByText('deviceDetail.timeline.viewAll')).toBeTruthy();
    });
  });
});
