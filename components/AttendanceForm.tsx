
import React, { useState, useMemo } from 'react';
import { Student, AttendanceRecord, Teacher } from '../types';
import { submitAttendance } from '../services/sheetService';
import { LESSON_HOURS, STATUS_OPTIONS } from '../constants';

interface Props {
  students: Student[];
  currentTeacher: Teacher;
  onSuccess: (records: AttendanceRecord[]) => void;
}

const AttendanceForm: React.FC<Props> = ({ students, currentTeacher, onSuccess }) => {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedRombel, setSelectedRombel] = useState<string>('');
  const [selectedLessonHour, setSelectedLessonHour] = useState<string>('');
  
  const [attendanceDraft, setAttendanceDraft] = useState<Record<string, AttendanceRecord['status']>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [batchStatus, setBatchStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const uniqueClasses = useMemo(() => {
    const classes = Array.from(new Set(students.map(s => s.class))).sort();
    return classes;
  }, [students]);

  const uniqueRombels = useMemo(() => {
    if (!selectedClass) return [];
    const rombels = Array.from(
      new Set(students.filter(s => s.class === selectedClass).map(s => s.rombel))
    ).sort();
    return rombels;
  }, [selectedClass, students]);

  const filteredStudents = useMemo(() => {
    if (!selectedClass || !selectedRombel) return [];
    return students
      .filter(s => s.class === selectedClass && s.rombel === selectedRombel)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedClass, selectedRombel, students]);

  const isAllMarked = useMemo(() => {
    if (filteredStudents.length === 0) return false;
    return filteredStudents.every(s => !!attendanceDraft[s.nisn]);
  }, [filteredStudents, attendanceDraft]);

  const handleSelectStatus = (nisn: string, status: AttendanceRecord['status']) => {
    setAttendanceDraft(prev => ({
      ...prev,
      [nisn]: status
    }));
    setBatchStatus(null);
  };

  const handleSubmitAll = async () => {
    if (!isAllMarked || !selectedLessonHour) return;

    setIsSubmitting(true);
    setBatchStatus(null);
    const successfulRecords: AttendanceRecord[] = [];
    let failureCount = 0;

    const dateStr = new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    for (const student of filteredStudents) {
      const record: AttendanceRecord = {
        nisn: student.nisn,
        name: student.name,
        class: student.class,
        rombel: student.rombel,
        lessonHour: selectedLessonHour,
        status: attendanceDraft[student.nisn],
        date: dateStr,
        teacherUsername: currentTeacher.username
      };

      const success = await submitAttendance(record);
      if (success) {
        successfulRecords.push(record);
      } else {
        failureCount++;
      }
    }

    if (successfulRecords.length === filteredStudents.length) {
      setBatchStatus({ type: 'success', text: `Berhasil! ${successfulRecords.length} data absensi telah tersimpan di database.` });
      onSuccess(successfulRecords);
      setAttendanceDraft({});
      setSelectedRombel('');
    } else if (successfulRecords.length > 0) {
      setBatchStatus({ type: 'error', text: `Hanya ${successfulRecords.length} data berhasil. ${failureCount} data gagal.` });
      onSuccess(successfulRecords);
    } else {
      setBatchStatus({ type: 'error', text: 'Gagal total mengirim data. Periksa koneksi atau URL Apps Script.' });
    }

    setIsSubmitting(false);
  };

  const handleLessonHourChange = (val: string) => {
    setSelectedLessonHour(val);
    setSelectedClass(''); 
    setSelectedRombel('');
    setAttendanceDraft({});
    setBatchStatus(null);
  };

  const handleClassChange = (val: string) => {
    setSelectedClass(val);
    setSelectedRombel(''); 
    setAttendanceDraft({});
    setBatchStatus(null);
  };

  const getStatusButtonClass = (nisn: string, status: string) => {
    const isSelected = attendanceDraft[nisn] === status;
    
    if (isSelected) {
      switch (status) {
        case 'Hadir': return 'bg-green-600 text-white ring-2 ring-green-200';
        case 'Izin': return 'bg-yellow-500 text-white ring-2 ring-yellow-100';
        case 'Sakit': return 'bg-blue-500 text-white ring-2 ring-blue-100';
        case 'Alpa': return 'bg-red-600 text-white ring-2 ring-red-100';
        default: return 'bg-slate-600 text-white';
      }
    }
    
    return 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50';
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col">
      <div className="bg-slate-50 p-6 border-b border-slate-100 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4 text-blue-600">
          <i className="fa-solid fa-clipboard-list text-xl"></i>
        </div>
        <h2 className="text-xl font-bold text-slate-800">Presensi Rombel</h2>
        <p className="text-slate-500 text-sm font-medium mt-1">
          Lengkapi semua status siswa sebelum mengirim
        </p>
      </div>

      <div className="p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">1. Jam Pelajaran</label>
            <div className="relative">
              <i className="fa-solid fa-clock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <select
                value={selectedLessonHour}
                onChange={(e) => handleLessonHourChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none text-slate-700 font-semibold appearance-none text-sm"
              >
                <option value="">-- Pilih Jam --</option>
                {LESSON_HOURS.map(hour => (
                  <option key={hour} value={hour}>Jam ke-{hour}</option>
                ))}
              </select>
              <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
            </div>
          </div>

          {selectedLessonHour && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">2. Pilih Kelas</label>
              <div className="relative">
                <i className="fa-solid fa-school absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <select
                  value={selectedClass}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none text-slate-700 font-semibold appearance-none text-sm"
                >
                  <option value="">-- Pilih Kelas --</option>
                  {uniqueClasses.map(className => (
                    <option key={className} value={className}>{className}</option>
                  ))}
                </select>
                <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
              </div>
            </div>
          )}

          {selectedClass && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">3. Pilih Rombel</label>
              <div className="relative">
                <i className="fa-solid fa-users-rectangle absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <select
                  value={selectedRombel}
                  onChange={(e) => {
                    setSelectedRombel(e.target.value);
                    setAttendanceDraft({});
                    setBatchStatus(null);
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none text-slate-700 font-semibold appearance-none text-sm"
                >
                  <option value="">-- Pilih Rombongan --</option>
                  {uniqueRombels.map(rombel => (
                    <option key={rombel} value={rombel}>{rombel}</option>
                  ))}
                </select>
                <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
              </div>
            </div>
          )}
        </div>

        {selectedRombel && (
          <div className="animate-in fade-in slide-in-from-top-6 duration-700 space-y-4">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex justify-between items-center py-2 border-b border-slate-50">
              <span>4. Daftar Siswa {selectedClass} - {selectedRombel}</span>
              <span className={`px-2 py-1 rounded-lg ${isAllMarked ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                {Object.keys(attendanceDraft).length} / {filteredStudents.length} Terpilih
              </span>
            </div>
            
            <div className="space-y-3">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <div 
                    key={student.nisn} 
                    className={`p-3 md:p-4 border rounded-2xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                      attendanceDraft[student.nisn] ? 'bg-white border-blue-100 shadow-sm shadow-blue-50' : 'bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate">{student.name}</p>
                      <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">
                        NISN: {student.nisn}
                      </p>
                    </div>
                    
                    <div className="flex gap-1.5 md:gap-2">
                      {STATUS_OPTIONS.map((status) => (
                        <button
                          key={status}
                          onClick={() => handleSelectStatus(student.nisn, status as AttendanceRecord['status'])}
                          disabled={isSubmitting}
                          className={`flex-1 md:flex-none min-w-[50px] md:w-16 py-2 rounded-xl text-[10px] font-bold transition-all active:scale-95 ${getStatusButtonClass(student.nisn, status)}`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <i className="fa-solid fa-users-slash text-slate-200 text-4xl mb-3"></i>
                  <p className="text-slate-400 text-sm">Tidak ada data siswa</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {(selectedRombel && (isAllMarked || batchStatus)) && (
        <div className="bg-slate-50 p-6 border-t border-slate-100 animate-in slide-in-from-bottom-4 duration-300">
          <div className="max-w-md mx-auto space-y-4">
            {batchStatus && (
              <div className={`p-4 rounded-2xl text-xs font-bold text-center animate-in zoom-in-95 duration-200 ${
                batchStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                <i className={`fa-solid ${batchStatus.type === 'success' ? 'fa-circle-check' : 'fa-circle-xmark'} mr-2`}></i>
                {batchStatus.text}
              </div>
            )}

            {isAllMarked && !batchStatus && (
              <button
                onClick={handleSubmitAll}
                disabled={isSubmitting}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                    Sedang Mengirim...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane mr-2"></i>
                    Kirim Semua Absensi ({filteredStudents.length} Siswa)
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceForm;
