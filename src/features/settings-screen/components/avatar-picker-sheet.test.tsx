import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

import { AvatarPickerSheet } from './avatar-picker-sheet';

jest.mock('@/lib/i18n', () => ({
  translate: (key: string) => key,
}));

jest.mock('uniwind', () => ({
  useUniwind: () => ({ theme: 'light' }),
}));

// Mock the child Modal properly so refs and BottomSheet stuff won't crash
jest.mock('@/components/ui/modal', () => ({
  Modal: ({ children }: any) => <>{children}</>,
}));

describe('AvatarPickerSheet', () => {
  it('triggers camera and library callbacks properly', () => {
    const mockCamera = jest.fn();
    const mockLibrary = jest.fn();

    const { getByText } = render(
      <AvatarPickerSheet
        onSelectCamera={mockCamera}
        onSelectLibrary={mockLibrary}
      />
    );

    const cameraButton = getByText('settings.camera');
    const libraryButton = getByText('settings.library');

    expect(cameraButton).toBeTruthy();
    expect(libraryButton).toBeTruthy();

    fireEvent.press(cameraButton);
    expect(mockCamera).toHaveBeenCalled();

    fireEvent.press(libraryButton);
    expect(mockLibrary).toHaveBeenCalled();
  });
});
