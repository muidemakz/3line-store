import type { PropsWithChildren } from 'react';
import { ConfigProvider, theme as antdThemeContext } from 'antd';
import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { appTheme } from '@/theme/antdTheme';
import { queryClient } from '@/shared/lib/queryClient';
import { useThemeStore } from '@/shared/store/theme.store';
import 'react-toastify/dist/ReactToastify.css';

export function AppProviders({ children }: PropsWithChildren) {
  const { theme } = useThemeStore();

  return (
    <ConfigProvider 
      theme={{ 
        ...appTheme, 
        algorithm: theme === 'dark' ? antdThemeContext.darkAlgorithm : antdThemeContext.defaultAlgorithm 
      }}
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {children}
          <ToastContainer
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme={theme}
          />
        </BrowserRouter>
      </QueryClientProvider>
    </ConfigProvider>
  );
}
