import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { adminAPI } from '../services/api';

const CONDITION_COLOR = {
  Emergency: 'bg-red-100 text-red-700',
  Chronic: 'bg-amber-100 text-amber-700',
  Stable: 'bg-green-100 text-green-700',
  Recovering: 'bg-blue-100 text-blue-700',
};

const AdminPatients = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCondition, setFilterCondition] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getPatients()
      .then((res) => { setPatients(res.data); setFiltered(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = patients;
    if (filterCondition !== 'All') result = result.filter((p) => p.Condition === filterCondition);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.Name?.toLowerCase().includes(q) ||
          p.PatientID?.toLowerCase().includes(q) ||
          p.BloodType?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, filterCondition, patients]);

  const conditions = ['All', ...new Set(patients.map((p) => p.Condition).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <div className="bg-white border-b px-6 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/admin')} className="text-sm text-gray-400 hover:text-gray-600">← Back</button>
          <span className="text-sm font-medium text-gray-800 flex-1">Patients Management</span>
          <span className="text-xs text-gray-400">{filtered.length} patient{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="p-5">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-5">
            <div className="bg-white rounded-xl border p-4">
              <div className="text-xs text-gray-500 mb-1">Total patients</div>
              <div className="text-2xl font-semibold text-purple-600">{patients.length}</div>
            </div>
            {['Emergency', 'Chronic', 'Stable'].map((c) => (
              <div key={c} className="bg-white rounded-xl border p-4">
                <div className="text-xs text-gray-500 mb-1">{c}</div>
                <div className={`text-2xl font-semibold ${
                  c === 'Emergency' ? 'text-red-600' : c === 'Chronic' ? 'text-amber-600' : 'text-green-600'
                }`}>
                  {patients.filter((p) => p.Condition === c).length}
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID, or blood type..."
              className="border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-400 w-72"
            />
            <div className="flex gap-2 flex-wrap">
              {conditions.map((c) => (
                <button
                  key={c}
                  onClick={() => setFilterCondition(c)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                    filterCondition === c
                      ? 'bg-purple-500 text-white border-purple-500'
                      : 'bg-white text-gray-600 hover:border-purple-400 hover:text-purple-600'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Patient</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">ID</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Age</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Gender</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Blood type</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Condition</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Phone</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-sm text-gray-400">No patients found</td>
                  </tr>
                ) : (
                  filtered.map((p, i) => (
                    <tr key={p.PatientID} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-medium flex-shrink-0">
                            {p.Name?.charAt(0)}
                          </div>
                          <span className="text-sm text-gray-800">{p.Name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 font-mono">{p.PatientID}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{p.Age}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{p.Gender}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                          {p.BloodType || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${CONDITION_COLOR[p.Condition] || 'bg-gray-100 text-gray-500'}`}>
                          {p.Condition || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{p.Phone || '—'}</td>
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

export default AdminPatients;
