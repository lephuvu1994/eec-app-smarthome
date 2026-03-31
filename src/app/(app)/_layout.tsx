import { Redirect, Slot } from 'expo-router';
import { useUserManager } from '@/features/auth/user-store';
import { usePushNotifications } from '@/features/notifications/use-push-notifications';
import { useIsFirstTime } from '@/lib/hooks/use-is-first-time';

function AppLayout() {
  const { status } = useUserManager();
  const [isFirstTime] = useIsFirstTime();
  usePushNotifications();

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
