
import React, { useState, useMemo } from 'react';
import { AttendanceRecord } from '../types';
import { getAttendanceSummary } from '../services/geminiService';

interface Props {
  records: AttendanceRecord[];
  isLoading: boolean;
}

type Period = 'all' | 'today' | '7days' | 'month' | 'custom';

const AttendanceAnalysis: React.FC<Props> = ({ records, isLoading }) => {
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [period, setPeriod] = useState<Period>('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Extract unique classes from records for the filter dropdown
  const uniqueClasses = useMemo(() => {
    const classes = Array.from(new Set(records.map(r => r.class))).sort();
    return classes;
  }, [records]);

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
      // 1. Class Filter
      if (selectedClass !== 'all' && r.class !== selectedClass) return false;

      // 2. Period/Date Filter
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
  }, [records, period, selectedClass, startDate, endDate]);

  const stats = useMemo(() => {
    if (filteredRecords.length === 0) return null;

    const total = filteredRecords.length;
    const counts = {
      Hadir: filteredRecords.filter(r => r.status === 'Hadir').length,
      Sakit: filteredRecords.filter(r => r.status === 'Sakit').length,
      Izin: filteredRecords.filter(r => r.status === 'Izin').length,
      Alpa: filteredRecords.filter(r => r.status === 'Alpa').length,
    };

    const attendanceRate = (counts.Hadir / total) * 100;

    return { total, counts, attendanceRate };
  }, [filteredRecords]);

  const handleGenerateInsight = async () => {
    if (filteredRecords.length === 0) return;
    setIsGenerating(true);
    setAiInsight(null);
    try {
      // Analyze the currently filtered data
      const summary = await getAttendanceSummary(filteredRecords.slice(0, 50)); 
      setAiInsight(summary || "Maaf, gagal menghasilkan analisa saat ini.");
    } catch (error) {
      setAiInsight("Terjadi kesalahan saat menghubungi asisten AI.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading && records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <i className="fa-solid fa-circle-notch fa-spin text-4xl text-blue-600 mb-4"></i>
        <p className="text-slate-500 font-medium">Memuat data analisa...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Filter Section */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-none text-sm font-bold text-slate-700">
            <i className="fa-solid fa-filter mr-2 text-blue-500"></i>
            Opsi Analisa:
          </div>
          
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            {/* Class Filter */}
            <div className="relative w-full md:w-44">
              <i className="fa-solid fa-school absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <select
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm appearance-none font-medium text-slate-700"
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setAiInsight(null);
                }}
              >
                <option value="all">Semua Kelas</option>
                {uniqueClasses.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none text-[10px]"></i>
            </div>

            {/* Period Filter */}
            <div className="relative w-full md:w-48">
              <i className="fa-solid fa-calendar-days absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <select
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm appearance-none font-medium text-slate-700"
                value={period}
                onChange={(e) => {
                  setPeriod(e.target.value as Period);
                  setAiInsight(null);
                }}
              >
                <option value="all">Semua Periode</option>
                <option value="today">Hari Ini</option>
                <option value="7days">7 Hari Terakhir</option>
                <option value="month">Bulan Ini</option>
                <option value="custom">Rentang Tanggal</option>
              </select>
              <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none text-[10px]"></i>
            </div>
          </div>

          {period === 'custom' && (
            <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto animate-in slide-in-from-left-2 duration-300">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full md:w-40 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-slate-400 text-xs font-bold">SAMPAI</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full md:w-40 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          
          <div className="flex-1 text-right">
            <span className="text-xs font-bold text-slate-400">
              {filteredRecords.length} DATA DITEMUKAN
            </span>
          </div>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fa-solid fa-calendar-xmark text-slate-200 text-4xl"></i>
          </div>
          <h3 className="text-xl font-bold text-slate-800">Tidak Ada Data</h3>
          <p className="text-slate-500 mt-2 max-w-sm mx-auto">
            Tidak ditemukan data absensi pada kriteria yang dipilih. Coba pilih kelas atau periode lain.
          </p>
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Presensi</p>
              <div className="flex items-end justify-between">
                <h4 className="text-3xl font-black text-slate-800">{stats?.total}</h4>
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-database"></i>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tingkat Kehadiran</p>
              <div className="flex items-end justify-between">
                <h4 className="text-3xl font-black text-green-600">{stats?.attendanceRate.toFixed(1)}%</h4>
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-percent"></i>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sakit / Izin</p>
              <div className="flex items-end justify-between">
                <h4 className="text-3xl font-black text-amber-600">{(stats?.counts.Sakit || 0) + (stats?.counts.Izin || 0)}</h4>
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-notes-medical"></i>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tanpa Keterangan</p>
              <div className="flex items-end justify-between">
                <h4 className="text-3xl font-black text-red-600">{stats?.counts.Alpa}</h4>
                <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                  <i className="fa-solid fa-user-xmark"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Breakdown List */}
            <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                <h3 className="font-bold text-slate-800">Rincian Status</h3>
              </div>
              <div className="p-6 space-y-4 flex-1">
                {Object.entries(stats?.counts || {}).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                       <div className={`w-2 h-2 rounded-full ${
                          status === 'Hadir' ? 'bg-green-500' :
                          status === 'Sakit' ? 'bg-blue-500' :
                          status === 'Izin' ? 'bg-amber-500' : 'bg-red-500'
                       }`} />
                       <span className="text-sm font-medium text-slate-600">{status}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-slate-800">{count}</span>
                      <span className="text-[10px] text-slate-400 font-medium">({(((count as any) / (stats?.total || 1)) * 100).toFixed(0)}%)</span>
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 mt-4 border-t border-slate-50">
                   <div className="p-4 bg-blue-50 rounded-2xl text-[11px] text-blue-700 leading-relaxed italic">
                     "Wawasan di samping ini khusus untuk data pada filter yang Anda pilih."
                   </div>
                </div>
              </div>
            </div>

            {/* AI Insight Panel */}
            <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-xl shadow-blue-100 p-8 text-white flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full -ml-10 -mb-10 blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                    <i className="fa-solid fa-wand-magic-sparkles text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Analisa Cerdas AI</h3>
                    <p className="text-blue-100 text-xs font-medium">Data Terfilter: {filteredRecords.length} Catatan</p>
                  </div>
                </div>

                <div className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-6 min-h-[200px] overflow-y-auto custom-scrollbar">
                  {aiInsight ? (
                    <div className="prose prose-invert prose-sm max-w-none text-blue-50 leading-relaxed whitespace-pre-wrap">
                      {aiInsight}
                    </div>
                  ) : isGenerating ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-4 py-10">
                      <div className="relative">
                        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                        <i className="fa-solid fa-brain absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs"></i>
                      </div>
                      <p className="text-sm font-medium animate-pulse text-blue-100">Menyusun analisa sesuai filter...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-10">
                      <i className="fa-solid fa-lightbulb text-4xl text-white/30 mb-4"></i>
                      <p className="text-blue-100 text-sm max-w-xs mx-auto">
                        Klik tombol di bawah untuk meminta AI merangkum data pada filter yang aktif.
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleGenerateInsight}
                  disabled={isGenerating}
                  className="w-full py-4 bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-2xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 flex items-center justify-center"
                >
                  {isGenerating ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                      Memproses...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-sparkles mr-2"></i>
                      {aiInsight ? 'Ulangi Analisa Filter Ini' : 'Analisa Filter Ini dengan AI'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AttendanceAnalysis;
