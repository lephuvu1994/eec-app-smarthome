import { render, screen } from '@testing-library/react-native';
import React from 'react';

import { TimelineListScene } from './timeline-list-scene';
import { useDeviceTimelineInfinite } from '@/features/devices/automation/timeline/use-device-timeline';
import { useHomeTimelineInfinite } from '@/features/home-screen/hooks/use-home-timeline';

jest.mock('@/lib/i18n', () => ({
  translate: (key: string) => key,
}));

jest.mock('uniwind', () => ({
  useUniwind: () => ({ theme: 'light' }),
}));

jest.mock('@/features/devices/automation/timeline/use-device-timeline', () => ({
  useDeviceTimelineInfinite: jest.fn(),
}));

jest.mock('@/features/home-screen/hooks/use-home-timeline', () => ({
  useHomeTimelineInfinite: jest.fn(),
}));

jest.mock('@/components/ui', () => {
  const React = require('react');
  const { View, Text, ActivityIndicator, FlatList } = require('react-native');
  return {
    View,
    Text,
    ActivityIndicator,
    List: (props: any) => <FlatList {...props} />,
  };
});

jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons',
}));

describe('TimelineListScene', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state correctly', () => {
    (useDeviceTimelineInfinite as jest.Mock).mockReturnValue({
      isLoading: true,
      isRefetching: false,
    });
    (useHomeTimelineInfinite as jest.Mock).mockReturnValue({
      isLoading: true,
      isRefetching: false,
    });

    render(
      <TimelineListScene type="state" contextType="device" targetId="1" />
    );
    expect(screen.UNSAFE_getByType(require('react-native').ActivityIndicator)).toBeTruthy();
  });

  it('renders empty state correctly', () => {
    (useDeviceTimelineInfinite as jest.Mock).mockReturnValue({
      data: { pages: [{ data: [] }] },
    });
    (useHomeTimelineInfinite as jest.Mock).mockReturnValue({});

    render(
      <TimelineListScene type="state" contextType="device" targetId="1" emptyText="No data yet" />
    );
    expect(screen.getByText('No data yet')).toBeTruthy();
  });

  it('calls useDeviceTimelineInfinite when context is device', () => {
    (useDeviceTimelineInfinite as jest.Mock).mockReturnValue({
      data: { pages: [{ data: [] }] },
    });
    (useHomeTimelineInfinite as jest.Mock).mockReturnValue({});

    render(<TimelineListScene type="state" contextType="device" targetId="dev-1" />);

    expect(useDeviceTimelineInfinite).toHaveBeenCalledWith('dev-1', { type: 'state' });
    expect(useHomeTimelineInfinite).toHaveBeenCalledWith('', { type: 'state' });
  });

  it('calls useHomeTimelineInfinite when context is home', () => {
    (useDeviceTimelineInfinite as jest.Mock).mockReturnValue({});
    (useHomeTimelineInfinite as jest.Mock).mockReturnValue({
      data: { pages: [{ data: [] }] },
    });

    render(<TimelineListScene type="connection" contextType="home" targetId="home-1" />);

    expect(useDeviceTimelineInfinite).toHaveBeenCalledWith('', { type: 'connection' });
    expect(useHomeTimelineInfinite).toHaveBeenCalledWith('home-1', { type: 'connection' });
  });
});
