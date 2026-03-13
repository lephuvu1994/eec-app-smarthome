import type {
  GetNextPageParamFunction,
  GetPreviousPageParamFunction,
} from '@tanstack/react-query';

import type { TPaginateQuery } from '../utils';

type KeyParams = {
  [key: string]: any;
};
export const DEFAULT_LIMIT = 10;
// ✅ Đưa regex ra ngoài module scope để tránh re-compilation
const URL_PARAMS_REGEX = /[?&]([^=#]+)=([^&#]*)/g;

export function getQueryKey<T extends KeyParams>(key: string, params?: T) {
  return [key, ...(params ? [params] : [])];
}

// for infinite query pages  to flatList data
export function normalizePages<T>(pages?: TPaginateQuery<T>[]): T[] {
  return pages
    ? pages.reduce((prev: T[], current) => [...prev, ...current.results], [])
    : [];
}

// a function that accept a url and return params as an object
export function getUrlParameters(
  url: string | null,
): { [k: string]: string } | null {
  if (url === null) {
    return null;
  }
  const params = {};
  let match;
  while ((match = URL_PARAMS_REGEX.exec(url))) {
    if (match[1] !== null) {
      // @ts-expect-error - Dynamic key assignment
      params[match[1]] = match[2];
    }
  }
  return params;
}

export const getPreviousPageParam: GetNextPageParamFunction<
  unknown,
  TPaginateQuery<unknown>
> = page => getUrlParameters(page.previous)?.offset ?? null;

export const getNextPageParam: GetPreviousPageParamFunction<
  unknown,
  TPaginateQuery<unknown>
> = page => getUrlParameters(page.next)?.offset ?? null;
