import React from 'react'
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { authorizedFetch, getAccessToken } from '../lib/api';
import '../styles/Dashboard.css';
import { useNavigate } from 'react-router-dom';

function UserSearch() {
    const [query, setQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [hits, setHits] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [detailLoading, setDetailLoading] = useState(false);
    const [detail, setDetail] = useState(null);
    const [detailError, setDetailError] = useState('');

    const runSearch = useCallback(async (qRaw) => {
        const q = qRaw.trim();
        if (!getAccessToken() || q.length < 2) {
            setHits([]);
            return;
        }
        try {
            setSearching(true);
            setSearchError('');
            const res = await authorizedFetch(`/users/search?q=${encodeURIComponent(q)}`);
            const body = await res.json();

            if (!res.ok) {
                throw new Error(body.message || 'Search failed.');
            }

            setHits(Array.isArray(body.data) ? body.data : []);
        } catch (e) {
            setSearchError(e.message || 'Search failed.');
            setHits([]);
        } finally {
            setSearching(false);
        }
    }, []);

    useEffect(() => {
        const t = setTimeout(() => {
            runSearch(query);
        }, 320);

        return () => clearTimeout(t);
    }, [query, runSearch]);


    useEffect(() => {
        async function fetchUser() {
            if (!selectedUserId) {
                setDetail(null);
                setDetailError('');
                return;
            }
            try {
                setDetailLoading(true);
                setDetailError('');
                const res = await authorizedFetch(`/users/${encodeURIComponent(selectedUserId)}`);
                const body = await res.json();
                if (!res.ok) {
                    throw new Error(body.message || 'Could not load this user.');
                }
                setDetail(body.data ?? null);
            } catch (e) {
                setDetail(null);
                setDetailError(e.message || 'Could not load this user.');
            } finally {
                setDetailLoading(false);
            }
        }
        fetchUser();
    }, [selectedUserId]);

    return (
        <section className="dashboard-panel">
            <h2 className="dashboard-heading">Find people in shared workspaces</h2>
            <p className="dashboard-hint">
                Matches name or email for users who belong to at least one of your workspaces.
            </p>
            <input
                type="search"
                className="dashboard-input"
                placeholder="Search by name or email (min 2 characters)…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search users"
                autoCapitalize="off"
                autoCorrect="off"
            />

            <div className="dashboard-results">
                {searching ? <p className="dashboard-muted">Searching…</p> : null}
                {searchError ? <p className="dashboard-error-msg">{searchError}</p> : null}
                {!searching &&
                    hits.length === 0 &&
                    query.trim().length >= 2 &&
                    !searchError ? (
                    <p className="dashboard-muted">No matches.</p>
                ) : null}
                {!searchError && hits.length ? (
                    <ul className="dashboard-hit-list">
                        {hits.map((u) => {
                            const rowId = String(u._id);
                            return (
                                <li key={rowId}>
                                    <button
                                        type="button"
                                        className={`dashboard-hit ${selectedUserId === rowId ? 'dashboard-hit-selected' : ''}`}
                                        onClick={() => setSelectedUserId(rowId)}
                                    >
                                        <span className="dashboard-hit-icon">
                                            {u.avatar ? <img src={u.avatar} alt="" /> : (u.name || u.email || '?').charAt(0).toUpperCase()}
                                        </span>
                                        <span>
                                            <span className="dashboard-hit-name">{u.name}</span>
                                            <span className="dashboard-hit-email">{u.email}</span>
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                ) : null}
            </div>

            <div className="dashboard-detail-anchor">
                <h3 className="dashboard-detail-title">Details</h3>
                {!selectedUserId ? (
                    <p className="dashboard-muted">Pick someone from results.</p>
                ) : detailLoading ? (
                    <p className="dashboard-muted">Loading profile…</p>
                ) : detailError ? (
                    <p className="dashboard-error-msg">{detailError}</p>
                ) : detail ? (
                    <div className="dashboard-detail-card">
                        <div className="dashboard-detail-row">
                            {detail.avatar ? (
                                <img src={detail.avatar} alt="" className="dashboard-detail-avatar" />
                            ) : (
                                <div className="dashboard-detail-avatar fallback">
                                    {(detail.name || detail.email || '?').charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <p className="dashboard-hit-name">{detail.name}</p>
                                <p className="dashboard-hit-email">{detail.email}</p>
                                <p className="dashboard-id-line" title={detail._id}>
                                    Id: <code>{detail._id}</code>
                                </p>
                            </div>
                        </div>
                        {'isVerified' in detail && detail.isVerified === false ? (
                            <p className="dashboard-warn-msg">Email not verified</p>
                        ) : null}
                        {detail.workspaces && detail.workspaces.length ? (
                            <div className="dashboard-detail-extra">
                                <p className="dashboard-extra-label">Their workspace roles</p>
                                <ul className="dashboard-extra-list">
                                    {detail.workspaces.map((tw, idx) => (
                                        <li key={`${widKey(tw)}-${tw.role || ''}-${idx}`}>
                                            <code>{shortenId(widKey(tw))}</code>
                                            <span className="dashboard-chip">{tw.role}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}
                        {detail.teams?.length ? (
                            <div className="dashboard-detail-extra">
                                <p className="dashboard-extra-label">Teams</p>
                                <p className="dashboard-muted">{detail.teams.length} team memberships</p>
                            </div>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </section>
    )
}

export default UserSearch
