import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const SignUp = () => {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleStep1 = (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setStep(2);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authAPI.register({
        fullName,
        email,
        password,
        role: 'Patient',
        age: age ? parseInt(age) : null,
        gender: gender || null,
        phone: phone || null,
      });
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">H</span>
        </div>
        <div>
          <div className="font-semibold text-gray-800">Healytics</div>
          <div className="text-xs text-gray-500">Secure Healthcare Intelligence Platform</div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border w-full max-w-md p-8">

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>1</div>
            <div className={`flex-1 h-0.5 ${step >= 2 ? 'bg-blue-400' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>2</div>
          </div>

          {success ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
              <div className="text-base font-semibold text-gray-800 mb-1">Account created!</div>
              <div className="text-sm text-gray-500">{success}</div>
            </div>
          ) : step === 1 ? (
            <>
              <h1 className="text-xl font-semibold text-gray-800 mb-1">Create an account</h1>
              <p className="text-sm text-gray-500 mb-6">Step 1 — Account credentials</p>

              <form onSubmit={handleStep1}>
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="w-full border rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-blue-400"
                      required
                    />
                    <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword
                        ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      }
                    </button>
                  </div>
                </div>
                <div className="mb-2">
                  <label className="block text-sm text-gray-600 mb-2">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Re-enter your password"
                      className="w-full border rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-blue-400"
                      required
                    />
                    <button type="button" tabIndex={-1} onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirm
                        ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      }
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
                )}

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-medium mt-4 transition-colors"
                >
                  Continue →
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-gray-800 mb-1">Your health profile</h1>
              <p className="text-sm text-gray-500 mb-6">Step 2 — Basic info <span className="text-gray-400">(all optional)</span></p>

              <form onSubmit={handleSignUp}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Age</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g. 30"
                      min="1"
                      max="120"
                      className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 bg-white"
                    >
                      <option value="">Select...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm text-gray-600 mb-2">Phone number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +966 5XX XXX XXXX"
                    className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
                  />
                </div>

                {error && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-3 rounded-xl text-sm font-medium transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-2 flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create account'}
                  </button>
                </div>
              </form>
            </>
          )}

          {!success && (
            <div className="mt-5 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <button onClick={() => navigate('/login')} className="text-blue-600 hover:underline font-medium">
                Sign in
              </button>
            </div>
          )}

          <div className="mt-3 text-center text-xs text-gray-400">
            Secured with end-to-end encryption · Healytics v1.0
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
