import { Redirect, Slot } from 'expo-router';
import { useAuthStore as useAuth } from '@/features/auth/use-auth-store';
import { useIsFirstTime } from '@/lib/hooks/use-is-first-time';

function AppLayout() {
  const status = useAuth.use.status();
  const [isFirstTime] = useIsFirstTime();

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
