import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { MatchmakingProvider } from './context/MatchmakingProvider';
import { MainLayout } from './layouts/MainLayout';
import { AppRoutes } from './router';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <MatchmakingProvider>
        <MainLayout>
          <AppRoutes />
        </MainLayout>
      </MatchmakingProvider>
    </BrowserRouter>
  );
};

export default App;
