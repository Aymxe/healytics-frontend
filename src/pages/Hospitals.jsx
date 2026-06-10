import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { hospitalAPI } from '../services/api';
import EmptyState from '../components/EmptyState';

const Hospitals = () => {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hospitalAPI.getAll()
      .then((res) => {
        setHospitals(res.data);
        setFiltered(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(hospitals);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(
      hospitals.filter(
        (h) =>
          h.Name?.toLowerCase().includes(q) ||
          h.District?.toLowerCase().includes(q) ||
          h.Specialties?.toLowerCase().includes(q)
      )
    );
  }, [search, hospitals]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="bg-white border-b px-6 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/patient')} className="text-sm text-gray-400 hover:text-gray-600">
            ← Back
          </button>
          <span className="text-sm font-medium text-gray-800 flex-1">Hospitals</span>
          <span className="text-xs text-gray-400">{filtered.length} hospital{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="p-5">
          {/* Search */}
          <div className="mb-5">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, location, or specialty..."
              className="border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-green-400 w-72"
            />
          </div>

          {/* Hospitals list */}
          {filtered.length === 0 ? (
            <EmptyState icon="🏥" title="No hospitals found" subtitle="Try a different search term." />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filtered.map((h) => (
                <div key={h.HospitalID} className="bg-white rounded-xl border p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 text-xl">
                      🏥
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="text-sm font-semibold text-gray-800 truncate">{h.Name}</div>
                        <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                          h.IsActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {h.IsActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-gray-500">
                        {h.Location && (
                          <div className="flex items-start gap-1.5">
                            <span className="mt-0.5">📍</span>
                            <span>{h.District}</span>
                          </div>
                        )}
                        {h.Phone && (
                          <div className="flex items-center gap-1.5">
                            <span>📞</span>
                            <span>{h.Phone}</span>
                          </div>
                        )}
                        {h.Rating && (
                          <div className="flex items-center gap-1.5">
                            <span>⭐</span>
                            <span>{h.Rating} / 5.0</span>
                          </div>
                        )}
                      </div>

                      {h.Specialties && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {h.Specialties.split(',').map((sp, i) => (
                            <span
                              key={i}
                              className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full"
                            >
                              {sp.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hospitals;
