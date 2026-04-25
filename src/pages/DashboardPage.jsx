import { FileText } from 'lucide-react';
import { useTopBar } from '../hooks/useTopBar';
import { COMPANY } from '../constants/seed';
import '../styles/dashboard.css';

export default function DashboardPage({ onNavigate }) {
  useTopBar('Dashboard', null, []);

  return (
    <div>
      <div className="dash-welcome">
        <h2>Welcome to {COMPANY.name}</h2>
        <p>
          Use the sidebar to access available modules. Open the Vouchers module to create,
          edit, print, and export debit or credit vouchers.
        </p>
      </div>

      <div className="dash-modules">
        <button type="button" className="dash-module" onClick={() => onNavigate('vouchers')}>
          <div className="dash-module-icon"><FileText size={20} /></div>
          <div>
            <div className="dash-module-title">Vouchers</div>
            <div className="dash-module-desc">Manage debit & credit vouchers</div>
          </div>
        </button>
      </div>
    </div>
  );
}
