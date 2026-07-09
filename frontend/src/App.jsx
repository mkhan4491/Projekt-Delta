import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AuthProvider from './context/AuthProvider.jsx';
import { useAuth } from './context/useAuth.js';
import DataProvider from './context/DataProvider.jsx';
import { useData } from './context/useData.js';
import Sidebar from './components/Sidebar.jsx';
import Toast from './components/Toast.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import RechnungenPage from './pages/RechnungenPage.jsx';
import KundenPage from './pages/KundenPage.jsx';
import KundeDetailPage from './pages/KundeDetailPage.jsx';
import EinstellungenPage from './pages/EinstellungenPage.jsx';
import './App.css';

function AppLayout() {
  const { loading, toasts, removeToast } = useData();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        Lade Cortex Executive Operations...
      </div>
    );
  }

  return (
    <div className="layout">
      <Sidebar />
      <main className="page">
        <Outlet />
      </main>
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

function AuthGate() {
  const { session, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        Lade Cortex Executive Operations...
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  return (
    <DataProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/rechnungen" element={<RechnungenPage />} />
          <Route path="/kunden" element={<KundenPage />} />
          <Route path="/kunden/:id" element={<KundeDetailPage />} />
          <Route path="/einstellungen" element={<EinstellungenPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </DataProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

export default App;
