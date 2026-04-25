import { Bell, Settings } from 'lucide-react';
import { useTopBarState } from '../hooks/useTopBar';

export default function TopBar() {
  const { title, actions } = useTopBarState();

  return (
    <header className="topbar">
      <div className="topbar-title">{title}</div>
      <div className="topbar-actions">
        {actions}
        <button type="button" className="topbar-iconbtn" title="Notifications" aria-label="Notifications">
          <Bell size={16} />
          <span className="dot" />
        </button>
        <button type="button" className="topbar-iconbtn" title="Settings" aria-label="Settings">
          <Settings size={16} />
        </button>
      </div>
    </header>
  );
}
