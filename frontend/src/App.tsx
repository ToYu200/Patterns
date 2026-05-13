import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { MatchmakingProvider } from './context/MatchmakingProvider';
import { MainLayout } from './layouts/MainLayout';
import { AppRoutes } from './router';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <MatchmakingProvider>
          <MainLayout>
            <AppRoutes />
          </MainLayout>
        </MatchmakingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
