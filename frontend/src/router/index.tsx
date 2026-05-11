import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Profile from '../pages/Profile';
import FindMatch from '../pages/FindMatch';
import Leaderboard from '../pages/Leaderboard';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profile/:id" element={<Profile />} />
      <Route path="/find" element={<FindMatch />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
    </Routes>
  );
};

export default AppRoutes;
