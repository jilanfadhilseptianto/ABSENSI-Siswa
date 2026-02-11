
import React from 'react';
import { DashboardView, Teacher } from '../types';

interface Props {
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
  currentTeacher: Teacher;
  onLogout: () => void;
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const Sidebar: React.FC<Props> = ({ 
  currentView, 
  onViewChange, 
  currentTeacher, 
  onLogout,
  isMobileMenuOpen,
  setMobileMenuOpen
}) => {
  const menuItems = [
    { id: DashboardView.ABSENSI, label: 'Absensi', icon: 'fa-clipboard-user' },
    { id: DashboardView.DATA_SISWA, label: 'Data Siswa', icon: 'fa-users' },
    { id: DashboardView.DATA_KEHADIRAN, label: 'Data Kehadiran', icon: 'fa-calendar-check' },
    { id: DashboardView.ANALISA, label: 'Analisa AI', icon: 'fa-chart-line' },
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
    ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <>
      {/* Backdrop for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={sidebarClasses}>
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <i className="fa-solid fa-graduation-cap text-white text-lg"></i>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800 leading-tight">SiPintar</h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Absensi Digital</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Utama</p>
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onViewChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  currentView === item.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <i className={`fa-solid ${item.icon} text-lg w-6`}></i>
                <span className="font-semibold text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-slate-100">
            <div className="bg-slate-50 rounded-2xl p-4 mb-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border-2 border-white">
                  {currentTeacher.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{currentTeacher.name}</p>
                  <p className="text-xs text-slate-500 truncate">@{currentTeacher.username}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center space-x-2 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-xs font-bold border border-red-100 bg-white"
              >
                <i className="fa-solid fa-right-from-bracket"></i>
                <span>Keluar Sistem</span>
              </button>
            </div>
            <p className="text-center text-[10px] text-slate-400">Versi 2.1.0 &bull; 2024</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
