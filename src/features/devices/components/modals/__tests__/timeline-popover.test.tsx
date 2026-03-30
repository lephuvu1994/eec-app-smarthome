import { render } from '@testing-library/react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';

import { TimelinePopover } from '../timeline-popover';

jest.mock('@/lib/i18n', () => ({
  translate: (key: string) => key,
}));

jest.mock('@/features/devices/hooks/use-device-timeline', () => ({
  useDeviceTimelinePreview: () => ({
    data: { data: [] },
    isLoading: false,
    isError: false,
  }),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('react-native-popover-view', () => {
  const React = require('react');
  return {
    __esModule: true,
    PopoverPlacement: { BOTTOM: 'bottom' },
    default: ({ children }: any) => <>{children}</>,
  };
});

// Since the component uses Dimensions and MaterialCommunityIcons
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Dimensions.get = jest.fn().mockReturnValue({ width: 400, height: 800 });
  return RN;
});

jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons',
}));

describe('TimelinePopover', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <TimelinePopover
        deviceId="dev-1"
        renderTrigger={(sourceRef, open) => (
          <TouchableOpacity ref={sourceRef} onPress={open}>
            Trigger
          </TouchableOpacity>
        )}
      />
    );

    // Initial title loaded
    expect(getByText('base.timelineTitle')).toBeTruthy();
  });
});
