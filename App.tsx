
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Personnel from './pages/Personnel';
import CreatePersonnel from './pages/CreatePersonnel';
import EditPersonnel from './pages/EditPersonnel';
import Requisitions from './pages/Requisitions';
import CreateRequisition from './pages/CreateRequisition';
import EditRequisition from './pages/EditRequisition';
import Materials from './pages/Materials';
import Users from './pages/Users';
import UserProfile from './pages/UserProfile';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/" replace />} />
        
        {session ? (
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/personnel" element={<Personnel />} />
            <Route path="/personnel/create" element={<CreatePersonnel />} />
            <Route path="/personnel/edit/:id" element={<EditPersonnel />} />
            <Route path="/requisitions" element={<Requisitions />} />
            <Route path="/requisitions/create" element={<CreateRequisition />} />
            <Route path="/requisitions/edit/:id" element={<EditRequisition />} />
            <Route path="/materials" element={<Materials />} />
            <Route path="/users" element={<Users />} />
            <Route path="/settings" element={<UserProfile />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </Router>
  );
};

export default App;
