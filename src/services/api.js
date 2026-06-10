import axios from 'axios';

const API_URL = 'https://healytics-backend-production.up.railway.app/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: (logID, durationMin) => api.post('/auth/logout', { logID, durationMin }),
};

export const patientAPI = {
  getAll: () => api.get('/patients'),
  getById: (id) => api.get(`/patients/${id}`),
  getMedicalFile: (id) => api.get(`/patients/${id}/medical-file`),
  getAppointments: (id) => api.get(`/patients/${id}/appointments`),
  bookAppointment: (data) => api.post('/patients/book', data),
  updateProfile: (id, data) => api.put(`/patients/${id}`, data),
};

export const doctorAPI = {
  getAll: () => api.get('/doctors'),
  getById: (id) => api.get(`/doctors/${id}`),
  getSchedule: (id) => api.get(`/doctors/${id}/schedule`),
  getAppointments: (id) => api.get(`/doctors/${id}/appointments`),
  updateAppointmentStatus: (appointmentID, data) => api.put(`/doctors/appointments/${appointmentID}/status`, data),
  addMedicalRecord: (data) => api.post('/doctors/medical-record', data),
  updateAvailability: (id, availability) => api.put(`/doctors/${id}/availability`, { availability }),
};

export const appointmentAPI = {
  getAll: () => api.get('/appointments'),
  getById: (id) => api.get(`/appointments/${id}`),
  getByStatus: (status) => api.get(`/appointments/status/${status}`),
  cancel: (id) => api.put(`/appointments/${id}/cancel`),
};

export const hospitalAPI = {
  getAll: () => api.get('/hospitals'),
  getById: (id) => api.get(`/hospitals/${id}`),
  getBySpecialty: (specialty) => api.get(`/hospitals/specialty/${specialty}`),
};

export const pharmacyAPI = {
  getAll: () => api.get('/pharmacies'),
  getOpen: () => api.get('/pharmacies/open'),
  getById: (id) => api.get(`/pharmacies/${id}`),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getDoctors: () => api.get('/admin/doctors'),
  getPatients: () => api.get('/admin/patients'),
  getLogs: () => api.get('/admin/logs'),
  getActions: () => api.get('/admin/actions'),
  getContact: () => api.get('/admin/contact'),
  updateDoctorAvailability: (id, data) => api.put(`/admin/doctors/${id}/availability`, data),
};

export const medicalAPI = {
  getAll: () => api.get('/medical'),
  getById: (id) => api.get(`/medical/${id}`),
  getByPatient: (patientID) => api.get(`/medical/patient/${patientID}`),
};

export const prescriptionAPI = {
  getAll: () => api.get('/prescriptions'),
  getByPatient: (patientID) => api.get(`/prescriptions/patient/${patientID}`),
  getActive: () => api.get('/prescriptions/active'),
  add: (data) => api.post('/prescriptions', data),
};

export const chatAPI = {
  send: (messages) => api.post('/chat', { messages }),
};

export const messagesAPI = {
  // Admin
  getAll: (role, direction) => api.get('/messages', { params: { role, direction } }),
  getUnreadCount: () => api.get('/messages/unread'),
  markRead: (id) => api.put(`/messages/${id}`, {}),
  reply: (id, replyBody) => api.put(`/messages/${id}`, { replyBody }),
  sendAsAdmin: (recipientID, recipientName, subject, body) => api.post('/messages/admin/send', { recipientID, recipientName, subject, body }),
  // Patient / Doctor
  send: (subject, body) => api.post('/messages', { subject, body }),
  getMine: () => api.get('/messages/mine'),
  getNewReplies: () => api.get('/messages/new-replies'),
  markSeen: (id) => api.put(`/messages/${id}/seen`),
};

export default api;