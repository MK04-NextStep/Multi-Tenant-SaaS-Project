import { Link } from 'react-router-dom';
import '../styles/workspaceList.css';

function EntityList({ list = [], heading, createPath, routePrefix,
    displayKey = "name", badgeKey = "role", role }) {
    return (
        <section className="dashboard-panel">

            <div className="dashboard-panel-heading">
                <h2 className="dashboard-heading">
                    {heading}
                </h2>
                {
                    role === "ADMIN" && <Link
                        to={createPath}
                        className="dashboard-link-primary"
                    >
                        Create
                    </Link>
                }
            </div>

            <p className="dashboard-hint">
                {list.length} item{list.length === 1 ? '' : 's'}
            </p>

            <div className="dashboard-stack">

                {list.length === 0 ? (
                    <div className="dashboard-empty">
                        No items found.
                    </div>
                ) : (
                    list.map((item) => {

                        const displayValue =
                            item?.[displayKey] || "Unknown";

                        return (
                            <Link
                                key={item._id}
                                to={`/${routePrefix}/${item._id}`}
                            >
                                <div className="dashboard-workspace-card">

                                    <div className="dashboard-workspace-main">

                                        <span
                                            className="dashboard-workspace-id"
                                            title={displayValue}
                                        >
                                            {displayValue}
                                        </span>

                                        <span className="dashboard-chip">
                                            {item?.[badgeKey] || "MEMBER"}
                                        </span>

                                    </div>

                                </div>
                            </Link>
                        );
                    })
                )}

            </div>
        </section>
    );
}

export default EntityList;