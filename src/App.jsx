import { useCallback, useState } from 'react';
import AppShell from './layout/AppShell';
import TopBarProvider from './context/TopBarProvider';
import { useToast } from './hooks/useToast';
import Toast from './components/Toast';
import PrintArea from './components/PrintArea';
import DashboardPage from './pages/DashboardPage';
import VouchersPage from './pages/vouchers/VouchersPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('vouchers');
  const [printEntry, setPrintEntry] = useState(null);
  const { toast, showToast } = useToast();

  const requestPrint = useCallback((entry) => {
    setPrintEntry(entry);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      window.print();
      setTimeout(() => setPrintEntry(null), 1500);
    }));
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onNavigate={setCurrentPage} />;
      case 'vouchers':
      default:
        return <VouchersPage showToast={showToast} onRequestPrint={requestPrint} />;
    }
  };

  return (
    <TopBarProvider>
      <AppShell currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </AppShell>
      <PrintArea entry={printEntry} />
      <Toast toast={toast} />
    </TopBarProvider>
  );
}
