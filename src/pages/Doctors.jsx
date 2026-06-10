import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { doctorAPI } from '../services/api';
import EmptyState from '../components/EmptyState';

const Doctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    doctorAPI.getAll()
      .then((res) => {
        const data = res.data;
        setDoctors(data);
        setFiltered(data);
        const unique = ['All', ...new Set(data.map((d) => d.Specialty).filter(Boolean))];
        setSpecialties(unique);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = doctors;
    if (selectedSpecialty !== 'All') {
      result = result.filter((d) => d.Specialty === selectedSpecialty);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) => d.Name?.toLowerCase().includes(q) || d.Specialty?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [selectedSpecialty, search, doctors]);

  const availabilityColor = (avail) =>
    avail === 'Available' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700';

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
          <span className="text-sm font-medium text-gray-800 flex-1">Doctors</span>
          <span className="text-xs text-gray-400">{filtered.length} doctor{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="p-5">
          {/* Search + Filter */}
          <div className="flex flex-wrap gap-3 mb-5">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or specialty..."
              className="border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-green-400 w-64"
            />
            <div className="flex gap-2 flex-wrap">
              {specialties.map((sp) => (
                <button
                  key={sp}
                  onClick={() => setSelectedSpecialty(sp)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedSpecialty === sp
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border text-gray-600 hover:border-blue-400 hover:text-blue-600'
                  }`}
                >
                  {sp}
                </button>
              ))}
            </div>
          </div>

          {/* Doctors grid */}
          {filtered.length === 0 ? (
            <EmptyState icon="👨‍⚕️" title="No doctors found" subtitle="Try adjusting your search or specialty filter." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((doc) => (
                <div key={doc.DoctorID} className="bg-white rounded-xl border p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-semibold text-sm">
                        {doc.Name?.charAt(0) || 'D'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">{doc.Name}</div>
                      <div className="text-xs text-blue-600 font-medium">{doc.Specialty}</div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${availabilityColor(doc.Availability)}`}>
                      {doc.Availability || 'Unknown'}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-gray-500">
                    {doc.HospitalName && (
                      <div className="flex items-center gap-1.5">
                        <span>🏥</span>
                        <span className="truncate">{doc.HospitalName}</span>
                      </div>
                    )}
                    {doc.MaxPatients && (
                      <div className="flex items-center gap-1.5">
                        <span>👥</span>
                        <span>Max {doc.MaxPatients} patients/day</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => navigate('/patient/appointments')}
                    className="mt-4 w-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium py-2 rounded-lg transition-colors"
                  >
                    Book appointment →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Doctors;
