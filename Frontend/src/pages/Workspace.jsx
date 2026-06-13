import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authorizedFetch } from '../lib/api';
import '../styles/Workspace.css';

function Workspace() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [type, setType] = useState('PERSONAL');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const nextErrors = {};

    if (!name.trim()) {
      nextErrors.name = 'Workspace name is required.';
    }

    if (!type) {
      nextErrors.type = 'Workspace type is required.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError('');
    setSuccessMessage('');

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      const response = await authorizedFetch('/workspace', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          type,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Could not create workspace.');
      }

      setSuccessMessage('Workspace created successfully. Redirecting to dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 600);
    } catch (error) {
      setServerError(error.message || 'Could not create workspace.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="workspace-page">
      <div className="workspace-card">
        <div className="workspace-header">
          <h1>Create a workspace</h1>
          <p>Use the form below to add a new workspace.</p>
        </div>

        <form className="workspace-form" onSubmit={handleSubmit} noValidate>
          {serverError ? <div className="workspace-error">{serverError}</div> : null}
          {successMessage ? <div className="workspace-success">{successMessage}</div> : null}

          <div className="form-group">
            <label htmlFor="workspace-name">Workspace name</label>
            <input
              id="workspace-name"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setErrors((prev) => ({ ...prev, name: '' }));
              }}
              placeholder="Enter workspace name"
              className={errors.name ? 'input-error' : ''}
              disabled={loading}
            />
            {errors.name ? <p className="error-message">{errors.name}</p> : null}
          </div>

          <div className="form-group">
            <label htmlFor="workspace-type">Workspace type</label>
            <select
              id="workspace-type"
              value={type}
              onChange={(event) => {
                setType(event.target.value);
                setErrors((prev) => ({ ...prev, type: '' }));
              }}
              disabled={loading}
              className={errors.type ? 'input-error' : ''}
            >
              <option value="PERSONAL">Personal</option>
              <option value="TEAM">Team</option>
            </select>
            {errors.type ? <p className="error-message">{errors.type}</p> : null}
          </div>

          <div className="workspace-actions">
            <button type="submit" className="workspace-submit" disabled={loading}>
              {loading ? 'Creating…' : 'Create workspace'}
            </button>
            <Link to="/dashboard" className="workspace-cancel">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Workspace;
