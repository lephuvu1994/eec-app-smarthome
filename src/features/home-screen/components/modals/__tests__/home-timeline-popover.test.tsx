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

jest.mock('@/lib/i18n', () => ({
  translate: jest.fn((key) => key), // return the key itself
}));

jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons',
}));

// Mock Popover since @rn-primitives/popover is hard to test in JSDOM
jest.mock('@rn-primitives/popover', () => {
  const React = require('react');
  const { View } = require('react-native');
  const PopoverContext = React.createContext(false);
  return {
    __esModule: true,
    Root: ({ children, open }: any) => (
      <PopoverContext.Provider value={open}>
        <View testID="popover-wrapper">{children}</View>
      </PopoverContext.Provider>
    ),
    Trigger: ({ children }: any) => <>{children}</>,
    Portal: ({ children }: any) => {
      const open = React.useContext(PopoverContext);
      return open ? <>{children}</> : null;
    },
    Overlay: () => null,
    Content: ({ children }: any) => <View testID="popover-content">{children}</View>,
    Close: ({ children }: any) => <>{children}</>,
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
        renderTrigger={(_r, openPopover) => (
          <TouchableOpacity testID="trigger-btn" onPress={openPopover}>
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
        renderTrigger={(_r, openPopover) => (
          <TouchableOpacity testID="trigger-btn" onPress={openPopover}>
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
        renderTrigger={(_r, openPopover) => (
          <TouchableOpacity testID="trigger-btn" onPress={openPopover}>
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
        renderTrigger={(_r, openPopover) => (
          <TouchableOpacity testID="trigger-btn" onPress={openPopover}>
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
