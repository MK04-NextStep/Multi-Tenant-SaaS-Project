import { useState } from 'react';
import {
  Link,
  useLocation,
} from 'react-router-dom';

import '../styles/Register.css';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000';

function VerifyEmail() {
  const location = useLocation();

  const email =
    location.state?.email || '';

  const [otp, setOtp] =
    useState('');

  const [status, setStatus] =
    useState('idle');

  const [message, setMessage] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [
    resendLoading,
    setResendLoading,
  ] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!otp || !email) {
      setStatus('error');
      setMessage(
        'Email and OTP are required.'
      );
      return;
    }

    try {
      setLoading(true);

      setStatus('loading');

      setMessage('Verifying OTP...');

      const response = await fetch(
        `${API_BASE_URL}/auth/verify-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            email,
            otp,
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
          'OTP verification failed.'
        );
      }

      setStatus('success');

      setMessage(
        result.message ||
        'Email verified successfully!'
      );
    } catch (err) {
      setStatus('error');

      setMessage(
        err.message ||
        'Verification failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP =
    async () => {
      try {
        setResendLoading(true);

        const response =
          await fetch(
            `${API_BASE_URL}/auth/verify-email`,
            {
              method: 'POST',
              headers: {
                'Content-Type':
                  'application/json',
              },
              body: JSON.stringify({
                email,
              }),
            }
          );
          console.log(response);

        const result =
          await response.json();

          console.log(result)
        if (!response.ok) {
          throw new Error(
            result.message ||
            'Failed to resend OTP.'
          );
        }

        setStatus('success');

        setMessage(
          result.message ||
          'OTP sent successfully.'
        );
      } catch (err) {
        setStatus('error');

        setMessage(
          err.message ||
          'Failed to resend OTP.'
        );
      } finally {
        setResendLoading(false);
      }
    };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>Email Verification</h1>

          <p>
            Enter the OTP sent to
            your email
          </p>
        </div>

        <div className="verification-container">
          <div className="verification-message">
            <span className="verification-icon">
              📩
            </span>

            <p className="verification-text">
              OTP sent to{' '}
              <strong>{email}</strong>
            </p>
          </div>

          <form
            onSubmit={handleVerify}
          >
            <div className="form-group">
              <label>
                Enter OTP
              </label>

              <input
                type="text"
                value={otp}
                onChange={(e) =>
                  setOtp(
                    e.target.value
                  )
                }
                placeholder="Enter 6 digit OTP"
                className="input-field"
                maxLength={6}
              />
            </div>

            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >
              {loading
                ? 'Verifying...'
                : 'Verify OTP'}
            </button>
          </form>

          <button
            type="button"
            className="resend-button"
            onClick={
              handleResendOTP
            }
            disabled={resendLoading}
          >
            {resendLoading
              ? 'Sending...'
              : 'Resend OTP'}
          </button>

          {message ? (
            <p
              className={`verification-text ${status}`}
            >
              {message}
            </p>
          ) : null}
        </div>

        <div className="register-footer">
          <p>
            Back to{' '}
            <Link
              to="/login"
              className="login-link"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;