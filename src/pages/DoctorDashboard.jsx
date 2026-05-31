import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { doctorAPI } from '../services/api';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await doctorAPI.getAppointments(user.refID);
        setAppointments(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.refID]);

  const updateStatus = async (appointmentID, status) => {
    try {
      await doctorAPI.updateAppointmentStatus(appointmentID, { status });
      setAppointments(prev =>
        prev.map(a => a.AppointmentID === appointmentID ? { ...a, Status: status } : a)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddRecord = async () => {
    if (!diagnosis || !treatment) return;
    try {
      await doctorAPI.addMedicalRecord({
        patientID: selectedPatient.PatientID,
        doctorID: user.refID,
        diagnosis,
        treatment,
        symptomInput: selectedPatient.SymptomInput || '',
        specialty: selectedPatient.RecommendedSpecialty || '',
      });
      setSuccessMsg('Medical record added successfully!');
      setDiagnosis('');
      setTreatment('');
      setShowAddRecord(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Completed') return 'bg-green-100 text-green-700';
    if (status === 'Pending') return 'bg-yellow-100 text-yellow-700';
    if (status === 'Cancelled') return 'bg-red-100 text-red-700';
    return 'bg-blue-100 text-blue-700';
  };

  const completed = appointments.filter(a => a.Status === 'Completed').length;
  const pending = appointments.filter(a => a.Status === 'Pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
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
            {user?.fullName} — Today's Schedule
          </span>
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-medium">
            {user?.fullName?.charAt(0)}
          </div>
        </div>

        <div className="p-5">
          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
              {successMsg}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            <div className="bg-white rounded-xl border p-4">
              <div className="text-xs text-gray-500 mb-1">Total patients</div>
              <div className="text-2xl font-semibold text-blue-600">{appointments.length}</div>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <div className="text-xs text-gray-500 mb-1">Completed</div>
              <div className="text-2xl font-semibold text-green-600">{completed}</div>
            </div>
            <div className="bg-white rounded-xl border p-4">
              <div className="text-xs text-gray-500 mb-1">Pending</div>
              <div className="text-2xl font-semibold text-amber-600">{pending}</div>
            </div>
          </div>

          <div className="flex gap-5">
            {/* Patient list */}
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-800 mb-3">Patient queue</div>
              {appointments.length === 0 ? (
                <div className="bg-white rounded-xl border p-6 text-center text-sm text-gray-400">No appointments today</div>
              ) : (
                appointments.map((appt) => (
                  <div
                    key={appt.AppointmentID}
                    className={`bg-white rounded-xl border p-4 mb-3 cursor-pointer transition-all ${selectedPatient?.AppointmentID === appt.AppointmentID ? 'border-blue-400' : 'hover:border-gray-300'}`}
                    onClick={() => setSelectedPatient(appt)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-medium flex-shrink-0">
                        {appt.PatientName?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-800">{appt.PatientName}</div>
                        <div className="text-xs text-gray-400">{appt.SymptomInput || 'No symptoms provided'}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">{new Date(appt.AppointmentDate).toLocaleDateString()}</div>
                        <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${getStatusColor(appt.Status)}`}>
                          {appt.Status}
                        </span>
                      </div>
                    </div>

                    {selectedPatient?.AppointmentID === appt.AppointmentID && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div className="bg-gray-50 rounded-lg p-2">
                            <div className="text-xs text-gray-400">Age</div>
                            <div className="text-sm font-medium">{appt.Age}</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2">
                            <div className="text-xs text-gray-400">Gender</div>
                            <div className="text-sm font-medium">{appt.Gender}</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-2">
                            <div className="text-xs text-gray-400">Specialty</div>
                            <div className="text-sm font-medium">{appt.RecommendedSpecialty || '—'}</div>
                          </div>
                        </div>

                        {appt.SymptomInput && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3 text-xs text-amber-800">
                            <span className="font-medium">AI pre-visit summary: </span>{appt.SymptomInput}
                          </div>
                        )}

                        <div className="flex gap-2 mb-3">
                          <button onClick={() => updateStatus(appt.AppointmentID, 'Completed')} className="flex-1 bg-green-500 text-white text-xs py-2 rounded-lg hover:bg-green-600">
                            ✓ Complete
                          </button>
                          <button onClick={() => updateStatus(appt.AppointmentID, 'Cancelled')} className="flex-1 bg-red-50 text-red-600 text-xs py-2 rounded-lg hover:bg-red-100">
                            ✕ Cancel
                          </button>
                          <button onClick={() => setShowAddRecord(!showAddRecord)} className="flex-1 bg-blue-50 text-blue-600 text-xs py-2 rounded-lg hover:bg-blue-100">
                            + Add record
                          </button>
                        </div>

                        {showAddRecord && (
                          <div className="bg-blue-50 rounded-lg p-3">
                            <input
                              type="text"
                              placeholder="Diagnosis"
                              value={diagnosis}
                              onChange={(e) => setDiagnosis(e.target.value)}
                              className="w-full border rounded-lg px-3 py-2 text-xs mb-2 focus:outline-none focus:border-blue-400"
                            />
                            <input
                              type="text"
                              placeholder="Treatment"
                              value={treatment}
                              onChange={(e) => setTreatment(e.target.value)}
                              className="w-full border rounded-lg px-3 py-2 text-xs mb-2 focus:outline-none focus:border-blue-400"
                            />
                            <button onClick={handleAddRecord} className="w-full bg-blue-500 text-white text-xs py-2 rounded-lg hover:bg-blue-600">
                              Save medical record
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;