
export interface Teacher {
  username: string;
  password?: string;
  name: string;
}

export interface Student {
  nisn: string;
  name: string;
  class: string;
  rombel: string;
}

export interface AttendanceRecord {
  nisn: string;
  name: string;
  class: string;
  rombel: string;
  lessonHour: string;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';
  date: string;
  teacherUsername: string;
}

export enum AppState {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  LOADING = 'LOADING'
}

export enum DashboardView {
  ABSENSI = 'ABSENSI',
  DATA_SISWA = 'DATA_SISWA',
  DATA_KEHADIRAN = 'DATA_KEHADIRAN',
  ANALISA = 'ANALISA'
}
