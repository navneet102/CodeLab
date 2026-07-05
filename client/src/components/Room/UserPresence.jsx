import useRoomStore from '../../store/roomStore';
import './UserPresence.css';

const UserPresence = () => {
  const { activeUsers } = useRoomStore();

  return (
    <div className="user-presence" id="user-presence-panel">
      <div className="panel-header">
        <span>👥 Users ({activeUsers.length})</span>
      </div>
      <div className="user-list">
        {activeUsers.map((user, i) => (
          <div key={user.socketId || i} className="user-item">
            <div
              className="user-dot"
              style={{ background: user.color }}
            />
            <span className="user-name truncate">{user.username}</span>
            <span className="user-status-dot" title="Online" />
          </div>
        ))}
        {activeUsers.length === 0 && (
          <div className="user-empty text-muted text-xs">
            No users connected
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPresence;
