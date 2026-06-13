import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Register.css';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000';

const initialFormState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  avatarPreview: null,
};

function Register() {
  const [formData, setFormData] =
    useState(initialFormState);

  const [avatarFile, setAvatarFile] =
    useState(null);

  const [errors, setErrors] = useState(
    {}
  );

  let navigate = useNavigate();

  const [loading, setLoading] =
    useState(false);

  const [isDragActive, setIsDragActive] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (formData.avatarPreview) {
        URL.revokeObjectURL(
          formData.avatarPreview
        );
      }
    };
  }, [formData.avatarPreview]);

  const validateAvatar = (file) => {
    if (!file) {
      return '';
    }

    if (!file.type.startsWith('image/')) {
      return 'Only image files are allowed.';
    }

    if (file.size > 5 * 1024 * 1024) {
      return 'Avatar size must be less than 5MB.';
    }

    return '';
  };

  const setAvatar = (file) => {
    const avatarError =
      validateAvatar(file);

    if (avatarError) {
      setErrors((prev) => ({
        ...prev,
        avatar: avatarError,
      }));

      return;
    }

    setErrors((prev) => ({
      ...prev,
      avatar: '',
      submit: '',
    }));

    setAvatarFile(file);

    if (formData.avatarPreview) {
      URL.revokeObjectURL(
        formData.avatarPreview
      );
    }

    setFormData((prev) => ({
      ...prev,
      avatarPreview: file
        ? URL.createObjectURL(file)
        : null,
    }));
  };

  const removeAvatar = () => {
    if (formData.avatarPreview) {
      URL.revokeObjectURL(
        formData.avatarPreview
      );
    }

    setAvatarFile(null);

    setFormData((prev) => ({
      ...prev,
      avatarPreview: null,
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: '',
      submit: '',
    }));
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();

    setIsDragActive(false);

    const droppedFile =
      event.dataTransfer.files?.[0];

    if (droppedFile) {
      setAvatar(droppedFile);
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    const trimmedName =
      formData.name.trim();

    const trimmedEmail =
      formData.email.trim();

    if (!trimmedName) {
      nextErrors.name =
        'Name is required.';
    }

    if (!trimmedEmail) {
      nextErrors.email =
        'Email is required.';
    } else {
      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailRegex.test(trimmedEmail)
      ) {
        nextErrors.email =
          'Enter a valid email address.';
      }
    }

    if (!formData.password) {
      nextErrors.password =
        'Password is required.';
    } else if (
      formData.password.length < 6
    ) {
      nextErrors.password =
        'Password must be at least 6 characters.';
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword =
        'Confirm your password.';
    } else if (
      formData.confirmPassword !==
      formData.password
    ) {
      nextErrors.confirmPassword =
        'Passwords do not match.';
    }

    const avatarError =
      validateAvatar(avatarFile);

    if (avatarError) {
      nextErrors.avatar =
        avatarError;
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length ===
      0
    );
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const requestBody =
        new FormData();

      requestBody.append(
        'name',
        formData.name.trim()
      );

      requestBody.append(
        'email',
        formData.email.trim()
      );

      requestBody.append(
        'password',
        formData.password
      );

      if (avatarFile) {
        requestBody.append(
          'avatar',
          avatarFile
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/auth/register`,
        {
          method: 'POST',
          body: requestBody,
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
          'Failed to create account.'
        );
      }

      const responseT =
        await fetch(
          `${API_BASE_URL}/auth/verify-email`,
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify({
              email: formData.email.trim()
            }),
          }
        );

      const resultT =
        await responseT.json();

      if (!responseT.ok) {
        throw new Error(
          resultT.message ||
          'Failed to resend OTP.'
        );
      }


      navigate('/auth/verify-email', {
        state: {
          email: formData.email.trim(),
        },
      });
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit:
          error.message ||
          'Registration failed.',
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>Create Account</h1>

          <p>
            Join us today and verify
            your email in one step.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="register-form"
          noValidate
        >
          {errors.submit ? (
            <div
              className="error-message submit-error"
              aria-live="polite"
            >
              {errors.submit}
            </div>
          ) : null}

          <div className="form-group avatar-group">
            <label>
              Profile Picture
              (optional)
            </label>

            <div
              className={`avatar-upload-wrapper ${isDragActive
                ? 'drag-active'
                : ''
                }`}
              onClick={() =>
                fileInputRef.current?.click()
              }
              onDrop={handleDrop}
              onDragOver={
                handleDragOver
              }
              onDragLeave={
                handleDragLeave
              }
              role="button"
              tabIndex={0}
              aria-label="Upload avatar"
            >
              {formData.avatarPreview ? (
                <div className="avatar-preview">
                  <img
                    src={
                      formData.avatarPreview
                    }
                    alt="Avatar preview"
                  />

                  <button
                    type="button"
                    className="remove-avatar-btn"
                    onClick={(
                      event
                    ) => {
                      event.stopPropagation();
                      removeAvatar();
                    }}
                    disabled={loading}
                    aria-label="Remove avatar"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="avatar-placeholder">
                  <span className="avatar-icon">
                    📷
                  </span>

                  <p>
                    {isDragActive
                      ? 'Drop image here'
                      : 'Click or drag an image here'}
                  </p>

                  <small>
                    PNG/JPG up to 5MB
                  </small>
                </div>
              )}

              <input
                ref={fileInputRef}
                className="avatar-input"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setAvatar(
                    e.target
                      .files?.[0] ||
                    null
                  )
                }
                disabled={loading}
              />
            </div>

            {errors.avatar ? (
              <span className="error-message">
                {errors.avatar}
              </span>
            ) : null}
          </div>

          <div className="form-group">
            <label htmlFor="name">
              Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className={
                errors.name
                  ? 'input-error'
                  : ''
              }
              disabled={loading}
              aria-invalid={
                !!errors.name
              }
            />

            {errors.name ? (
              <span className="error-message">
                {errors.name}
              </span>
            ) : null}
          </div>

          <div className="form-group">
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={
                errors.email
                  ? 'input-error'
                  : ''
              }
              disabled={loading}
              aria-invalid={
                !!errors.email
              }
            />

            {errors.email ? (
              <span className="error-message">
                {errors.email}
              </span>
            ) : null}
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            <div className="password-input-wrapper">
              <input
                id="password"
                name="password"
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                value={
                  formData.password
                }
                onChange={
                  handleChange
                }
                className={
                  errors.password
                    ? 'input-error'
                    : ''
                }
                disabled={loading}
                aria-invalid={
                  !!errors.password
                }
              />

              <button
                type="button"
                className="toggle-password"
                onClick={() =>
                  setShowPassword(
                    (prev) =>
                      !prev
                  )
                }
                disabled={loading}
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

            {errors.password ? (
              <span className="error-message">
                {errors.password}
              </span>
            ) : null}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              Confirm Password
            </label>

            <div className="password-input-wrapper">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={
                  showConfirmPassword
                    ? 'text'
                    : 'password'
                }
                value={
                  formData.confirmPassword
                }
                onChange={
                  handleChange
                }
                className={
                  errors.confirmPassword
                    ? 'input-error'
                    : ''
                }
                disabled={loading}
                aria-invalid={
                  !!errors.confirmPassword
                }
              />

              <button
                type="button"
                className="toggle-password"
                onClick={() =>
                  setShowConfirmPassword(
                    (prev) =>
                      !prev
                  )
                }
                disabled={loading}
                aria-label={
                  showConfirmPassword
                    ? 'Hide confirm password'
                    : 'Show confirm password'
                }
              >
                {showConfirmPassword
                  ? '👁️'
                  : '👁️‍🗨️'}
              </button>
            </div>

            {errors.confirmPassword ? (
              <span className="error-message">
                {
                  errors.confirmPassword
                }
              </span>
            ) : null}
          </div>

          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            {loading
              ? 'Creating Account...'
              : 'Create Account'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Already have an account?{' '}
            <Link
              to="/login"
              className="login-link"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;