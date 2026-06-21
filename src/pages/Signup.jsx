import { useState, useContext } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/axios';
import safetyManagement from '../assets/safety management.webp';
import RoleSelectCards from '../components/RoleSelectCards';
import { ROLES } from '../utils/roles';
import AuthShell, { AuthAlert, AuthDivider } from '../components/auth/AuthShell';
import GoogleAuthBlock from '../components/auth/GoogleAuthBlock';
import { User, Mail, Lock, KeyRound, Loader2, CheckCircle2 } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: ROLES.WORKER,
    agreed: false,
    otp: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [otpSent, setOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [userExists, setUserExists] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required.';
    if (!formData.email.match(/^\S+@\S+\.\S+$/)) newErrors.email = 'Invalid email format.';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters.';
    else if (!/[A-Z]/.test(formData.password)) newErrors.password = 'Must include an uppercase letter.';
    else if (!/[!@#$%^&*]/.test(formData.password)) newErrors.password = 'Must include a special character.';
    if (!formData.role) newErrors.role = 'Please select a role.';
    if (!formData.agreed) newErrors.agreed = 'You must agree to the terms.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const showMsg = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    showMsg('');
    try {
      await api.post('/auth/signup', formData);
      setOtpSent(true);
      showMsg('Account created! Enter the OTP we sent to your email.', 'success');
    } catch (e) {
      const msg = e.response?.data?.message;
      if (msg === 'Email already exists') {
        setUserExists(true);
        showMsg('This email is already registered.', 'error');
      } else {
        showMsg(msg || 'Server error. Please try again later.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async () => {
    if (!formData.otp.trim()) {
      setErrors({ ...errors, otp: 'OTP is required.' });
      return;
    }

    setOtpLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', {
        email: formData.email,
        otp: formData.otp,
      });
      setIsVerified(true);
      showMsg(data.message || 'Email verified — welcome aboard!', 'success');
      if (data.token) {
        login(
          data.user || { email: formData.email, role: data.role, name: formData.name },
          data.token
        );
        navigate('/', { replace: true });
      }
    } catch (e) {
      showMsg(e.response?.data?.error || e.response?.data?.message || 'Invalid OTP. Try again.', 'error');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleGoogleSignup = async (response) => {
    if (!response?.credential) {
      showMsg('Google sign-in failed. Please try again.', 'error');
      return;
    }
    if (!formData.role) {
      showMsg('Select your role before continuing with Google.', 'error');
      return;
    }

    setLoading(true);
    showMsg('');
    try {
      const { data } = await api.post('/auth/google', {
        token: response.credential,
        role: formData.role,
      });

      if (!data?.token) {
        throw new Error(data?.message || 'No token received');
      }

      login(
        data.user || { email: formData.email, role: data.role || formData.role, name: formData.name || 'User' },
        data.token
      );
      navigate('/', { replace: true });
    } catch (e) {
      showMsg(e.response?.data?.message || e.message || 'Google signup failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const step = isVerified ? 3 : otpSent ? 2 : 1;

  return (
    <AuthShell
      title="Create your account"
      subtitle="Pick your role, then register with Google or email. Admin roles are assigned by your organization."
      heroTitle={'Join the crew\non Mine Manager'}
      heroImage={safetyManagement}
      heroImageAlt="Mine safety management"
      footer={
        <>
          Already registered? <Link to="/login">Sign in</Link>
        </>
      }
    >
      <div className="flex gap-2 mb-6">
        {[
          { n: 1, label: 'Role' },
          { n: 2, label: 'Verify' },
          { n: 3, label: 'Done' },
        ].map(({ n, label }) => (
          <div
            key={n}
            className={`flex-1 rounded-lg py-2 px-2 text-center text-xs font-medium border transition-colors ${
              step >= n
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                : 'border-slate-700 text-slate-500'
            }`}
          >
            {step > n ? (
              <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
            ) : null}
            {label}
          </div>
        ))}
      </div>

      <AuthAlert type={messageType === 'error' ? 'error' : messageType === 'info' ? 'info' : 'success'}>
        {message}
      </AuthAlert>

      <div className="mb-5">
        <RoleSelectCards value={formData.role} onChange={(role) => setFormData((f) => ({ ...f, role }))} />
        {errors.role && <p className="text-red-400 text-xs mt-2">{errors.role}</p>}
      </div>

      <GoogleAuthBlock hint="Uses the role selected above">
        {(width) =>
          width > 0 ? (
            <GoogleLogin
              onSuccess={handleGoogleSignup}
              onError={() => showMsg('Google sign-in failed.', 'error')}
              theme="filled_black"
              size="large"
              text="signup_with"
              width={width}
            />
          ) : (
            <div className="h-11 w-full rounded-lg bg-slate-700/50 animate-pulse" aria-hidden />
          )
        }
      </GoogleAuthBlock>

      <AuthDivider label="or register with email" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="auth-field">
          <label htmlFor="name" className="auth-label">
            Full name
          </label>
          <div className="auth-input-wrap">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Rajesh Kumar"
              className="auth-input !pl-10"
              required
            />
          </div>
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
        </div>

        <div className="auth-field">
          <label htmlFor="signup-email" className="auth-label">
            Email
          </label>
          <div className="auth-input-wrap">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              id="signup-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@company.com"
              className="auth-input !pl-10"
              required
            />
          </div>
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
        </div>

        <div className="auth-field">
          <label htmlFor="signup-password" className="auth-label">
            Password
          </label>
          <div className="auth-input-wrap">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="8+ chars, uppercase & symbol"
              className="auth-input !pl-10 !pr-14"
              required
            />
            <button
              type="button"
              className="auth-input-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
        </div>

        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            name="agreed"
            checked={formData.agreed}
            onChange={handleChange}
            className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500/30"
          />
          <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
            I agree to the Terms of Service and Privacy Policy
          </span>
        </label>
        {errors.agreed && <p className="text-red-400 text-xs -mt-2">{errors.agreed}</p>}

        <button type="submit" disabled={loading || otpSent} className="auth-btn-primary">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Processing…
            </>
          ) : (
            'Register & send OTP'
          )}
        </button>
      </form>

      {userExists && (
        <button type="button" onClick={() => navigate('/login')} className="auth-btn-secondary mt-3">
          Sign in instead
        </button>
      )}

      {otpSent && !isVerified && (
        <div className="mt-6 pt-6 border-t border-slate-800 space-y-4">
          <span className="auth-otp-badge">
            <KeyRound className="w-3.5 h-3.5" /> Step 2 — verify email
          </span>
          <div className="auth-field">
            <label htmlFor="otp" className="auth-label">
              OTP code
            </label>
            <input
              id="otp"
              type="text"
              name="otp"
              inputMode="numeric"
              value={formData.otp}
              onChange={handleChange}
              placeholder="6-digit code"
              className="auth-input"
              required
            />
            {errors.otp && <p className="text-red-400 text-xs mt-1">{errors.otp}</p>}
          </div>
          <button
            type="button"
            onClick={handleOtpVerification}
            disabled={otpLoading}
            className="auth-btn-primary"
          >
            {otpLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Verifying…
              </>
            ) : (
              'Verify & go to dashboard'
            )}
          </button>
        </div>
      )}
    </AuthShell>
  );
};

export default Signup;
