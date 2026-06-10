import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Chatbot from '../components/Chatbot';
import { patientAPI, doctorAPI, hospitalAPI, pharmacyAPI } from '../services/api';
import { useNotifications } from '../context/NotificationContext';

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { syncNotifications } = useNotifications();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editAge, setEditAge] = useState('');
  const [editGender, setEditGender] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docRes, hospRes, pharmRes] = await Promise.all([
          doctorAPI.getAll(),
          hospitalAPI.getAll(),
          pharmacyAPI.getAll(),
        ]);
        setDoctors(docRes.data);
        setHospitals(hospRes.data);
        setPharmacies(pharmRes.data);

        if (user.refID) {
          const [apptRes, patRes] = await Promise.all([
            patientAPI.getAppointments(user.refID),
            patientAPI.getById(user.refID),
          ]);
          setAppointments(apptRes.data);
          setPatientData(patRes.data);
          syncNotifications(apptRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.refID]);

  const getStatusColor = (status) => {
    if (status === 'Completed') return 'bg-green-100 text-green-700';
    if (status === 'Pending') return 'bg-yellow-100 text-yellow-700';
    if (status === 'Cancelled') return 'bg-red-100 text-red-700';
    return 'bg-blue-100 text-blue-700';
  };

  const upcomingAppointments = appointments.filter(a => a.Status !== 'Cancelled').slice(0, 3);
  const nextAppointment = upcomingAppointments[0];

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
        {/* Topbar */}
        <div className="bg-white border-b px-6 py-3 flex items-center gap-3">
          <span className="text-sm font-medium text-gray-800 flex-1">
            Good morning, {user?.fullName?.split(' ')[0]} 👋
          </span>
          <span className="text-xs text-gray-400">{new Date().toDateString()}</span>
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-medium">
            {user?.fullName?.charAt(0)}
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main content */}
          <div className="flex-1 p-5 overflow-y-auto">

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-5">
              <div className="bg-white rounded-xl border p-4">
                <div className="text-xs text-gray-500 mb-1">Next appointment</div>
                <div className="text-lg font-semibold text-blue-600">
                  {nextAppointment ? new Date(nextAppointment.AppointmentDate).toLocaleDateString() : 'None'}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {nextAppointment?.DoctorName || 'No upcoming'}
                </div>
              </div>
              <div className="bg-white rounded-xl border p-4">
                <div className="text-xs text-gray-500 mb-1">Total appointments</div>
                <div className="text-lg font-semibold text-blue-600">{appointments.length}</div>
                <div className="text-xs text-gray-400 mt-1">All time</div>
              </div>
              <div className="bg-white rounded-xl border p-4">
                <div className="text-xs text-gray-500 mb-1">Condition</div>
                <div className="text-lg font-semibold text-amber-600">{patientData?.Condition || '—'}</div>
                <div className="text-xs text-gray-400 mt-1">Current status</div>
              </div>
            </div>

            {/* Appointments */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-800">Upcoming appointments</span>
                <button onClick={() => navigate('/patient/appointments')} className="text-xs text-blue-600 hover:underline">View all →</button>
              </div>
              {upcomingAppointments.length === 0 ? (
                <div className="bg-white rounded-xl border p-6 text-center text-sm text-gray-400">No upcoming appointments</div>
              ) : (
                upcomingAppointments.map((appt) => (
                  <div key={appt.AppointmentID} className="bg-white rounded-xl border p-3 flex items-center gap-3 mb-2 hover:border-gray-300 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">{appt.DoctorName}</div>
                      <div className="text-xs text-gray-400">{appt.Specialty}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">{new Date(appt.AppointmentDate).toLocaleDateString()}</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${getStatusColor(appt.Status)}`}>
                        {appt.Status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Doctors */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-800">Available doctors</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {doctors.slice(0, 4).map((doc) => (
                  <div key={doc.DoctorID} className="bg-white rounded-xl border p-3 flex items-center gap-3 hover:border-gray-300 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-medium flex-shrink-0">
                      {doc.Name.replace('Dr.', '').charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-800">{doc.Name}</div>
                      <div className="text-xs text-gray-400">{doc.Specialty}</div>
                      <div className={`text-xs mt-0.5 ${doc.Availability === 'Available' ? 'text-green-600' : 'text-amber-600'}`}>
                        {doc.Availability === 'Available' ? '● Available' : '◐ Busy'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="w-56 border-l bg-white flex flex-col">
            {/* Profile */}
            <div className="p-4 border-b">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium mb-3">
                {user?.fullName?.charAt(0)}
              </div>
              <div className="flex items-center justify-between mb-0.5">
                <div className="text-sm font-medium text-gray-800">{user?.fullName}</div>
                <button
                  onClick={() => { setEditMode(!editMode); setEditAge(patientData?.Age || ''); setEditGender(patientData?.Gender || ''); }}
                  className="text-xs text-blue-500 hover:text-blue-700"
                >
                  {editMode ? 'Cancel' : '✏️'}
                </button>
              </div>
              <div className="text-xs text-gray-400 mb-3">{user?.refID}</div>

              {editMode ? (
                <div className="mb-3">
                  <div className="mb-2">
                    <label className="text-xs text-gray-400 block mb-1">Age</label>
                    <input
                      type="number" min="1" max="120"
                      value={editAge}
                      onChange={e => setEditAge(e.target.value)}
                      className="w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400"
                      placeholder="e.g. 30"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="text-xs text-gray-400 block mb-1">Gender</label>
                    <select
                      value={editGender}
                      onChange={e => setEditGender(e.target.value)}
                      className="w-full border rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-blue-400 bg-white"
                    >
                      <option value="">Select...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <button
                    disabled={saving}
                    onClick={async () => {
                      setSaving(true);
                      try {
                        await patientAPI.updateProfile(user.refID, { age: editAge ? parseInt(editAge) : null, gender: editGender || null });
                        setPatientData(prev => ({ ...prev, Age: editAge ? parseInt(editAge) : null, Gender: editGender || null }));
                        setEditMode(false);
                      } catch (e) { console.error(e); }
                      finally { setSaving(false); }
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5 rounded-lg disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              ) : (
                patientData && (
                  <>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Age</span>
                      <span className="font-medium">{patientData.Age || '—'}</span>
                    </div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Gender</span>
                      <span className="font-medium">{patientData.Gender || '—'}</span>
                    </div>
                    {patientData.Condition && (
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Condition</span>
                        <span className={`font-medium ${patientData.Condition === 'Emergency' ? 'text-red-600' : patientData.Condition === 'Chronic' ? 'text-amber-600' : 'text-green-600'}`}>
                          {patientData.Condition}
                        </span>
                      </div>
                    )}
                  </>
                )
              )}
              <button
                onClick={() => navigate('/patient/medical-file')}
                className="w-full mt-3 bg-blue-50 text-blue-700 text-xs py-2 rounded-lg hover:bg-blue-100 transition-colors"
              >
                📋 View medical file
              </button>
            </div>

            {/* Pharmacies */}
            <div className="p-4 border-b">
              <div className="text-xs font-medium text-gray-800 mb-3">Nearby pharmacies</div>
              {pharmacies.slice(0, 3).map((ph) => (
                <div key={ph.PharmacyID} className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-xs text-gray-800">{ph.Name}</div>
                    <div className="text-xs text-gray-400">{ph.Is24Hours ? '24 hours' : `${ph.OpenTime} - ${ph.CloseTime}`}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${ph.Is24Hours ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {ph.Is24Hours ? 'Open' : 'Check'}
                  </span>
                </div>
              ))}
            </div>

            {/* Hospitals */}
            <div className="p-4">
              <div className="text-xs font-medium text-gray-800 mb-3">Hospitals</div>
              {hospitals.slice(0, 3).map((h) => (
                <div key={h.HospitalID} className="mb-2">
                  <div className="text-xs text-gray-800 font-medium">{h.Name}</div>
                  <div className="text-xs text-gray-400">{h.District}</div>
                  <div className="text-xs text-amber-600">⭐ {h.Rating}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Chatbot />
    </div>
  );
};

export default PatientDashboard;