import type { PropsWithChildren } from 'react';
import { ConfigProvider } from 'antd';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { appTheme } from '@/theme/antdTheme';
import { queryClient } from '@/shared/lib/queryClient';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ConfigProvider theme={appTheme}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {children}
          <ToastContainer
            position="top-right"
            autoClose={4000}
            newestOnTop
            closeOnClick
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </BrowserRouter>
      </QueryClientProvider>
    </ConfigProvider>
  );
}
