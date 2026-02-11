
import React, { useState, useEffect, useCallback } from 'react';
import LoginForm from './components/LoginForm';
import AttendanceForm from './components/AttendanceForm';
import Sidebar from './components/Sidebar';
import StudentTable from './components/StudentTable';
import AttendanceHistory from './components/AttendanceHistory';
import AttendanceAnalysis from './components/AttendanceAnalysis';
import { Teacher, Student, AppState, AttendanceRecord, DashboardView } from './types';
import { fetchSheetData } from './services/sheetService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LOADING);
  const [currentView, setCurrentView] = useState<DashboardView>(DashboardView.ABSENSI);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>([]);
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFetchingAttendance, setIsFetchingAttendance] = useState(false);

  const initData = useCallback(async () => {
    setAppState(AppState.LOADING);
    try {
      const [teacherData, studentData] = await Promise.all([
        fetchSheetData('Data Guru'),
        fetchSheetData('Data Siswa')
      ]);

      const mappedTeachers = teacherData.map(t => ({
        username: String(t.username || t.user_name || '').trim(),
        password: String(t.password || '').trim(),
        name: String(t.nama || t.name || t.username || 'Guru').trim()
      })).filter(t => t.username !== '');

      const mappedStudents = studentData.map(s => ({
        nisn: String(s.nisn || '').trim(),
        name: String(s.nama || s.name || '').trim(),
        class: String(s.kelas || s.class || '').trim(),
        rombel: String(s.rombongan_belajar || s.rombel || s.group || '').trim()
      })).filter(s => s.nisn !== '');

      setTeachers(mappedTeachers);
      setStudents(mappedStudents);
      setAppState(AppState.LOGIN);
    } catch (error) {
      console.error("Initialization error:", error);
      setTeachers([]);
      setStudents([]);
      setAppState(AppState.LOGIN);
    }
  }, []);

  useEffect(() => {
    initData();
  }, [initData]);

  useEffect(() => {
    if ((currentView === DashboardView.DATA_KEHADIRAN || currentView === DashboardView.ANALISA) && allAttendance.length === 0) {
      loadAttendanceHistory();
    }
  }, [currentView]);

  const loadAttendanceHistory = async () => {
    setIsFetchingAttendance(true);
    try {
      const data = await fetchSheetData('Data Kehadiran');
      const mapped = data.map(r => ({
        nisn: String(r.nisn || ''),
        name: String(r.nama || r.name || ''),
        class: String(r.kelas || r.class || ''),
        rombel: String(r.rombongan_belajar || r.rombel || ''),
        lessonHour: String(r.jam_pelajaran || r.lesson_hour || ''),
        status: (r.status_kehadiran || r.status || 'Hadir') as AttendanceRecord['status'],
        date: String(r.tanggal || r.date || ''),
        teacherUsername: String(r.username || r.teacher_username || '')
      })).filter(r => r.nisn !== '');
      
      setAllAttendance(mapped.reverse());
    } catch (e) {
      console.error("Error loading attendance history:", e);
    } finally {
      setIsFetchingAttendance(false);
    }
  };

  const handleLogin = (teacher: Teacher) => {
    setCurrentTeacher(teacher);
    setAppState(AppState.DASHBOARD);
  };

  const handleLogout = () => {
    setCurrentTeacher(null);
    setAppState(AppState.LOGIN);
    setCurrentView(DashboardView.ABSENSI);
  };

  const handleAttendanceSuccess = (newRecords: AttendanceRecord[]) => {
    // Add new records to the top of the list for immediate visual confirmation
    setAllAttendance(prev => [...newRecords, ...prev]);
  };

  const renderView = () => {
    switch (currentView) {
      case DashboardView.ABSENSI:
        return (
          <div className="max-w-xl mx-auto py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <AttendanceForm 
              students={students} 
              currentTeacher={currentTeacher!} 
              onSuccess={handleAttendanceSuccess}
            />
          </div>
        );
      case DashboardView.DATA_SISWA:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="hidden lg:block mb-2">
              <h2 className="text-2xl font-bold text-slate-800">Database Siswa</h2>
              <p className="text-slate-500">Kelola dan lihat informasi lengkap siswa terdaftar</p>
            </div>
            <StudentTable students={students} />
          </div>
        );
      case DashboardView.DATA_KEHADIRAN:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="hidden lg:block mb-2">
              <h2 className="text-2xl font-bold text-slate-800">Riwayat Kehadiran</h2>
              <p className="text-slate-500">Laporan lengkap absensi siswa dari database</p>
            </div>
            <AttendanceHistory 
              records={allAttendance} 
              isLoading={isFetchingAttendance} 
              onRefresh={loadAttendanceHistory}
            />
          </div>
        );
      case DashboardView.ANALISA:
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="hidden lg:block mb-2">
              <h2 className="text-2xl font-bold text-slate-800">Analisa Kehadiran</h2>
              <p className="text-slate-500">Wawasan statistik dan cerdas berdasarkan data absensi</p>
            </div>
            <AttendanceAnalysis 
              records={allAttendance} 
              isLoading={isFetchingAttendance} 
            />
          </div>
        );
      default:
        return null;
    }
  };

  if (appState === AppState.LOADING) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-bold text-slate-800 animate-pulse">Menghubungkan ke Database...</h2>
        <p className="text-slate-500 mt-2">Mohon tunggu sebentar</p>
      </div>
    );
  }

  if (appState === AppState.LOGIN) {
    return <LoginForm teachers={teachers} onLogin={handleLogin} isLoading={false} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      <Sidebar 
        currentView={currentView}
        onViewChange={setCurrentView}
        currentTeacher={currentTeacher!}
        onLogout={handleLogout}
        isMobileMenuOpen={isMobileMenuOpen}
        setMobileMenuOpen={setIsMobileMenuOpen}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-30 lg:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 text-slate-500"
          >
            <i className="fa-solid fa-bars-staggered text-xl"></i>
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-blue-200">
              <i className="fa-solid fa-graduation-cap text-white text-sm"></i>
            </div>
            <span className="font-bold text-slate-800">SiPintar</span>
          </div>
          <div className="w-8" />
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
