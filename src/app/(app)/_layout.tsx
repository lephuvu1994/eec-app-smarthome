import { Redirect, Slot } from 'expo-router';
import { useEffect } from 'react';

import { useUserManager } from '@/features/auth/user-store';
import { useIsFirstTime } from '@/lib/hooks/use-is-first-time';
import { useNotificationStore } from '@/stores/notification';

function AppLayout() {
  const { status } = useUserManager();
  const [isFirstTime] = useIsFirstTime();

  useEffect(() => {
    useNotificationStore.getState().init();
  }, []);

  if (isFirstTime) {
    return <Redirect href="/onboarding" />;
  }
  else {
    if (status === 'signOut') {
      return <Redirect href="/(welcome)/signIn" />;
    }
    return <Slot />;
  }
}

export default AppLayout;
