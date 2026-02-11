
import React, { useState } from 'react';
import { Teacher } from '../types';

interface Props {
  teachers: Teacher[];
  onLogin: (teacher: Teacher) => void;
  isLoading: boolean;
}

const LoginForm: React.FC<Props> = ({ teachers, onLogin, isLoading }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Strict validation: Must match what's in the Google Sheet "Data Guru" table
    const teacher = teachers.find(t => 
      t.username.toLowerCase() === username.trim().toLowerCase() && 
      t.password === password.trim()
    );

    if (teacher) {
      onLogin(teacher);
    } else {
      setError('Username atau password tidak ditemukan di database Guru.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-600 to-indigo-800">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-8 md:p-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-2xl mb-6">
            <i className="fa-solid fa-school text-4xl text-blue-600"></i>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Login Guru</h1>
          <p className="text-slate-500 mt-2">Gunakan akun yang terdaftar di Spreadsheet</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center">
            <i className="fa-solid fa-circle-exclamation mr-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
            <div className="relative">
              <i className="fa-solid fa-user absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                type="text"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="Username (dari tabel Data Guru)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <div className="relative">
              <i className="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="Password (dari tabel Data Guru)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                Memeriksa Database...
              </>
            ) : (
              'Masuk Sekarang'
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 text-center text-xs text-slate-400">
          <p>&copy; 2024 Digital Attendance System</p>
          <p className="mt-1">Sinkronisasi Real-time dengan Data Guru</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
