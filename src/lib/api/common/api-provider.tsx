import { useReactQueryDevTools } from '@dev-plugins/react-query';
import { focusManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';
import { AppState } from 'react-native';

// ⚠️ QueryClient phải nằm NGOÀI component body.
// Nếu đặt bên trong, mỗi re-render tạo client mới → mất cache + dedup → API gọi 2 lần.
const queryClient = new QueryClient();

// ── React Native App Focus Integration ─────────────────────────────────────
// React Query's default focusManager listens to browser window focus events.
// In React Native, we must wire it to AppState instead.
// This ensures device state queries refetch when user returns from background,
// keeping position/state in sync with the backend (source of truth).
AppState.addEventListener('change', (nextState) => {
  focusManager.setFocused(nextState === 'active');
});

export function APIProvider({ children }: { children: React.ReactNode }) {
  useReactQueryDevTools(queryClient);
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
