import type { ClassValue } from 'tailwind-variants';
import type { StoreApi, UseBoundStore } from 'zustand';
import clsx from 'clsx';
import * as Crypto from 'expo-crypto';
import { Linking } from 'react-native';
import { CONSTANTS, JSHmac } from 'react-native-hash';
import { twMerge } from 'tailwind-merge';

export function openLinkInBrowser(url: string) {
  Linking.canOpenURL(url).then(canOpen => canOpen && Linking.openURL(url));
}

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never;

export function createSelectors<S extends UseBoundStore<StoreApi<object>>>(_store: S) {
  const store = _store as WithSelectors<typeof _store>;
  store.use = {};
  for (const k of Object.keys(store.getState())) {
    (store.use as any)[k] = () => store(s => s[k as keyof typeof s]);
  }

  return store;
}
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function getHash256(a: string) {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    a,
  );
  return hash;
}

export async function getHash1(a: string) {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA1,
    a,
  );
  return hash;
}

export async function getHmac512(str: string, key: string) {
  const ciphertext = await JSHmac(
    str,
    key,
    CONSTANTS.HmacAlgorithms.HmacSHA512,
  );
  return ciphertext;
}

export function getOptimizedImageUrl(originalUrl: string, options: any) {
  const { width, quality, format } = options;

  const transformations = [
    format ? `f_${format}` : 'f_auto',
    quality ? `q_${quality}` : 'q_auto',
    width ? `w_${width}` : '',
  ].filter(Boolean).join(',');

  if (!originalUrl) {
    return originalUrl;
  }

  return originalUrl.replace('/upload/', `/upload/${transformations}/`);
}
