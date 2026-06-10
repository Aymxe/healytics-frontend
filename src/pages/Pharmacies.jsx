import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { pharmacyAPI } from '../services/api';
import EmptyState from '../components/EmptyState';

const Pharmacies = () => {
  const navigate = useNavigate();
  const [pharmacies, setPharmacies] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [show24h, setShow24h] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pharmacyAPI.getAll()
      .then((res) => {
        setPharmacies(res.data);
        setFiltered(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = pharmacies;
    if (show24h) {
      result = result.filter((p) => p.Is24Hours);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.Name?.toLowerCase().includes(q) || p.District?.toLowerCase().includes(q) || p.Address?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [show24h, search, pharmacies]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
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
          <span className="text-sm font-medium text-gray-800 flex-1">Pharmacies</span>
          <span className="text-xs text-gray-400">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="p-5">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or location..."
              className="border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-green-400 w-64"
            />
            <button
              onClick={() => setShow24h(!show24h)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                show24h
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 hover:border-green-400 hover:text-green-600'
              }`}
            >
              🕐 Open 24h only
            </button>
          </div>

          {/* Pharmacies grid */}
          {filtered.length === 0 ? (
            <EmptyState icon="💊" title="No pharmacies found" subtitle="Try adjusting your search or removing the 24h filter." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((ph) => (
                <div key={ph.PharmacyID} className="bg-white rounded-xl border p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg">💊</span>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-800">{ph.Name}</div>
                        {ph.Is24Hours ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            Open 24h
                          </span>
                        ) : (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            Regular hours
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-500">
                    {ph.District && (
                      <div className="flex items-start gap-1.5">
                        <span className="mt-0.5">📍</span>
                        <span>{ph.District}</span>
                      </div>
                    )}
                    {ph.Phone && (
                      <div className="flex items-center gap-1.5">
                        <span>📞</span>
                        <span>{ph.Phone}</span>
                      </div>
                    )}
                    {(ph.OpenTime || ph.CloseTime) && !ph.Is24Hours && (
                      <div className="flex items-center gap-1.5">
                        <span>🕐</span>
                        <span>{ph.OpenTime} – {ph.CloseTime}</span>
                      </div>
                    )}
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

export default Pharmacies;
