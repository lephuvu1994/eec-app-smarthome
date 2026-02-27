import * as React from 'react';

import { render, screen } from '@/lib/test-utils';

import { NativeButton } from './native-button';

jest.mock('./utils', () => ({
  IS_IOS: true,
}));

jest.mock('@expo/ui/swift-ui', () => {
  const React = require('react');
  return {
    Button: (props: any) =>
      React.createElement(
        'ButtonSwift',
        { testID: 'ios-button', ...props },
        props.children ?? 'ios-button',
      ),
  };
});

jest.mock('@expo/ui/jetpack-compose', () => {
  const React = require('react');
  return {
    Button: (props: any) =>
      React.createElement(
        'ButtonAndroid',
        { testID: 'android-button', ...props },
        props.children ?? 'android-button',
      ),
  };
});

describe('NativeButton', () => {
  it('renders iOS button when IS_IOS is true', () => {
    const props: any = {
      onPress: jest.fn(),
      children: 'Tap me',
    };

    render(<NativeButton {...props} />);

    expect(screen.getByTestId('ios-button')).toBeOnTheScreen();
    expect(screen.queryByTestId('android-button')).toBeNull();
  });
});

