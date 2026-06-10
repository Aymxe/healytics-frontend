import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { adminAPI } from '../services/api';

const AdminDoctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [filterAvail, setFilterAvail] = useState('All');
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    adminAPI.getDoctors()
      .then((res) => { setDoctors(res.data); setFiltered(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = doctors;
    if (filterAvail !== 'All') result = result.filter((d) => d.Availability === filterAvail);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) => d.Name?.toLowerCase().includes(q) || d.Specialty?.toLowerCase().includes(q) || d.HospitalName?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, filterAvail, doctors]);

  const toggleAvailability = async (doctorID, current) => {
    const next = current === 'Available' ? 'Busy' : 'Available';
    try {
      await adminAPI.updateDoctorAvailability(doctorID, { availability: next });
      setDoctors((prev) =>
        prev.map((d) => (d.DoctorID === doctorID ? { ...d, Availability: next } : d))
      );
      setSuccessMsg(`Doctor status updated to ${next}`);
      setTimeout(() => setSuccessMsg(''), 2500);
    } catch (err) {
      console.error(err);
    }
  };

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
          <span className="text-sm font-medium text-gray-800 flex-1">Doctors Management</span>
          <span className="text-xs text-gray-400">{filtered.length} doctor{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="p-5">
          {successMsg && (
            <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-xl text-sm text-purple-700">{successMsg}</div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div className="bg-white rounded-xl border p-4">
              <div className="text-xs text-gray-500 mb-1">Total doctors</div>
              <div className="text-2xl font-semibold text-purple-600">{doctors.length}</div>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <div className="text-xs text-gray-500 mb-1">Available</div>
              <div className="text-2xl font-semibold text-green-600">{doctors.filter((d) => d.Availability === 'Available').length}</div>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <div className="text-xs text-gray-500 mb-1">Busy</div>
              <div className="text-2xl font-semibold text-amber-600">{doctors.filter((d) => d.Availability !== 'Available').length}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, specialty, or hospital..."
              className="border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-400 w-72"
            />
            {['All', 'Available', 'Busy'].map((a) => (
              <button
                key={a}
                onClick={() => setFilterAvail(a)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                  filterAvail === a
                    ? 'bg-purple-500 text-white border-purple-500'
                    : 'bg-white text-gray-600 hover:border-purple-400 hover:text-purple-600'
                }`}
              >
                {a}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Doctor</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Specialty</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Hospital</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Phone</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-sm text-gray-400">No doctors found</td>
                  </tr>
                ) : (
                  filtered.map((doc, i) => (
                    <tr key={doc.DoctorID} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-medium flex-shrink-0">
                            {doc.Name?.charAt(0)}
                          </div>
                          <span className="text-sm text-gray-800">{doc.Name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-blue-600 font-medium">{doc.Specialty}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{doc.HospitalName || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{doc.Phone || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${doc.Availability === 'Available' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {doc.Availability || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleAvailability(doc.DoctorID, doc.Availability)}
                          className="text-xs text-purple-600 hover:text-purple-800 hover:underline font-medium"
                        >
                          Toggle status
                        </button>
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

export default AdminDoctors;
