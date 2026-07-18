import { useState } from 'react';
import { isLoggedIn } from '../lib/adminStore';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import './admin.css';

export default function AdminApp() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());

  if (!loggedIn) {
    return <AdminLogin onSuccess={() => setLoggedIn(true)} />;
  }
  return <AdminDashboard onSignOut={() => setLoggedIn(false)} />;
}
