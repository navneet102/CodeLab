import useRoomStore from '../../store/roomStore';
import './UserPresence.css';

const UserPresence = ({ compact = false }) => {
  const { activeUsers } = useRoomStore();

  if (compact) {
    return (
      <div className="user-presence-compact" id="user-presence-panel">
        <div className="compact-avatars">
          {activeUsers.slice(0, 5).map((user, i) => (
            <div
              key={user.socketId || i}
              className="compact-avatar"
              style={{ '--avatar-color': user.color }}
              title={user.username}
            >
              {user.username?.charAt(0).toUpperCase()}
            </div>
          ))}
          {activeUsers.length === 0 && (
            <span className="compact-empty">No users</span>
          )}
          <button className="compact-add-btn" title="Invite more">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-presence" id="user-presence-panel">
      <div className="panel-header">
        <span>👥 Users ({activeUsers.length})</span>
      </div>
      <div className="user-list">
        {activeUsers.map((user, i) => (
          <div key={user.socketId || i} className="user-item">
            <div className="user-dot" style={{ background: user.color }} />
            <span className="user-name truncate">{user.username}</span>
            <span className="user-online-dot" title="Online" />
          </div>
        ))}
        {activeUsers.length === 0 && (
          <div className="user-empty">No users connected</div>
        )}
      </div>
    </div>
  );
};

export default UserPresence;
