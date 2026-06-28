import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { doctorAPI } from '../services/api';

const STATUS_COLOR = {
  Completed: 'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Cancelled: 'bg-red-100 text-red-700',
  Confirmed: 'bg-blue-100 text-blue-700',
};

const DoctorSchedule = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!user.refID) { setLoading(false); return; }
    Promise.all([
      doctorAPI.getAppointments(user.refID),
      doctorAPI.getSchedule(user.refID),
    ])
      .then(([apptRes, schedRes]) => {
        setAppointments(apptRes.data);
        setSchedule(schedRes.data);
      })
      .catch((err) => console.error('DoctorSchedule fetch error:', err.response?.data || err.message))
      .finally(() => setLoading(false));
  }, [user.refID]);

  const updateStatus = async (appointmentID, status) => {
    try {
      await doctorAPI.updateAppointmentStatus(appointmentID, { status });
      setAppointments((prev) =>
        prev.map((a) => (a.AppointmentID === appointmentID ? { ...a, Status: status } : a))
      );
      setSuccessMsg(`Appointment marked as ${status}`);
      setTimeout(() => setSuccessMsg(''), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const statuses = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'];
  const filtered =
    filterStatus === 'All' ? appointments : appointments.filter((a) => a.Status === filterStatus);

  const groupByDay = () => {
    const groups = {};
    filtered.forEach((appt) => {
      const d = new Date(appt.AppointmentDate);
      const key = d.toDateString();
      if (!groups[key]) groups[key] = [];
      groups[key].push(appt);
    });
    return Object.entries(groups).sort((a, b) => new Date(a[0]) - new Date(b[0]));
  };

  const today = new Date().toDateString();

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
          <button onClick={() => navigate('/doctor')} className="text-sm text-gray-400 hover:text-gray-600">
            ← Back
          </button>
          <span className="text-sm font-medium text-gray-800 flex-1">My Schedule</span>
          <span className="text-xs text-gray-400">{appointments.length} total appointments</span>
        </div>

        <div className="p-5">
          {successMsg && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
              {successMsg}
            </div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3 mb-5">
            {['All', 'Pending', 'Completed', 'Cancelled'].map((s) => {
              const count = s === 'All' ? appointments.length : appointments.filter((a) => a.Status === s).length;
              const colors = {
                All: 'text-blue-600',
                Pending: 'text-yellow-600',
                Completed: 'text-green-600',
                Cancelled: 'text-red-500',
              };
              return (
                <div key={s} className="bg-white rounded-xl border p-4">
                  <div className="text-xs text-gray-500 mb-1">{s}</div>
                  <div className={`text-2xl font-semibold ${colors[s]}`}>{count}</div>
                </div>
              );
            })}
          </div>

          {/* Schedule table from DB */}
          {schedule.length > 0 && (
            <div className="bg-white rounded-xl border mb-5 overflow-hidden">
              <div className="px-4 py-3 border-b bg-gray-50 text-sm font-medium text-gray-700">
                Working Schedule
              </div>
              <div className="flex flex-wrap gap-0">
                {schedule.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0 w-full sm:w-1/2">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-xs font-medium text-blue-700">
                      {s.Day?.slice(0, 3)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">
                        {s.StartTime} – {s.EndTime}
                      </div>
                      <div className="text-xs text-gray-400">
                        {s.HospitalName || 'Main clinic'}{s.RoomNumber ? ` · Room ${s.RoomNumber}` : ''}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filter tabs */}
          <div className="flex gap-2 mb-4">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterStatus === s
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border text-gray-500 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Appointments grouped by day */}
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl border p-8 text-center text-sm text-gray-400">
              No appointments found
            </div>
          ) : (
            groupByDay().map(([day, appts]) => (
              <div key={day} className="mb-4">
                <div className={`text-xs font-semibold mb-2 px-1 ${day === today ? 'text-blue-600' : 'text-gray-500'}`}>
                  {day === today ? '📅 Today' : day}
                </div>
                <div className="bg-white rounded-xl border overflow-hidden">
                  {appts.map((appt, i) => (
                    <div
                      key={appt.AppointmentID}
                      className={`flex items-center gap-4 px-4 py-3 border-b last:border-b-0 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-800">{appt.PatientName}</div>
                        <div className="text-xs text-gray-400">
                          {appt.SymptomInput || 'No symptoms reported'} · {appt.Gender}, {appt.Age}y
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(appt.AppointmentDate).toLocaleDateString()}
                        {appt.AppointmentTime && <span className="ml-1 text-blue-500">{appt.AppointmentTime}</span>}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[appt.Status] || 'bg-gray-100 text-gray-500'}`}>
                        {appt.Status}
                      </span>
                      {appt.Status === 'Pending' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => updateStatus(appt.AppointmentID, 'Completed')}
                            className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded hover:bg-green-100"
                          >
                            ✓ Done
                          </button>
                          <button
                            onClick={() => updateStatus(appt.AppointmentID, 'Cancelled')}
                            className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorSchedule;
