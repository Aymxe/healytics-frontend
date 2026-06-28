import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { doctorAPI, prescriptionAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

const DoctorPatients = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [savedRecordID, setSavedRecordID] = useState(null);
  const [showRx, setShowRx] = useState(false);
  const [medication, setMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [durationDays, setDurationDays] = useState('');

  useEffect(() => {
    if (!user.refID) { setLoading(false); return; }
    doctorAPI.getAppointments(user.refID)
      .then((res) => setAppointments(res.data))
      .catch((err) => console.error('DoctorPatients fetch error:', err.response?.data || err.message))
      .finally(() => setLoading(false));
  }, [user.refID]);

  const uniquePatients = () => {
    const seen = new Set();
    return appointments.filter((a) => {
      if (seen.has(a.PatientID)) return false;
      seen.add(a.PatientID);
      return true;
    });
  };

  const filtered = uniquePatients().filter((a) => {
    const q = search.toLowerCase();
    return (
      a.PatientName?.toLowerCase().includes(q) ||
      a.SymptomInput?.toLowerCase().includes(q) ||
      a.RecommendedSpecialty?.toLowerCase().includes(q)
    );
  });

  const handleAddRecord = async () => {
    if (!diagnosis || !treatment) return;
    try {
      const res = await doctorAPI.addMedicalRecord({
        patientID: selected.PatientID,
        doctorID: user.refID,
        diagnosis,
        treatment,
        symptomInput: selected.SymptomInput || '',
        specialty: selected.RecommendedSpecialty || '',
      });
      showToast('Medical record saved! Add a prescription below.', 'success');
      setSavedRecordID(res.data.recordID);
      setDiagnosis('');
      setTreatment('');
      setShowForm(false);
      setShowRx(true);
    } catch (err) {
      showToast('Failed to save record.', 'error');
    }
  };

  const handleAddPrescription = async () => {
    if (!medication || !dosage || !frequency || !durationDays) return;
    try {
      await prescriptionAPI.add({
        recordID: savedRecordID,
        patientID: selected.PatientID,
        medication,
        dosage,
        frequency,
        durationDays: parseInt(durationDays),
        symptomInput: selected.SymptomInput || '',
        recommendedSpecialty: selected.RecommendedSpecialty || '',
      });
      showToast('Prescription added!', 'success');
      setShowRx(false); setSavedRecordID(null);
      setMedication(''); setDosage(''); setFrequency(''); setDurationDays('');
    } catch (err) {
      showToast('Failed to add prescription.', 'error');
    }
  };

  const getVisitCount = (patientID) =>
    appointments.filter((a) => a.PatientID === patientID).length;

  const getLastVisit = (patientID) => {
    const visits = appointments.filter((a) => a.PatientID === patientID);
    if (visits.length === 0) return '—';
    const latest = visits.sort(
      (a, b) => new Date(b.AppointmentDate) - new Date(a.AppointmentDate)
    )[0];
    return new Date(latest.AppointmentDate).toLocaleDateString();
  };

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
      <div className="flex-1 flex min-w-0">
        {/* Patient list panel */}
        <div className="flex flex-col w-80 border-r bg-white">
          <div className="bg-white border-b px-4 py-3 flex items-center gap-3">
            <button onClick={() => navigate('/doctor')} className="text-sm text-gray-400 hover:text-gray-600">
              ←
            </button>
            <span className="text-sm font-medium text-gray-800 flex-1">Patient Search</span>
          </div>

          <div className="p-3 border-b">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patients..."
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
            />
            <div className="text-xs text-gray-400 mt-2">{filtered.length} patient{filtered.length !== 1 ? 's' : ''}</div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">No patients found</div>
            ) : (
              filtered.map((appt) => (
                <button
                  key={appt.PatientID}
                  onClick={() => { setSelected(appt); setShowForm(false); setDiagnosis(''); setTreatment(''); }}
                  className={`w-full text-left px-4 py-3 border-b transition-colors ${
                    selected?.PatientID === appt.PatientID
                      ? 'bg-blue-50 border-l-2 border-l-blue-500'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-medium flex-shrink-0">
                      {appt.PatientName?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">{appt.PatientName}</div>
                      <div className="text-xs text-gray-400">
                        {appt.Gender}, {appt.Age}y · {getVisitCount(appt.PatientID)} visit{getVisitCount(appt.PatientID) !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Detail panel */}
        <div className="flex-1 flex flex-col">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
              Select a patient to view details
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-5">
              {/* Patient header */}
              <div className="bg-white rounded-xl border p-5 mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xl font-semibold flex-shrink-0">
                    {selected.PatientName?.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-gray-800">{selected.PatientName}</div>
                    <div className="text-sm text-gray-500">Patient ID: {selected.PatientID}</div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 mt-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-400 mb-0.5">Age</div>
                    <div className="text-sm font-semibold text-gray-800">{selected.Age}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-400 mb-0.5">Gender</div>
                    <div className="text-sm font-semibold text-gray-800">{selected.Gender}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-400 mb-0.5">Visits</div>
                    <div className="text-sm font-semibold text-blue-600">{getVisitCount(selected.PatientID)}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-400 mb-0.5">Last visit</div>
                    <div className="text-sm font-semibold text-gray-800">{getLastVisit(selected.PatientID)}</div>
                  </div>
                </div>
              </div>

              {selected.SymptomInput && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                  <div className="text-xs font-medium text-amber-800 mb-1">📋 Patient reported symptoms</div>
                  <div className="text-sm text-amber-700">{selected.SymptomInput}</div>
                  {selected.RecommendedSpecialty && (
                    <div className="mt-2 text-xs text-amber-600">
                      Patient's concern: <span className="font-medium">{selected.RecommendedSpecialty}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Visit history */}
              <div className="bg-white rounded-xl border mb-4 overflow-hidden">
                <div className="px-4 py-3 border-b bg-gray-50 text-sm font-medium text-gray-700">
                  Visit History
                </div>
                {appointments
                  .filter((a) => a.PatientID === selected.PatientID)
                  .sort((a, b) => new Date(b.AppointmentDate) - new Date(a.AppointmentDate))
                  .map((appt, i) => (
                    <div key={appt.AppointmentID} className={`px-4 py-3 border-b last:border-b-0 ${i % 2 === 0 ? '' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="text-xs text-gray-600 font-medium">
                            {new Date(appt.AppointmentDate).toLocaleDateString()}
                            {appt.AppointmentTime && (
                              <span className="ml-2 text-blue-500 font-semibold">{appt.AppointmentTime}</span>
                            )}
                          </div>
                          {appt.SymptomInput && (
                            <div className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
                              {appt.SymptomInput}
                            </div>
                          )}
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                          appt.Status === 'Completed' ? 'bg-green-100 text-green-700' :
                          appt.Status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {appt.Status}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Add medical record */}
              <button
                onClick={() => setShowForm(!showForm)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm py-2.5 rounded-xl mb-3 transition-colors"
              >
                + Add Medical Record
              </button>

              {showForm && (
                <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
                  <div className="text-sm font-medium text-gray-800 mb-3">New medical record</div>
                  <input
                    type="text"
                    placeholder="Diagnosis"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:border-blue-400"
                  />
                  <textarea
                    placeholder="Treatment plan"
                    value={treatment}
                    onChange={(e) => setTreatment(e.target.value)}
                    rows={3}
                    className="w-full border rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-blue-400 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddRecord}
                      disabled={!diagnosis || !treatment}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg disabled:opacity-40"
                    >
                      Save + add prescription →
                    </button>
                    <button
                      onClick={() => setShowForm(false)}
                      className="bg-white border text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {showRx && savedRecordID && (
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mt-2">
                  <div className="text-sm font-medium text-teal-700 mb-3">💊 Add Prescription</div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <input type="text" placeholder="Medication" value={medication} onChange={e => setMedication(e.target.value)}
                      className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400" />
                    <input type="text" placeholder="Dosage (e.g. 500mg)" value={dosage} onChange={e => setDosage(e.target.value)}
                      className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400" />
                    <input type="text" placeholder="Frequency (e.g. 3x/day)" value={frequency} onChange={e => setFrequency(e.target.value)}
                      className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400" />
                    <input type="number" placeholder="Duration (days)" value={durationDays} onChange={e => setDurationDays(e.target.value)}
                      className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-400" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleAddPrescription}
                      disabled={!medication || !dosage || !frequency || !durationDays}
                      className="flex-1 bg-teal-500 hover:bg-teal-600 text-white text-sm py-2 rounded-lg disabled:opacity-40"
                    >
                      Add prescription
                    </button>
                    <button onClick={() => { setShowRx(false); setSavedRecordID(null); }}
                      className="text-sm text-gray-500 hover:text-gray-700 px-3">
                      Skip
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorPatients;
