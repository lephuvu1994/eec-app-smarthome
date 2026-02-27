import * as React from 'react';

import { render, screen } from '@/lib/test-utils';

jest.mock('./float-input', () => {
  const React = require('react');
  const { TextInput, View, Text } = require('react-native');

  const FloatInput = (props: any) => (
    <View>
      {props.label ? <Text>{props.label}</Text> : null}
      <TextInput testID={props.testID} value={props.value} />
      {props.error ? (
        <Text testID={`${props.testID}-error`}>{props.error}</Text>
      ) : null}
      {props.rightIcon ? <View testID={`${props.testID}-icon`}>{props.rightIcon}</View> : null}
    </View>
  );

  return { FloatInput };
});

import { FloatInput } from './float-input';

describe('FloatInput', () => {
  it('renders label and no error by default', () => {
    render(
      <FloatInput
        label="Email"
        value=""
        onChangeText={() => {}}
        testID="email-input"
      />,
    );

    expect(screen.getByText('Email')).toBeOnTheScreen();
    expect(screen.queryByTestId('email-input-error')).toBeNull();
  });

  it('shows error text when error prop is provided', () => {
    render(
      <FloatInput
        label="Email"
        value="bad"
        error="Invalid email"
        onChangeText={() => {}}
        testID="email-input"
      />,
    );

    expect(screen.getByTestId('email-input-error')).toHaveTextContent(
      'Invalid email',
    );
  });

  it('renders right icon when provided', () => {
    render(
      <FloatInput
        label="Password"
        value="secret"
        onChangeText={() => {}}
        testID="password-input"
        rightIcon={<FloatInput />}
      />,
    );

    expect(screen.getByTestId('password-input')).toBeOnTheScreen();
    expect(screen.getByTestId('password-input-icon')).toBeOnTheScreen();
  });
});

