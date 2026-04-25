import { Building2, LayoutDashboard, FileText } from 'lucide-react';
import { COMPANY } from '../constants/seed';

const NAV = [
  {
    group: null,
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    group: 'Modules',
    items: [
      { id: 'vouchers', label: 'Vouchers', icon: FileText },
    ],
  },
];

export default function Sidebar({ currentPage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Building2 size={20} color="#fff" />
        </div>
        <div className="sidebar-company">
          <div className="sidebar-company-name">{COMPANY.name}</div>
          <div className="sidebar-company-sub">{COMPANY.tagline}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map((section, sIdx) => (
          <div key={sIdx}>
            {section.group && <div className="sidebar-group-label">{section.group}</div>}
            {section.items.map(item => {
              const Icon = item.icon;
              const active = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`sidebar-item${active ? ' active' : ''}`}
                  onClick={() => onNavigate(item.id)}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">v1.0 · {new Date().getFullYear()}</div>
    </aside>
  );
}
