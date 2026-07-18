import { useEffect, useState } from 'react';
import App from './App.jsx';
import AdminApp from './admin/AdminApp.jsx';

function isAdminRoute() {
  return window.location.hash.replace(/^#\/?/, '') === 'admin';
}

export default function Root() {
  const [admin, setAdmin] = useState(isAdminRoute());

  useEffect(() => {
    function onHashChange() {
      setAdmin(isAdminRoute());
    }
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return admin ? <AdminApp /> : <App />;
}
