import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { adminAPI } from '../services/api';

const AdminLogs = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getLogs()
      .then((res) => { setLogs(res.data); setFiltered(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = logs;
    if (filterStatus !== 'All') result = result.filter((l) => l.Status === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) => l.AdminName?.toLowerCase().includes(q) || l.DeviceType?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, filterStatus, logs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const totalMin = logs.reduce((acc, l) => acc + (l.DurationMin || 0), 0);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <div className="bg-white border-b px-6 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/admin')} className="text-sm text-gray-400 hover:text-gray-600">← Back</button>
          <span className="text-sm font-medium text-gray-800 flex-1">Activity Log</span>
          <span className="text-xs text-gray-400">{filtered.length} entries</span>
        </div>

        <div className="p-5">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div className="bg-white rounded-xl border p-4">
              <div className="text-xs text-gray-500 mb-1">Total sessions</div>
              <div className="text-2xl font-semibold text-purple-600">{logs.length}</div>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <div className="text-xs text-gray-500 mb-1">Successful logins</div>
              <div className="text-2xl font-semibold text-green-600">{logs.filter((l) => l.Status === 'Success').length}</div>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <div className="text-xs text-gray-500 mb-1">Total active time</div>
              <div className="text-2xl font-semibold text-blue-600">{totalMin} <span className="text-sm font-normal text-gray-400">min</span></div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by admin or device..."
              className="border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-400 w-64"
            />
            {['All', 'Success', 'Failed'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                  filterStatus === s
                    ? 'bg-purple-500 text-white border-purple-500'
                    : 'bg-white text-gray-600 hover:border-purple-400 hover:text-purple-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Log ID</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Admin</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Date</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Duration</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Device</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">IP Address</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-sm text-gray-400">No logs found</td>
                  </tr>
                ) : (
                  filtered.map((log, i) => (
                    <tr key={log.LogID} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono">{log.LogID}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-medium flex-shrink-0">
                            {log.AdminName?.charAt(0)}
                          </div>
                          <span className="text-sm text-gray-800">{log.AdminName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {log.LoginDate
                          ? `${new Date(log.LoginDate).toISOString().slice(0, 10)}${log.LoginTime ? ' · ' + log.LoginTime : ''}`
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {log.DurationMin != null ? `${log.DurationMin} min` : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{log.DeviceType || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono">{log.IPAddress || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          log.Status === 'Success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {log.Status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogs;
