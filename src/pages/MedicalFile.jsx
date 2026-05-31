import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { patientAPI } from '../services/api';

const MedicalFile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('visits');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await patientAPI.getMedicalFile(user.refID);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.refID]);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const patient = data?.patient;
  const records = data?.medicalRecords || [];
  const prescriptions = data?.activePrescriptions || [];
  const appointments = data?.appointments || [];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <div className="bg-white border-b px-6 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/patient')} className="text-sm text-gray-400 hover:text-gray-600">← Back</button>
          <span className="text-sm font-medium text-gray-800 flex-1">Medical File</span>
          <button onClick={handlePrint} className="bg-green-500 text-white text-xs px-4 py-2 rounded-lg hover:bg-green-600">
            ⬇ Export PDF
          </button>
        </div>

        <div className="p-5">
          {/* Patient header */}
          <div className="bg-white rounded-xl border p-5 mb-5 flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xl font-medium flex-shrink-0">
              {patient?.Name?.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="text-lg font-semibold text-gray-800">{patient?.Name}</div>
              <div className="text-sm text-gray-400">{user?.refID} · DOB: {patient?.Age} years old · {patient?.Gender}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-xs text-gray-400">Condition</div>
                <div className={`text-sm font-semibold ${patient?.Condition === 'Emergency' ? 'text-red-600' : patient?.Condition === 'Chronic' ? 'text-amber-600' : 'text-green-600'}`}>
                  {patient?.Condition}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400">Total visits</div>
                <div className="text-sm font-semibold text-gray-800">{records.length}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400">Active meds</div>
                <div className="text-sm font-semibold text-blue-600">{prescriptions.length}</div>
              </div>
            </div>
          </div>

          {/* Symptom info */}
          {patient?.SymptomInput && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
              <div className="text-xs font-medium text-amber-700 mb-1">Latest symptom report (from chatbot)</div>
              <div className="text-sm text-amber-800">{patient.SymptomInput}</div>
              {patient?.RecommendedSpecialty && (
                <div className="text-xs text-amber-600 mt-1">Recommended specialty: <span className="font-medium">{patient.RecommendedSpecialty}</span></div>
              )}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-5">
            {['visits', 'prescriptions', 'appointments'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-green-500 text-white'
                    : 'bg-white border text-gray-500 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Visit history */}
          {activeTab === 'visits' && (
            <div>
              {records.length === 0 ? (
                <div className="bg-white rounded-xl border p-6 text-center text-sm text-gray-400">No medical records found</div>
              ) : (
                records.map((rec) => (
                  <div key={rec.RecordID} className="bg-white rounded-xl border p-4 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium text-gray-800">{new Date(rec.VisitDate).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-400">{rec.DoctorName} · {rec.Specialty}</div>
                    </div>
                    <div className="text-sm text-gray-700 mb-1"><span className="font-medium">Diagnosis:</span> {rec.Diagnosis}</div>
                    <div className="text-sm text-gray-700"><span className="font-medium">Treatment:</span> {rec.Treatment}</div>
                    {rec.SymptomInput && (
                      <div className="text-xs text-gray-400 mt-2">Symptoms: {rec.SymptomInput}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Prescriptions */}
          {activeTab === 'prescriptions' && (
            <div>
              {prescriptions.length === 0 ? (
                <div className="bg-white rounded-xl border p-6 text-center text-sm text-gray-400">No active prescriptions</div>
              ) : (
                prescriptions.map((pr) => (
                  <div key={pr.PrescriptionID} className="bg-white rounded-xl border p-4 mb-3 flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs flex-shrink-0">💊</div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">{pr.Medication}</div>
                      <div className="text-xs text-gray-400">{pr.Dosage} · {pr.Frequency} · {pr.DurationDays} days</div>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Active</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Appointments */}
          {activeTab === 'appointments' && (
            <div>
              {appointments.length === 0 ? (
                <div className="bg-white rounded-xl border p-6 text-center text-sm text-gray-400">No appointments found</div>
              ) : (
                appointments.map((appt) => (
                  <div key={appt.AppointmentID} className="bg-white rounded-xl border p-4 mb-3 flex items-center gap-4">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">{appt.DoctorName}</div>
                      <div className="text-xs text-gray-400">{appt.Specialty} · {new Date(appt.AppointmentDate).toLocaleDateString()}</div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      appt.Status === 'Completed' ? 'bg-green-100 text-green-700' :
                      appt.Status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>{appt.Status}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalFile;