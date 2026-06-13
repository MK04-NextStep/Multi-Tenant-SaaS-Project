import '../styles/workspaceList.css';
import { Link } from 'react-router-dom';

function EntityRow({ item, entityKey, routePrefix}) {
  const entity = item?.[entityKey];
  const name =
    entity?.name ||
    entity?._id?.toString?.() ||
    'Unknown';

  const id = entity?._id;

  return (
    <Link to={`/${routePrefix}/${name}`} state={{
        id, role: item.role,}}>
      <div className="dashboard-workspace-card">
        <div className="dashboard-workspace-main">
          <span
            className="dashboard-workspace-id"
            title={name}
          >
            {name}
          </span>

          <span className="dashboard-chip">
            {item.role || 'MEMBER'}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default EntityRow;