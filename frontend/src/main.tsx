import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@mantine/core/styles.css';
import './index.css';
import App from './App';
import { MantineProvider, rem } from '@mantine/core';
import type { MantineThemeOverride } from '@mantine/core';

const theme: MantineThemeOverride = {
  fontFamily: "'Orbitron', system-ui, sans-serif",
  primaryColor: 'orange',
  components: {
    Button: {
      defaultProps: { color: 'orange' },
      styles: () => ({
        root: { transition: 'all 0.2s', fontSize: rem(14) },
      }),
    },
    Card: {
      styles: () => ({
        root: {
          backgroundColor: 'rgba(15, 18, 25, 0.8)',
          borderColor: 'rgba(255,140,66,0.15)',
        },
      }),
    },
    Table: {
      styles: () => ({
        tr: {
          transition: 'color 0.2s ease',
          '&:hover': { color: '#ff8c42' },
        },
      }),
    },
  },
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <App />
    </MantineProvider>
  </StrictMode>,
);
