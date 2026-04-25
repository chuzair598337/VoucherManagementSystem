import { useState } from 'react';
import AppShell from './layout/AppShell';
import TopBarProvider from './context/TopBarProvider';
import { useToast } from './hooks/useToast';
import Toast from './components/Toast';
import DashboardPage from './pages/DashboardPage';
import VouchersPage from './pages/vouchers/VouchersPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('vouchers');
  const { toast, showToast } = useToast();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentPage} />;
      case 'vouchers':
      default:
        return <VouchersPage showToast={showToast} />;
    }
  };

  return (
    <TopBarProvider>
      <AppShell currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </AppShell>
      <Toast toast={toast} />
    </TopBarProvider>
  );
}
