import type TranslateOptions from 'i18next';
import type { resources, TLanguage } from './resources';
import type { TRecursiveKeyOf } from './types';
import i18n from 'i18next';

import memoize from 'lodash.memoize';
import { useCallback } from 'react';
import { I18nManager, NativeModules, Platform } from 'react-native';

import { useMMKVString } from 'react-native-mmkv';
import RNRestart from 'react-native-restart';
import { storage } from '../storage';

type DefaultLocale = typeof resources.en.translation;
export type TxKeyPath = TRecursiveKeyOf<DefaultLocale>;

export const LOCAL = 'local';

export const getLanguage = () => storage.getString(LOCAL); // 'Marc' getItem<TLanguage | undefined>(LOCAL);

export const translate = memoize(
  (key: TxKeyPath, options = undefined) =>
    i18n.t(key, options) as unknown as string,
  (key: TxKeyPath, options: typeof TranslateOptions) =>
    options ? key + JSON.stringify(options) : key,
);

export function changeLanguage(lang: TLanguage) {
  i18n.changeLanguage(lang);
  I18nManager.forceRTL(false);
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    if (__DEV__)
      NativeModules.DevSettings.reload();
    else RNRestart.restart();
  }
  else if (Platform.OS === 'web') {
    window.location.reload();
  }
}

export function useSelectedLanguage() {
  const [language, setLang] = useMMKVString(LOCAL);

  const setLanguage = useCallback(
    (lang: TLanguage) => {
      setLang(lang);
      if (lang !== undefined)
        changeLanguage(lang as TLanguage);
    },
    [setLang],
  );

  return { language: language as TLanguage, setLanguage };
}
