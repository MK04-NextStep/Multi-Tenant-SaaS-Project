import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../styles/Register.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function meetsStrongPassword(value) {
  if (!value || value.length < 8) {
    return false;
  }
  const lower = /[a-z]/;
  const upper = /[A-Z]/;
  const num = /[0-9]/;
  const sym = /[^A-Za-z0-9]/;
  return lower.test(value) && upper.test(value) && num.test(value) && sym.test(value);
}

function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validate = () => {
    const nextErrors = {};

    if (!token) {
      nextErrors.submit = 'Invalid reset link.';
    }

    if (!password) {
      nextErrors.password = 'Password is required.';
    } else if (!meetsStrongPassword(password)) {
      nextErrors.password =
        'Password must be at least 8 characters with uppercase, lowercase, number, and symbol.';
    }

    if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage('');

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      setErrors((prev) => ({ ...prev, submit: '' }));

      const response = await fetch(`${API_BASE_URL}/auth/reset-password/${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Could not reset password.');
      }

      setSuccessMessage(result.message || 'Password reset Successfully. Please login');

      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      setErrors((prev) => ({ ...prev, submit: error.message || 'Something went wrong.' }));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <h1>Reset password</h1>
            <p>This reset link is missing or invalid.</p>
          </div>
          <div className="register-footer">
            <p>
              <Link to="/forgot-password" className="login-link">Request a new link</Link>
              {' · '}
              <Link to="/login" className="login-link">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>Reset password</h1>
          <p>
            Choose a new password — at least 8 characters with uppercase, lowercase, number, and symbol.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="register-form" noValidate>
          {errors.submit ? <div className="error-message submit-error">{errors.submit}</div> : null}
          {successMessage ? <div className="success-message">{successMessage}</div> : null}

          <div className="form-group">
            <label htmlFor="reset-password">New password</label>
            <div className="password-input-wrapper">
              <input
                id="reset-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setErrors((prev) => ({ ...prev, password: '', submit: '' }));
                }}
                className={errors.password ? 'input-error' : ''}
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={loading}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password ? <span className="error-message">{errors.password}</span> : null}
          </div>

          <div className="form-group">
            <label htmlFor="reset-confirm">Confirm password</label>
            <div className="password-input-wrapper">
              <input
                id="reset-confirm"
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  setErrors((prev) => ({ ...prev, confirmPassword: '', submit: '' }));
                }}
                className={errors.confirmPassword ? 'input-error' : ''}
                disabled={loading}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirm((prev) => !prev)}
                disabled={loading}
              >
                {showConfirm ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.confirmPassword ? (
              <span className="error-message">{errors.confirmPassword}</span>
            ) : null}
          </div>

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Remembered your password? <Link to="/login" className="login-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
