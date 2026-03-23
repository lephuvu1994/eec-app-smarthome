import { useReactQueryDevTools } from '@dev-plugins/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as React from 'react';

// ⚠️ QueryClient phải nằm NGOÀI component body.
// Nếu đặt bên trong, mỗi re-render tạo client mới → mất cache + dedup → API gọi 2 lần.
const queryClient = new QueryClient();

export function APIProvider({ children }: { children: React.ReactNode }) {
  useReactQueryDevTools(queryClient);
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
