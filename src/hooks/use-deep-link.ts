import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';

export function useDeepLink() {
  const [shareToken, setShareToken] = useState<string | null>(null);

  useEffect(() => {
    // Determine the route functionality based on url string
    const handleUrl = (url: string | null) => {
      if (!url)
        return;
      try {
        const { queryParams } = Linking.parse(url);
        if (queryParams && queryParams.token && typeof queryParams.token === 'string') {
          // If the link has '?token=', capture it as a share token
          setShareToken(queryParams.token as string);
        }
      }
      catch (error) {
        console.warn('Deep link parse error:', error);
      }
    };

    // 1. App started directly from a deep link
    Linking.getInitialURL().then(handleUrl);

    // 2. App was already open in background
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleUrl(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const clearShareToken = () => {
    setShareToken(null);
  };

  return { shareToken, clearShareToken };
}
