import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { patientAPI, doctorAPI } from '../services/api';

const Appointments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBook, setShowBook] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apptRes, docRes] = await Promise.all([
          patientAPI.getAppointments(user.refID),
          doctorAPI.getAll(),
        ]);
        setAppointments(apptRes.data);
        setDoctors(docRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.refID]);

  const handleBook = async () => {
    if (!selectedDoctor || !selectedDate) {
      setError('Please select a doctor and date.');
      return;
    }
    try {
      await patientAPI.bookAppointment({
        patientID: user.refID,
        doctorID: selectedDoctor,
        appointmentDate: selectedDate,
      });
      setSuccessMsg('Appointment booked successfully!');
      setShowBook(false);
      setSelectedDoctor('');
      setSelectedDate('');
      setError('');
      const res = await patientAPI.getAppointments(user.refID);
      setAppointments(res.data);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed.');
    }
  };

  const handleCancel = async (id) => {
    try {
      await patientAPI.bookAppointment({ cancel: true });
      const res = await patientAPI.getAppointments(user.refID);
      setAppointments(res.data);
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
        <div className="bg-white border-b px-6 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/patient')} className="text-sm text-gray-400 hover:text-gray-600">← Back</button>
          <span className="text-sm font-medium text-gray-800 flex-1">My Appointments</span>
          <button
            onClick={() => setShowBook(!showBook)}
            className="bg-green-500 text-white text-xs px-4 py-2 rounded-lg hover:bg-green-600"
          >
            + Book appointment
          </button>
        </div>

        <div className="p-5">
          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">{successMsg}</div>
          )}

          {/* Book form */}
          {showBook && (
            <div className="bg-white rounded-xl border p-5 mb-5">
              <div className="text-sm font-medium text-gray-800 mb-4">Book new appointment</div>
              {error && <div className="mb-3 p-2 bg-red-50 text-red-600 text-xs rounded-lg">{error}</div>}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Select doctor</label>
                  <select
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400"
                  >
                    <option value="">Choose a doctor...</option>
                    {doctors.map((doc) => (
                      <option key={doc.DoctorID} value={doc.DoctorID}>
                        {doc.Name} — {doc.Specialty}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Select date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleBook} className="bg-green-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-600">
                  Confirm booking
                </button>
                <button onClick={() => setShowBook(false)} className="bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-200">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Appointments list */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="px-5 py-3 border-b bg-gray-50">
              <span className="text-sm font-medium text-gray-700">All appointments ({appointments.length})</span>
            </div>
            {appointments.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">No appointments found</div>
            ) : (
              appointments.map((appt, i) => (
                <div key={appt.AppointmentID} className={`flex items-center gap-4 px-5 py-4 border-b last:border-b-0 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-800">{appt.DoctorName}</div>
                    <div className="text-xs text-gray-400">{appt.Specialty}</div>
                  </div>
                  <div className="text-xs text-gray-500">{new Date(appt.AppointmentDate).toLocaleDateString()}</div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(appt.Status)}`}>
                    {appt.Status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;