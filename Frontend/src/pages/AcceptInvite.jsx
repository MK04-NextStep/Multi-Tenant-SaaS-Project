// AcceptInvite.jsx

import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { authorizedFetch } from "../lib/api";
import "../styles/acceptInvite.css";

function AcceptInvite() {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  let location = useLocation();
  let entity = location?.state?.entity.toLowerCase()

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await authorizedFetch(
        `/${entity}/accept-invite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ token })
        }
      );

      const body = await response.json();

      if (!response.ok) {
        throw new Error(
          body.message ||
          "Failed to accept invitation."
        );
      }

      setSuccess("Invitation accepted successfully.");

      setTimeout(() => {
        navigate(-1);
      }, 1500);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="invite-page">
      <div className="invite-card">
        <div className="invite-header">
          <h1>Accept Invitation</h1>

          <p>
            Enter the invitation token you
            received by email.
          </p>
        </div>

        {error && (
          <div className="invite-error">
            {error}
          </div>
        )}

        {success && (
          <div className="invite-success">
            {success}
          </div>
        )}

        <form
          className="invite-form"
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <label>
              Invitation Token
            </label>

            <input
              type="text"
              value={token}
              onChange={(e) =>
                setToken(e.target.value)
              }
              placeholder="Enter token"
            />
          </div>

          <div className="invite-actions">
            <button
              type="submit"
              className="invite-submit"
              disabled={loading}
            >
              {loading
                ? "Accepting..."
                : "Accept Invitation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AcceptInvite;