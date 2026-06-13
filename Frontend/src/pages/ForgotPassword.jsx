import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Register.css';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000';

function ForgotPassword() {
  const [step, setStep] =
    useState(1);

  const [email, setEmail] =
    useState('');

  const [otp, setOtp] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('');

  const [errors, setErrors] =
    useState({});

  const [loading, setLoading] =
    useState(false);

  const [
    successMessage,
    setSuccessMessage,
  ] = useState('');

  const validateEmailStep = () => {
    const nextErrors = {};

    if (!email.trim()) {
      nextErrors.email =
        'Email is required.';
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors)
        .length === 0
    );
  };

  const validateResetStep = () => {
    const nextErrors = {};

    if (!otp.trim()) {
      nextErrors.otp =
        'OTP is required.';
    }

    if (!password) {
      nextErrors.password =
        'Password is required.';
    } else if (
      password.length < 6
    ) {
      nextErrors.password =
        'Password must be at least 6 characters.';
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword =
        'Confirm your password.';
    } else if (
      confirmPassword !== password
    ) {
      nextErrors.confirmPassword =
        'Passwords do not match.';
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors)
        .length === 0
    );
  };

  const handleSendOTP =
    async (event) => {
      event.preventDefault();

      setSuccessMessage('');

      if (!validateEmailStep()) {
        return;
      }

      try {
        setLoading(true);

        setErrors((prev) => ({
          ...prev,
          submit: '',
        }));

        const response =
          await fetch(
            `${API_BASE_URL}/auth/forgot-password`,
            {
              method: 'POST',
              headers: {
                'Content-Type':
                  'application/json',
              },
              body: JSON.stringify({
                email:
                  email.trim(),
              }),
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
            'Failed to send OTP.'
          );
        }

        setSuccessMessage(
          result.message ||
          'OTP sent successfully.'
        );

        setStep(2);
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          submit:
            error.message ||
            'Something went wrong.',
        }));
      } finally {
        setLoading(false);
      }
    };

  const handleResetPassword =
    async (event) => {
      event.preventDefault();

      setSuccessMessage('');

      if (!validateResetStep()) {
        return;
      }

      try {
        setLoading(true);

        setErrors((prev) => ({
          ...prev,
          submit: '',
        }));

        const response =
          await fetch(
            `${API_BASE_URL}/auth/reset-password`,
            {
              method: 'POST',
              headers: {
                'Content-Type':
                  'application/json',
              },
              body: JSON.stringify({
                email:
                  email.trim(),
                otp,
                password,
              }),
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
            'Failed to reset password.'
          );
        }

        setSuccessMessage(
          result.message ||
          'Password reset successful.'
        );

        setOtp('');
        setPassword('');
        setConfirmPassword('');
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          submit:
            error.message ||
            'Something went wrong.',
        }));
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>
            Forgot Password
          </h1>

          <p>
            {step === 1
              ? 'Enter your email to receive an OTP.'
              : 'Enter OTP and your new password.'}
          </p>
        </div>

        <form
          onSubmit={
            step === 1
              ? handleSendOTP
              : handleResetPassword
          }
          className="register-form"
          noValidate
        >
          {errors.submit ? (
            <div className="error-message submit-error">
              {errors.submit}
            </div>
          ) : null}

          {successMessage ? (
            <div className="success-message">
              {successMessage}
            </div>
          ) : null}

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(
                  event.target.value
                );

                setErrors(
                  (prev) => ({
                    ...prev,
                    email: '',
                    submit: '',
                  })
                );
              }}
              className={
                errors.email
                  ? 'input-error'
                  : ''
              }
              disabled={
                loading ||
                step === 2
              }
            />

            {errors.email ? (
              <span className="error-message">
                {errors.email}
              </span>
            ) : null}
          </div>

          {step === 2 ? (
            <>
              <div className="form-group">
                <label>
                  OTP
                </label>

                <input
                  type="text"
                  value={otp}
                  onChange={(
                    event
                  ) => {
                    setOtp(
                      event.target
                        .value
                    );

                    setErrors(
                      (
                        prev
                      ) => ({
                        ...prev,
                        otp: '',
                      })
                    );
                  }}
                  maxLength={6}
                  className={
                    errors.otp
                      ? 'input-error'
                      : ''
                  }
                />

                {errors.otp ? (
                  <span className="error-message">
                    {errors.otp}
                  </span>
                ) : null}
              </div>

              <div className="form-group">
                <label>
                  New Password
                </label>

                <input
                  type="password"
                  value={
                    password
                  }
                  onChange={(
                    event
                  ) => {
                    setPassword(
                      event.target
                        .value
                    );

                    setErrors(
                      (
                        prev
                      ) => ({
                        ...prev,
                        password:
                          '',
                      })
                    );
                  }}
                  className={
                    errors.password
                      ? 'input-error'
                      : ''
                  }
                />

                {errors.password ? (
                  <span className="error-message">
                    {
                      errors.password
                    }
                  </span>
                ) : null}
              </div>

              <div className="form-group">
                <label>
                  Confirm Password
                </label>

                <input
                  type="password"
                  value={
                    confirmPassword
                  }
                  onChange={(
                    event
                  ) => {
                    setConfirmPassword(
                      event.target
                        .value
                    );

                    setErrors(
                      (
                        prev
                      ) => ({
                        ...prev,
                        confirmPassword:
                          '',
                      })
                    );
                  }}
                  className={
                    errors.confirmPassword
                      ? 'input-error'
                      : ''
                  }
                />

                {errors.confirmPassword ? (
                  <span className="error-message">
                    {
                      errors.confirmPassword
                    }
                  </span>
                ) : null}
              </div>
            </>
          ) : null}

          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            {loading
              ? step === 1
                ? 'Sending OTP...'
                : 'Resetting Password...'
              : step === 1
                ? 'Send OTP'
                : 'Reset Password'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            <Link
              to="/login"
              className="login-link"
            >
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;