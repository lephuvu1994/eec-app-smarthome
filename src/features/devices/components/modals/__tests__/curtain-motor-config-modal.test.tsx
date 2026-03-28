import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { fireEvent, render, screen } from '@testing-library/react-native';
import * as React from 'react';

import { CurtainMotorConfigModal } from '../curtain-motor-config-modal';

jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { View } = require('react-native');
  return function MockDateTimePicker(props: any) {
    return <View testID="datetime-picker" {...props} />;
  };
});

describe('CurtainMotorConfigModal', () => {
  const onConfigMock = jest.fn();
  const mockRef = React.createRef<BottomSheetModal>();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly and matches base UI', () => {
    render(
      <CurtainMotorConfigModal
        modalRef={mockRef}
        isControlling={false}
        onConfig={onConfigMock}
      />,
    );

    expect(screen.getByText(/Giờ hoạt động/i)).toBeTruthy();
    expect(screen.getByText(/Lưu cấu hình/i)).toBeTruthy();
  });

  it('calls onConfig with payload when clicking save', () => {
    render(
      <CurtainMotorConfigModal
        modalRef={mockRef}
        isControlling={false}
        onConfig={onConfigMock}
      />,
    );

    const saveButton = screen.getByText(/Lưu cấu hình/i);
    fireEvent.press(saveButton);

    expect(onConfigMock).toHaveBeenCalledWith(
      expect.objectContaining({
        clicks: 2, // default 
        start_time: '00:00',
        end_time: '23:59',
      }),
    );
  });
});
