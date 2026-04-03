import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

import { EditProfileModal } from './edit-profile-modal';

jest.mock('react-native-keyboard-controller', () => ({
  KeyboardAvoidingView: ({ children }: any) => <>{children}</>,
}));

jest.mock('@/lib/i18n', () => ({
  translate: (key: string) => key,
}));

jest.mock('uniwind', () => ({
  useUniwind: () => ({ theme: 'light' }),
}));

describe('EditProfileModal', () => {
  it('renders correctly and handles name changes', () => {
    const handleSave = jest.fn();
    const handleClose = jest.fn();

    const { getByPlaceholderText, getByText } = render(
      <EditProfileModal
        visible={true}
        onClose={handleClose}
        initialFirstName="John"
        initialLastName="Doe"
        onSave={handleSave}
      />
    );

    // Initial renders
    expect(getByPlaceholderText('formAuth.firstName')).toBeTruthy();
    expect(getByPlaceholderText('formAuth.lastName')).toBeTruthy();

    const saveButton = getByText('base.save');
    expect(saveButton).toBeTruthy();

    // Change first name
    const firstNameInput = getByPlaceholderText('formAuth.firstName');
    fireEvent.changeText(firstNameInput, 'Jane');

    // Trigger save
    fireEvent.press(saveButton);
    expect(handleSave).toHaveBeenCalledWith('Jane', 'Doe');
  });
});
