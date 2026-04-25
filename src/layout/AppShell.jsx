import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppShell({ currentPage, onNavigate, children }) {
  return (
    <div className="app-shell">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      <TopBar />
      <main className="content">{children}</main>
    </div>
  );
}
