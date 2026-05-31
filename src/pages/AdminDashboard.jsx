import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, docRes, logsRes] = await Promise.all([
          adminAPI.getStats(),
          adminAPI.getDoctors(),
          adminAPI.getLogs(),
        ]);
        setStats(statsRes.data);
        setDoctors(docRes.data);
        setLogs(logsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateAvailability = async (doctorID, availability) => {
    try {
      await adminAPI.updateDoctorAvailability(doctorID, { availability });
      setDoctors(prev =>
        prev.map(d => d.DoctorID === doctorID ? { ...d, Availability: availability } : d)
      );
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
          <span className="text-sm font-medium text-gray-800 flex-1">
            Admin Dashboard — {user?.fullName}
          </span>
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-medium">
            {user?.fullName?.charAt(0)}
          </div>
        </div>

        <div className="p-5">
          {/* Tabs */}
          <div className="flex gap-2 mb-5">
            {['overview', 'doctors', 'logs'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-purple-500 text-white'
                    : 'bg-white border text-gray-500 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && stats && (
            <>
              <div className="grid grid-cols-4 gap-4 mb-5">
                <div className="bg-white rounded-xl border p-4">
                  <div className="text-xs text-gray-500 mb-1">Total patients</div>
                  <div className="text-2xl font-semibold text-purple-600">{stats.totalPatients}</div>
                </div>
                <div className="bg-white rounded-xl border p-4">
                  <div className="text-xs text-gray-500 mb-1">Total doctors</div>
                  <div className="text-2xl font-semibold text-blue-600">{stats.totalDoctors}</div>
                </div>
                <div className="bg-white rounded-xl border p-4">
                  <div className="text-xs text-gray-500 mb-1">Total appointments</div>
                  <div className="text-2xl font-semibold text-green-600">{stats.totalAppointments}</div>
                </div>
                <div className="bg-white rounded-xl border p-4">
                  <div className="text-xs text-gray-500 mb-1">Completion rate</div>
                  <div className="text-2xl font-semibold text-amber-600">{stats.completionRate}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border p-4">
                  <div className="text-xs text-gray-500 mb-1">Active prescriptions</div>
                  <div className="text-2xl font-semibold text-green-600">{stats.activePrescriptions}</div>
                </div>
                <div className="bg-white rounded-xl border p-4">
                  <div className="text-xs text-gray-500 mb-1">Hospitals</div>
                  <div className="text-2xl font-semibold text-blue-600">{stats.totalHospitals}</div>
                </div>
                <div className="bg-white rounded-xl border p-4">
                  <div className="text-xs text-gray-500 mb-1">Pharmacies</div>
                  <div className="text-2xl font-semibold text-purple-600">{stats.totalPharmacies}</div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'doctors' && (
            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Doctor</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Specialty</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Hospital</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((doc, i) => (
                    <tr key={doc.DoctorID} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-sm text-gray-800">{doc.Name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{doc.Specialty}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{doc.HospitalName}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${doc.Availability === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {doc.Availability}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => updateAvailability(doc.DoctorID, doc.Availability === 'Available' ? 'Busy' : 'Available')}
                          className="text-xs text-purple-600 hover:underline"
                        >
                          Toggle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Log ID</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Admin</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Date</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Duration</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Device</th>
                    <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => (
                    <tr key={log.LogID} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-xs text-gray-400">{log.LogID}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{log.AdminName}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{new Date(log.LoginDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{log.DurationMin} min</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{log.DeviceType}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${log.Status === 'Success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {log.Status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;