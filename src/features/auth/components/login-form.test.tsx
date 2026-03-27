import * as React from 'react';
import { act } from '@testing-library/react-native';

import { cleanup, screen, setup, waitFor } from '@/lib/test-utils';
import { LoginForm, type TLoginFormProps } from './login-form';

jest.mock('@/components/ui', () => {
  const actual = jest.requireActual('@/components/ui');
  const React = require('react');
  const { TextInput, View, Text } = require('react-native');

  const FloatInput = (props: any) => (
    <View>
      {props.label ? <Text>{props.label}</Text> : null}
      <TextInput
        testID={props.testID}
        value={props.value}
        onChangeText={props.onChangeText}
        onBlur={props.onBlur}
      />
      {props.error ? (
        <Text testID={`${props.testID}-error`}>{props.error}</Text>
      ) : null}
      {props.rightIcon ? <View>{props.rightIcon}</View> : null}
    </View>
  );

  return {
    ...actual,
    FloatInput,
  };
});

jest.mock('react-native-keyboard-controller', () => {
  const { View } = require('react-native');
  return {
    KeyboardAvoidingView: View,
    KeyboardStickyView: View,
    KeyboardToolbar: View,
    useKeyboardHandler: jest.fn(),
    useReanimatedKeyboardAnimation: jest.fn(() => ({
      height: { value: 0 },
      progress: { value: 0 },
    })),
  };
});

jest.mock('expo-blur', () => {
  const { View } = require('react-native');
  return {
    BlurView: View,
  };
});

afterEach(cleanup);

const onSubmitMock = jest.fn(
  async (_value: Parameters<NonNullable<TLoginFormProps['onSubmit']>>[0]) => {},
);

describe('LoginForm', () => {
  it('renders correctly', async () => {
    setup(<LoginForm onSubmit={onSubmitMock} />);
    expect(await screen.findByTestId('login-button')).toBeOnTheScreen();
  });

  it('should display required errors when values are empty', async () => {
    const { user } = setup(<LoginForm onSubmit={onSubmitMock} />);

    const button = screen.getByTestId('login-button');
    expect(screen.queryByTestId('identifier-error')).not.toBeOnTheScreen();
    expect(screen.queryByTestId('password-input-error')).not.toBeOnTheScreen();

    await user.press(button);

    await waitFor(() => {
      expect(screen.getByTestId('identifier-error')).toBeOnTheScreen();
    });
    await waitFor(() => {
      expect(screen.getByTestId('password-input-error')).toBeOnTheScreen();
    });
  });

  it('should display matching error when email is invalid', async () => {
    const { user } = setup(<LoginForm onSubmit={onSubmitMock} />);

    const button = screen.getByTestId('login-button');
    const emailInput = screen.getByTestId('identifier');
    const passwordInput = screen.getByTestId('password-input');

    await user.type(emailInput, 'yyyyy');
    act(() => {
      emailInput.props.onBlur(); // Manually trigger blur to set touched state
    });
    await user.type(passwordInput, 'test123');
    await user.press(button);

    await waitFor(() => {
      expect(screen.getByTestId('identifier-error')).toBeOnTheScreen();
    });
  });

  it('should call LoginForm with correct values when values are valid', async () => {
    const { user } = setup(<LoginForm onSubmit={onSubmitMock} />);

    const button = screen.getByTestId('login-button');
    const emailInput = screen.getByTestId('identifier');
    const passwordInput = screen.getByTestId('password-input');

    await user.type(emailInput, 'youssef@gmail.com');
    await user.type(passwordInput, 'password');
    await user.press(button);
    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
    });
    expect(onSubmitMock).toHaveBeenCalledWith({
      identifier: 'youssef@gmail.com',
      password: 'password',
    });
  });

  it('should show password error when password is too short', async () => {
    const { user } = setup(<LoginForm onSubmit={onSubmitMock} />);

    const button = screen.getByTestId('login-button');
    const emailInput = screen.getByTestId('identifier');
    const passwordInput = screen.getByTestId('password-input');

    await user.type(emailInput, 'user@example.com');
    await user.type(passwordInput, '123');
    await user.press(button);

    await waitFor(() => {
      expect(screen.getByTestId('password-input-error')).toBeOnTheScreen();
    });
  });
});
