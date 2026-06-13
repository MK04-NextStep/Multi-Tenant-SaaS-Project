import { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/Register.css';
import UserContext from '../context/UserContext';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';

function isVerificationRequiredMessage(message) {
  if (!message || typeof message !== 'string') {
    return false;
  }
  return message.toLowerCase().includes('verification needed');
}

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const {setMe} = useContext(UserContext);

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [ui, setUi] = useState({
    loading: false,
    errors: {},
    needsVerification: false,
    verificationSending: false,
    verificationSentMessage: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const updateUi = (updates) => {
    setUi((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const updateErrors = (updates) => {
    setUi((prev) => ({
      ...prev,
      errors: {
        ...prev.errors,
        ...updates,
      },
    }));
  };

  const handleEmailChange = (event) => {
    setForm((prev) => ({
      ...prev,
      email: event.target.value,
    }));

    updateUi({
      needsVerification: false,
      verificationSentMessage: '',
    });

    updateErrors({
      email: '',
      submit: '',
      verification: '',
    });
  };

  const handlePasswordChange = (event) => {
    setForm((prev) => ({
      ...prev,
      password: event.target.value,
    }));

    updateErrors({
      password: '',
      submit: '',
    });
  };

  const validate = () => {
    const nextErrors = {};

    const trimmedEmail = form.email.trim();

    if (!trimmedEmail) {
      nextErrors.email = 'Email is required.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(trimmedEmail)) {
        nextErrors.email = 'Enter a valid email address.';
      }
    }

    if (!form.password) {
      nextErrors.password = 'Password is required.';
    }

    updateUi({
      errors: nextErrors,
    });

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    updateErrors({
      submit: '',
      verification: '',
    });

    updateUi({
      verificationSentMessage: '',
    });

    if (!validate()) {
      return;
    }

    try {
      updateUi({
        loading: true,
      });

      const response = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            email: form.email.trim(),
            password: form.password,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        const failMessage =
          result.message || 'Login failed.';

        updateUi({
          needsVerification:
            isVerificationRequiredMessage(
              failMessage
            ),
        });

        throw new Error(failMessage);
      }

      updateUi({
        needsVerification: false,
      });

      if (result.accessToken) {
        localStorage.setItem(
          'accessToken',
          result.accessToken
        );
      }

      setForm((prev) => ({
        ...prev,
        password: '',
      }));

      const from =
        typeof location.state?.from === 'string'
          ? location.state.from
          : '';

      const target =
        from.startsWith('/')
          ? from
          : '/dashboard';

      setMe(result?.data)

      navigate(target, {
        replace: true,
      });
    } catch (error) {
      updateErrors({
        submit:
          error.message || 'Login failed.',
      });
    } finally {
      updateUi({
        loading: false,
      });
    }
  };

  const handleSendVerificationEmail =
    async () => {
      const trimmedEmail =
        form.email.trim();

      if (!trimmedEmail) {
        updateErrors({
          verification:
            'Enter your email above first.',
        });

        return;
      }

      try {
        updateUi({
          verificationSending: true,
          verificationSentMessage: '',
        });

        updateErrors({
          verification: '',
          submit: '',
        });

        const response = await fetch(
          `${API_BASE_URL}/auth/verify-email`,
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify({
              email: trimmedEmail,
            }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              'Could not send verification email.'
          );
        }

        updateUi({
          verificationSentMessage:
            result.message ||
            'Verification link sent.',
        });
      } catch (error) {
        updateErrors({
          verification:
            error.message ||
            'Could not send verification email.',
        });
      } finally {
        updateUi({
          verificationSending: false,
        });
      }
    };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>Sign in</h1>

          <p>
            Enter your email and password
            to access your account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="register-form"
          noValidate
        >
          {ui.errors.submit ? (
            <div
              className="error-message submit-error"
              aria-live="polite"
            >
              {ui.errors.submit}
            </div>
          ) : null}

          <div className="form-group">
            <label htmlFor="login-email">
              Email
            </label>

            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleEmailChange}
              className={
                ui.errors.email
                  ? 'input-error'
                  : ''
              }
              disabled={ui.loading}
              aria-invalid={
                !!ui.errors.email
              }
            />

            {ui.errors.email ? (
              <span className="error-message">
                {ui.errors.email}
              </span>
            ) : null}
          </div>

          <div className="form-group">
            <label htmlFor="login-password">
              Password
            </label>

            <div className="password-input-wrapper">
              <input
                id="login-password"
                name="password"
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                autoComplete="current-password"
                value={form.password}
                onChange={
                  handlePasswordChange
                }
                className={
                  ui.errors.password
                    ? 'input-error'
                    : ''
                }
                disabled={ui.loading}
                aria-invalid={
                  !!ui.errors.password
                }
              />

              <button
                type="button"
                className="toggle-password"
                onClick={() =>
                  setShowPassword(
                    (prev) => !prev
                  )
                }
                disabled={ui.loading}
                aria-label={
                  showPassword
                    ? 'Hide password'
                    : 'Show password'
                }
              >
                {showPassword
                  ? '👁️'
                  : '👁️‍🗨️'}
              </button>
            </div>

            {ui.errors.password ? (
              <span className="error-message">
                {ui.errors.password}
              </span>
            ) : null}
          </div>

          {ui.needsVerification ? (
            <div className="verification-container">
              <div className="verification-message">
                <span className="verification-icon">
                  📩
                </span>

                <p className="verification-text">
                  This account still needs
                  email verification before
                  you can sign in.
                </p>

                <p className="verification-instruction">
                  Open the link we sent
                  you, or request a new
                  one below.
                </p>
              </div>

              {ui.verificationSentMessage ? (
                <div className="success-message">
                  {
                    ui.verificationSentMessage
                  }
                </div>
              ) : null}

              {ui.errors.verification ? (
                <div className="error-message submit-error">
                  {
                    ui.errors.verification
                  }
                </div>
              ) : null}

              <button
                type="button"
                className="resend-button"
                onClick={
                  handleSendVerificationEmail
                }
                disabled={
                  ui.loading ||
                  ui.verificationSending ||
                  !form.email.trim()
                }
              >
                {ui.verificationSending
                  ? 'Sending...'
                  : 'Send verification link'}
              </button>
            </div>
          ) : null}

          <button
            type="submit"
            className="register-button"
            disabled={ui.loading}
          >
            {ui.loading
              ? 'Signing in...'
              : 'Sign in'}
          </button>
        </form>

        <div className="register-footer">
          <p >
            <Link
              to="/forgot-password"
              className="login-link"
            >
              Forgot password?
            </Link>
          </p>

          <p>
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="login-link"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;