import * as React from 'react';
import { Text } from 'react-native';

import { render, screen } from '@/lib/test-utils';

import { MenuNative } from './menu-native';

jest.mock('./utils', () => ({
  IS_IOS: true,
}));

jest.mock('@expo/ui/swift-ui', () => {
  const React = require('react');

  const Host = (props: any) =>
    React.createElement('Host', { testID: 'ios-host', ...props }, props.children);

  const ContextMenu: any = (props: any) =>
    React.createElement('ContextMenu', { testID: 'ios-menu', ...props }, props.children);

  ContextMenu.Items = (props: any) =>
    React.createElement('ContextMenuItems', { testID: 'ios-items', ...props }, props.children);

  ContextMenu.Trigger = (props: any) =>
    React.createElement('ContextMenuTrigger', { testID: 'ios-trigger', ...props }, props.children);

  return {
    Host,
    ContextMenu,
  };
});

jest.mock('@expo/ui/jetpack-compose', () => {
  const React = require('react');
  return {
    ContextMenu: (props: any) =>
      React.createElement('ContextMenuAndroid', { testID: 'android-menu', ...props }, props.children),
  };
});

describe('MenuNative', () => {
  it('renders iOS Host and items when IS_IOS is true', () => {
    const listItem = [
      { key: 'one', element: <Text>Item 1</Text> },
      { key: 'two', element: <Text>Item 2</Text> },
    ];

    render(
      <MenuNative
        containerStyle={{ width: 100, height: 40 }}
        triggerComponent={<Text>Trigger</Text>}
        listItem={listItem}
      />,
    );

    expect(screen.getByTestId('ios-host')).toBeOnTheScreen();
    expect(screen.getByTestId('ios-menu')).toBeOnTheScreen();
    expect(screen.getByTestId('ios-items')).toBeOnTheScreen();
    expect(screen.getByTestId('ios-trigger')).toBeOnTheScreen();
  });
});

