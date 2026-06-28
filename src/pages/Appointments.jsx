import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';
import { patientAPI, doctorAPI, appointmentAPI } from '../services/api';

const AppointmentRow = ({ appt, i, getStatusColor, onCancel }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className={`border-b last:border-b-0 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-blue-50 transition-colors"
      >
        <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0"></div>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-800">{appt.DoctorName}</div>
          <div className="text-xs text-gray-400">{appt.Specialty}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">{new Date(appt.AppointmentDate).toLocaleDateString()}</div>
          {appt.AppointmentTime && (
            <div className="text-xs text-blue-500 font-medium">{appt.AppointmentTime}</div>
          )}
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(appt.Status)}`}>
          {appt.Status}
        </span>
        <span className="text-xs text-gray-400">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="px-5 pb-4 border-t bg-blue-50">
          <div className="pt-3 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-400">Doctor</span>
              <div className="font-medium text-gray-700">{appt.DoctorName} — {appt.Specialty}</div>
            </div>
            <div>
              <span className="text-gray-400">Date & Time</span>
              <div className="font-medium text-gray-700">
                {new Date(appt.AppointmentDate).toLocaleDateString()}
                {appt.AppointmentTime && <span className="ml-2 text-blue-600">{appt.AppointmentTime}</span>}
              </div>
            </div>
            <div>
              <span className="text-gray-400">Status</span>
              <div className="font-medium text-gray-700">{appt.Status}</div>
            </div>
            {appt.SymptomInput && (
              <div className="col-span-2">
                <span className="text-gray-400">Your notes</span>
                <div className="font-medium text-gray-700">{appt.SymptomInput}</div>
              </div>
            )}
          </div>
          {appt.Status === 'Pending' && (
            <button
              onClick={(e) => { e.stopPropagation(); onCancel(); }}
              className="mt-3 text-xs text-red-500 hover:text-red-700 hover:underline"
            >
              Cancel appointment
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const Appointments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { markAllRead } = useNotifications();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBook, setShowBook] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [confirmCancel, setConfirmCancel] = useState(null);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRes = await doctorAPI.getAll();
        setDoctors(docRes.data);
        if (user.refID) {
          const apptRes = await patientAPI.getAppointments(user.refID);
          setAppointments(apptRes.data);
          markAllRead(apptRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        // Pre-fill from chatbot recommendation
        if (location.state?.doctorID) {
          setSelectedDoctor(location.state.doctorID);
          setReason(location.state.symptoms || '');
          setShowBook(true);
        }
      }
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.refID]);

  const handleBook = async () => {
    if (!selectedDoctor) { setError('Please select a doctor.'); return; }
    if (!selectedDate) { setError('Please select a date.'); return; }
    if (!selectedTime) { setError('Please select a time slot.'); return; }
    try {
      await patientAPI.bookAppointment({
        patientID: user.refID,
        doctorID: selectedDoctor,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        reason,
      });
      showToast('Appointment booked successfully!', 'success');
      setShowBook(false);
      setSelectedDoctor('');
      setSelectedDate('');
      setSelectedTime('');
      setReason('');
      setError('');
      const res = await patientAPI.getAppointments(user.refID);
      setAppointments(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed.');
    }
  };

  // ✅ FIXED: uses correct cancel API
  const handleCancel = async () => {
    if (!confirmCancel) return;
    try {
      await appointmentAPI.cancel(confirmCancel);
      const res = await patientAPI.getAppointments(user.refID);
      setAppointments(res.data);
      showToast('Appointment cancelled.', 'info');
    } catch (err) {
      showToast('Failed to cancel appointment.', 'error');
    } finally {
      setConfirmCancel(null);
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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ConfirmModal
        isOpen={!!confirmCancel}
        title="Cancel appointment?"
        message="This action cannot be undone. The appointment will be marked as Cancelled."
        confirmLabel="Yes, cancel it"
        cancelLabel="Keep it"
        danger
        onConfirm={handleCancel}
        onCancel={() => setConfirmCancel(null)}
      />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white border-b px-6 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/patient')} className="text-sm text-gray-400 hover:text-gray-600">← Back</button>
          <span className="text-sm font-medium text-gray-800 flex-1">My Appointments</span>
          <button
            onClick={() => setShowBook(!showBook)}
            className="bg-blue-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Book appointment
          </button>
        </div>

        <div className="p-5">
          {/* Book form */}
          {showBook && (
            <div className="bg-white rounded-xl border p-5 mb-5">
              <div className="text-sm font-medium text-gray-800 mb-4">Book new appointment</div>
              {error && <div className="mb-3 p-2 bg-red-50 text-red-600 text-xs rounded-lg">{error}</div>}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Select doctor</label>
                  <select
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
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
                  <label className="block text-xs text-gray-500 mb-1">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Time slot</label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
                  >
                    <option value="">Pick a time...</option>
                    <option value="09:00">09:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">01:00 PM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Reason / notes <span className="text-gray-400">(optional)</span></label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Briefly describe your symptoms or reason for visit..."
                    rows={2}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleBook} className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700">
                  Confirm booking
                </button>
                <button onClick={() => { setShowBook(false); setError(''); setReason(''); setSelectedTime(''); }} className="bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-200">
                  Discard
                </button>
              </div>
            </div>
          )}

          {/* Appointments list */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="px-5 py-3 border-b bg-gray-50 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Appointments ({appointments.filter(a => filter === 'All' || a.Status === filter).length})
              </span>
              <div className="flex gap-1">
                {['All', 'Pending', 'Completed', 'Cancelled'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                      filter === f
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'text-gray-500 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            {appointments.length === 0 ? (
              <EmptyState
                icon="📅"
                title="No appointments yet"
                subtitle="Book your first appointment with one of our doctors."
                action={() => setShowBook(true)}
                actionLabel="+ Book appointment"
              />
            ) : (
              appointments.filter(a => filter === 'All' || a.Status === filter).map((appt, i) => (
                <AppointmentRow
                  key={appt.AppointmentID}
                  appt={appt}
                  i={i}
                  getStatusColor={getStatusColor}
                  onCancel={() => setConfirmCancel(appt.AppointmentID)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
