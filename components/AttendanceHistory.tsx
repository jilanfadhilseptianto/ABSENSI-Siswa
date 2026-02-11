
import React, { useState, useMemo } from 'react';
import { AttendanceRecord } from '../types';

interface Props {
  records: AttendanceRecord[];
  isLoading: boolean;
  onRefresh: () => void;
}

type Period = 'all' | 'today' | '7days' | 'month' | 'custom';

const AttendanceHistory: React.FC<Props> = ({ records, isLoading, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState<Period>('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedRombel, setSelectedRombel] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Extract unique classes from records
  const uniqueClasses = useMemo(() => {
    const classes = Array.from(new Set(records.map(r => r.class))).sort();
    return classes;
  }, [records]);

  // Extract unique rombels, filtered by class if a class is selected
  const availableRombels = useMemo(() => {
    const filteredByClass = selectedClass === 'all' 
      ? records 
      : records.filter(r => r.class === selectedClass);
    
    const rombels = Array.from(new Set(filteredByClass.map(r => r.rombel))).sort();
    return rombels;
  }, [records, selectedClass]);

  // Helper to parse dd/mm/yyyy into a Date object
  const parseDate = (dateStr: string) => {
    if (!dateStr) return new Date(0);
    const parts = dateStr.split('/');
    if (parts.length !== 3) return new Date(0);
    const [day, month, year] = parts.map(Number);
    return new Date(year, month - 1, day);
  };

  // Helper to parse yyyy-mm-dd (from input date) into a Date object
  const parseInputDate = (dateStr: string) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      // 1. Search Filter
      const matchesSearch = 
        r.name.toLowerCase().includes(search.toLowerCase()) || 
        r.nisn.includes(search) ||
        r.class.toLowerCase().includes(search.toLowerCase()) ||
        r.date.includes(search);

      if (!matchesSearch) return false;

      // 2. Class Filter
      if (selectedClass !== 'all' && r.class !== selectedClass) return false;

      // 3. Rombel Filter
      if (selectedRombel !== 'all' && r.rombel !== selectedRombel) return false;

      // 4. Period/Date Filter
      const recordDate = parseDate(r.date);
      recordDate.setHours(0, 0, 0, 0);

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      if (period === 'all') return true;

      switch (period) {
        case 'today':
          return recordDate.getTime() === now.getTime();
        case '7days': {
          const sevenDaysAgo = new Date(now);
          sevenDaysAgo.setDate(now.getDate() - 7);
          return recordDate >= sevenDaysAgo;
        }
        case 'month':
          return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
        case 'custom': {
          const start = parseInputDate(startDate);
          const end = parseInputDate(endDate);
          
          if (start && end) {
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            return recordDate >= start && recordDate <= end;
          } else if (start) {
            start.setHours(0, 0, 0, 0);
            return recordDate >= start;
          } else if (end) {
            end.setHours(23, 59, 59, 999);
            return recordDate <= end;
          }
          return true;
        }
        default:
          return true;
      }
    });
  }, [records, search, period, selectedClass, selectedRombel, startDate, endDate]);

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClass(e.target.value);
    setSelectedRombel('all'); // Reset rombel filter when class changes
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Riwayat Kehadiran</h2>
            <p className="text-sm text-slate-500">Tampilan data absensi yang sudah terkirim</p>
          </div>
          <button 
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center justify-center h-10 px-4 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all active:scale-95 disabled:opacity-50 text-sm font-semibold"
          >
            <i className={`fa-solid fa-rotate mr-2 ${isLoading ? 'fa-spin' : ''}`}></i>
            Segarkan Data
          </button>
        </div>

        <div className="flex flex-col space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Class Filter */}
            <div className="relative md:col-span-2">
              <i className="fa-solid fa-school absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <select
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm appearance-none font-medium text-slate-700"
                value={selectedClass}
                onChange={handleClassChange}
              >
                <option value="all">Semua Kelas</option>
                {uniqueClasses.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none text-[10px]"></i>
            </div>

            {/* Rombel Filter */}
            <div className="relative md:col-span-2">
              <i className="fa-solid fa-users-rectangle absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <select
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm appearance-none font-medium text-slate-700"
                value={selectedRombel}
                onChange={(e) => setSelectedRombel(e.target.value)}
              >
                <option value="all">Semua Rombel</option>
                {availableRombels.map(rmb => (
                  <option key={rmb} value={rmb}>{rmb}</option>
                ))}
              </select>
              <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none text-[10px]"></i>
            </div>

            {/* Period Filter */}
            <div className="relative md:col-span-3">
              <i className="fa-solid fa-calendar-day absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <select
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm appearance-none font-medium text-slate-700"
                value={period}
                onChange={(e) => setPeriod(e.target.value as Period)}
              >
                <option value="all">Semua Periode</option>
                <option value="today">Hari Ini</option>
                <option value="7days">7 Hari Terakhir</option>
                <option value="month">Bulan Ini</option>
                <option value="custom">Rentang Tanggal</option>
              </select>
              <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none text-[10px]"></i>
            </div>

            {/* Search Input */}
            <div className="relative md:col-span-5">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm font-medium"
                placeholder="Cari NISN, Nama, atau Kata Kunci..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Custom Date Range Selection */}
          {period === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Mulai Tanggal</label>
                <div className="relative">
                  <i className="fa-solid fa-calendar-plus absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm font-medium"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Sampai Tanggal</label>
                <div className="relative">
                  <i className="fa-solid fa-calendar-check absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm font-medium"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tanggal</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">NISN</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Siswa</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kelas / Rombel</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Jam</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Username Guru</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading && records.length === 0 ? (
               <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <i className="fa-solid fa-circle-notch fa-spin text-blue-600 text-3xl mb-3"></i>
                    <p className="text-slate-500 font-medium">Menghubungkan ke Spreadsheet...</p>
                  </div>
                </td>
              </tr>
            ) : filteredRecords.length > 0 ? (
              filteredRecords.map((record, index) => (
                <tr key={`${record.nisn}-${index}`} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap font-medium">{record.date}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-mono">{record.nisn}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800">{record.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                    {record.class} <span className="text-slate-300 mx-1">/</span> {record.rombel}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">Jam ke-{record.lessonHour}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center justify-center w-fit ${
                      record.status === 'Hadir' ? 'bg-green-100 text-green-700' :
                      record.status === 'Alpa' ? 'bg-red-100 text-red-700' :
                      record.status === 'Sakit' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      <i className={`fa-solid mr-1.5 ${
                        record.status === 'Hadir' ? 'fa-check' :
                        record.status === 'Alpa' ? 'fa-xmark' :
                        record.status === 'Sakit' ? 'fa-briefcase-medical' :
                        'fa-clock'
                      }`}></i>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-medium">@{record.teacherUsername}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <i className="fa-solid fa-filter-circle-xmark text-slate-200 text-3xl"></i>
                    </div>
                    <p className="text-slate-400 font-medium">Tidak ada data untuk kriteria ini</p>
                    <p className="text-slate-300 text-xs mt-1">Coba sesuaikan filter kelas, rombel, periode, atau kata kunci</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceHistory;
