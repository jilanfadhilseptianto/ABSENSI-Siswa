
import React, { useState } from 'react';
import { Student } from '../types';

interface Props {
  students: Student[];
}

const StudentTable: React.FC<Props> = ({ students }) => {
  const [search, setSearch] = useState('');

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.nisn.includes(search) ||
    s.class.toLowerCase().includes(search.toLowerCase()) ||
    s.rombel.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Data Siswa</h2>
          <p className="text-sm text-slate-500">Total {students.length} siswa terdaftar</p>
        </div>
        <div className="relative w-full md:w-72">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm"
            placeholder="Cari siswa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">NISN</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Kelas</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rombel</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.nisn} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">{student.nisn}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800">{student.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{student.class}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{student.rombel}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <i className="fa-solid fa-user-slash text-slate-200 text-4xl mb-3"></i>
                    <p className="text-slate-400">Siswa tidak ditemukan</p>
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

export default StudentTable;
