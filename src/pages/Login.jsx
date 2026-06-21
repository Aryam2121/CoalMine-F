import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import loginImage from '../assets/login.png';
import { GoogleLogin } from '@react-oauth/google';
import api from '../services/axios';
import RoleSelectCards from '../components/RoleSelectCards';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { ROLES } from '../utils/roles';
import AuthShell, { AuthAlert, AuthDivider } from '../components/auth/AuthShell';
import GoogleAuthBlock from '../components/auth/GoogleAuthBlock';
import { Mail, Lock, KeyRound, Loader2 } from 'lucide-react';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [googleRoleModal, setGoogleRoleModal] = useState(false);
  const [pendingGoogleToken, setPendingGoogleToken] = useState(null);
  const [googleRole, setGoogleRole] = useState(ROLES.WORKER);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const sendOtp = async (emailAddress) => {
    if (!emailAddress?.trim()) {
      setError('Enter your email before requesting an OTP.');
      return;
    }
    setLoading(true);
    setError('');
    setInfo('');
    try {
      await api.post('/auth/send-otp', { email: emailAddress.trim() });
      setOtpSent(true);
      setInfo('OTP sent — check your inbox and enter the code below.');
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  const completeLogin = (data, fallbackEmail) => {
    if (!data?.token) {
      throw new Error(data?.message || 'Token is missing in response');
    }
    const userEmail = data.user?.email || fallbackEmail;
    const userData = data.user || {
      _id: data.userId,
      email: userEmail,
      role: data.role || 'worker',
      name: data.name || userEmail?.split('@')[0] || 'User',
    };
    login(userData, data.token);
    navigate('/', { replace: true });
  };

  const handleLogin = async (values, mode = 'password') => {
    setLoading(true);
    setError('');
    setInfo('');
    try {
      let data;

      if (mode === 'google') {
        if (!values?.token) {
          throw new Error('Google sign-in did not return a token. Please try again.');
        }
        const res = await api.post('/auth/google', {
          token: values.token,
          role: values.role,
        });
        data = res.data;
      } else if (mode === 'otp') {
        const res = await api.post('/auth/verify-otp', {
          email: values.email || email,
          otp,
        });
        data = res.data;
      } else {
        try {
          const res = await api.post('/auth/login', {
            email: values.email || email,
            password: values.password || password,
          });
          data = res.data;
        } catch (e) {
          const msg = e.response?.data?.message;
          if (msg === 'Invalid password') {
            setOtpSent(true);
            setInfo('Password incorrect. Use “Resend OTP” or “Sign in with OTP instead” to get a code by email.');
            return;
          }
          throw new Error(msg || e.message || 'Login failed');
        }
      }

      completeLogin(data, values?.email || email);
    } catch (e) {
      if (e.response?.data?.needsRole && mode === 'google') {
        setPendingGoogleToken(values.token);
        setGoogleRoleModal(true);
        setError('');
        return;
      }
      const msg =
        e.response?.data?.message ||
        e.response?.data?.error ||
        e.message ||
        'Something went wrong';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = (credentialResponse) => {
    const idToken = credentialResponse?.credential;
    if (!idToken) {
      setError('Google sign-in failed. Please try again.');
      return;
    }
    handleLogin({ token: idToken }, 'google');
  };

  const confirmGoogleRole = () => {
    if (!pendingGoogleToken) return;
    setGoogleRoleModal(false);
    handleLogin({ token: pendingGoogleToken, role: googleRole }, 'google');
    setPendingGoogleToken(null);
  };

  return (
    <>
      <AuthShell
        title="Welcome back"
        subtitle="Sign in to your mine safety dashboard. Your role controls what you can access."
        heroImage={loginImage}
        heroImageAlt="Coal mine safety operations"
        footer={
          <>
            New here?{' '}
            <Link to="/signup">Create an account</Link>
          </>
        }
      >
        <AuthAlert type="error">{error}</AuthAlert>
        <AuthAlert type="success">{info}</AuthAlert>

        <GoogleAuthBlock hint="First time with Google? You'll choose your role.">
          {(width) =>
            width > 0 ? (
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google sign-in failed. Please try again.')}
                shape="rectangular"
                theme="filled_black"
                text="signin_with"
                size="large"
                width={width}
              />
            ) : (
              <div className="h-11 w-full rounded-lg bg-slate-700/50 animate-pulse" aria-hidden />
            )
          }
        </GoogleAuthBlock>

        <AuthDivider label="or sign in with email" />

        {otpSent && (
          <span className="auth-otp-badge">
            <KeyRound className="w-3.5 h-3.5" /> OTP mode — check your email
          </span>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin({ email, password }, otpSent ? 'otp' : 'password');
          }}
          className="space-y-4"
        >
          <div className="auth-field">
            <label htmlFor="email" className="auth-label">
              Email
            </label>
            <div className="auth-input-wrap">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input !pl-10"
                placeholder="you@company.com"
                autoComplete="email"
              />
            </div>
          </div>

          {!otpSent && (
            <div className="auth-field">
              <label htmlFor="password" className="auth-label">
                Password
              </label>
              <div className="auth-input-wrap">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="auth-input !pl-10 !pr-14"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-input-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          )}

          {otpSent && (
            <div className="auth-field">
              <label htmlFor="otp" className="auth-label">
                One-time password
              </label>
              <div className="auth-input-wrap">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="auth-input !pl-10"
                  placeholder="6-digit code from email"
                  autoComplete="one-time-code"
                />
              </div>
            </div>
          )}

          <button type="submit" className="auth-btn-primary" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Please wait…
              </>
            ) : otpSent ? (
              'Verify OTP & sign in'
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <button
          type="button"
          onClick={() => sendOtp(email)}
          className="auth-btn-secondary mt-3"
          disabled={loading}
        >
          {otpSent ? 'Resend OTP' : 'Sign in with OTP instead'}
        </button>

        {otpSent && (
          <button
            type="button"
            className="auth-btn-ghost"
            onClick={() => {
              setOtpSent(false);
              setOtp('');
              setInfo('');
            }}
          >
            Back to password sign-in
          </button>
        )}
      </AuthShell>

      <Modal
        open={googleRoleModal}
        onClose={() => {
          setGoogleRoleModal(false);
          setPendingGoogleToken(null);
        }}
        title="Choose your role"
      >
        <p className="text-sm text-slate-500 mb-4">
          First time with Google? Select how you will use the mine safety platform.
        </p>
        <RoleSelectCards value={googleRole} onChange={setGoogleRole} />
        <div className="mt-6 flex gap-2 justify-end">
          <Button variant="secondary" onClick={() => setGoogleRoleModal(false)}>
            Cancel
          </Button>
          <Button onClick={confirmGoogleRole} disabled={loading}>
            Continue
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default Login;
