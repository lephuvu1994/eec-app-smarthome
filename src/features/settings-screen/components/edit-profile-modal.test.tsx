import { render, fireEvent } from '@testing-library/react-native';
import React from 'react';
import { EditProfileModal } from './edit-profile-modal';

// Mock dependencies
jest.mock('uniwind', () => ({
  useUniwind: jest.fn(() => ({ theme: 'light' })),
  withUniwind: jest.fn((component) => component),
}));

jest.mock('@/lib/i18n', () => ({
  translate: jest.fn((key: string) => key),
}));

describe('EditProfileModal', () => {
  it('renders correctly with initial name', () => {
    const mockSave = jest.fn();
    const { getByDisplayValue, getByText } = render(
      <EditProfileModal initialName="Test User" onSave={mockSave} />
    );

    expect(getByDisplayValue('Test User')).toBeTruthy();
    expect(getByText('formAuth.fullName')).toBeTruthy();
  });

  it('handles name changes and calls onSave properly', () => {
    const mockSave = jest.fn();
    const { getByDisplayValue, getByText } = render(
      <EditProfileModal initialName="Test User" onSave={mockSave} />
    );

    const input = getByDisplayValue('Test User');
    fireEvent.changeText(input, 'New User Name');

    // Simulate pressing the Save button
    const saveButton = getByText('base.save');
    fireEvent.press(saveButton);

    expect(mockSave).toHaveBeenCalledWith('New User Name');
  });

  it('disables save button when input is identical to initial name', () => {
    const mockSave = jest.fn();
    const { getByDisplayValue, getByText } = render(
      <EditProfileModal initialName="John" onSave={mockSave} />
    );

    const saveButton = getByText('base.save');
    // Save button should be disabled because the text is currently "John"
    fireEvent.press(saveButton);
    expect(mockSave).not.toHaveBeenCalled();

    // Change the name to empty string
    const input = getByDisplayValue('John');
    fireEvent.changeText(input, '    ');
    fireEvent.press(saveButton);
    
    // Saving empty string string is blocked
    expect(mockSave).not.toHaveBeenCalled();
  });
});
