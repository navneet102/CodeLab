import { useState } from 'react';
import useRoomStore from '../../store/roomStore';
import useEditorStore from '../../store/editorStore';
import { LANGUAGES, LANGUAGE_LIST } from '../../utils/languages';
import { THEMES } from '../../utils/themes';
import InviteModal from './InviteModal';
import './RoomHeader.css';

const RoomHeader = ({ onLeave }) => {
  const { room, activeUsers } = useRoomStore();
  const { language, setLanguage, theme, setTheme } = useEditorStore();
  const [showInvite, setShowInvite] = useState(false);

  if (!room) return null;

  const modeBadge = {
    collaborate: { label: 'Collab', className: 'badge-primary' },
    interview: { label: 'Interview', className: 'badge-warning' },
    teaching: { label: 'Teaching', className: 'badge-success' },
  };

  const badge = modeBadge[room.mode] || modeBadge.collaborate;

  return (
    <>
      <div className="room-header" id="room-header">
        <div className="room-header-left">
          <h2 className="room-title truncate">{room.title}</h2>
          <span className={`badge ${badge.className}`}>{badge.label}</span>
        </div>

        <div className="room-header-center">
          <select
            className="select header-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            id="lang-select"
          >
            {LANGUAGE_LIST.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
          <select
            className="select header-select"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            id="theme-select"
          >
            {THEMES.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="room-header-right">
          {/* User avatars */}
          <div className="user-avatars" id="user-avatars">
            {activeUsers.slice(0, 5).map((user, i) => (
              <div
                key={user.socketId || i}
                className="user-avatar"
                style={{ '--avatar-color': user.color }}
                title={user.username}
              >
                {user.username?.charAt(0).toUpperCase()}
              </div>
            ))}
            {activeUsers.length > 5 && (
              <div className="user-avatar user-avatar-more">
                +{activeUsers.length - 5}
              </div>
            )}
          </div>

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setShowInvite(true)}
            id="invite-btn"
          >
            📎 Invite
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={onLeave}
            id="leave-btn"
          >
            Leave
          </button>
        </div>
      </div>

      {showInvite && (
        <InviteModal
          inviteCode={room.inviteCode}
          onClose={() => setShowInvite(false)}
        />
      )}
    </>
  );
};

export default RoomHeader;
