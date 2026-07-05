import { useState } from 'react';
import { Link } from 'react-router-dom';
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

  const modeConfig = {
    collaborate: { label: 'Collab',     badgeClass: 'badge-collab' },
    interview:   { label: 'Interview',  badgeClass: 'badge-interview' },
    teaching:    { label: 'Teaching',   badgeClass: 'badge-teaching' },
  };
  const mode = modeConfig[room.mode] || modeConfig.collaborate;
  const langName = LANGUAGE_LIST.find(l => l.id === language)?.name || language;

  return (
    <>
      <div className="room-header" id="room-header">
        {/* Left: Brand */}
        <Link to="/" className="room-header-brand" id="room-logo-link">
          <div className="room-logo-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M13.325 3.05L8.667 20.432a1 1 0 01-1.94-.485L11.385 2.565a1 1 0 011.94.485z" fill="#4edea3"/>
              <path d="M7.612 14.776l-3.36-3.36a1 1 0 010-1.415l3.36-3.36a1 1 0 111.414 1.415L6.368 10.71a.5.5 0 000 .707l2.658 2.658a1 1 0 01-1.414 1.414z" fill="#4edea3"/>
              <path d="M16.388 14.776l3.36-3.36a1 1 0 000-1.415l-3.36-3.36a1 1 0 10-1.414 1.415l2.658 2.654a.5.5 0 010 .707l-2.658 2.658a1 1 0 001.414 1.414z" fill="#3b82f6"/>
            </svg>
          </div>
          <span className="room-logo-text">Code<span className="room-logo-accent">Collaborate</span></span>
        </Link>

        {/* Center: Live session indicator */}
        <div className="room-header-center" id="room-header-center">
          <div className="live-chip">
            <span className="live-dot" />
            LIVE SESSION
          </div>
          <span className="room-session-title">{room.title}</span>
          <span className={`badge ${mode.badgeClass}`}>{mode.label}</span>
        </div>

        {/* Right: Language selector, user avatars, invite, leave */}
        <div className="room-header-right" id="room-header-right">
          {/* Language display */}
          <div className="room-lang-display">
            <span className="room-lang-label">Language:</span>
            <select
              className="room-lang-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              id="lang-select"
            >
              {LANGUAGE_LIST.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          {/* Theme */}
          <select
            className="room-theme-select"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            id="theme-select"
          >
            {THEMES.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          {/* User avatars */}
          <div className="user-avatars" id="user-avatars">
            {activeUsers.slice(0, 4).map((user, i) => (
              <div
                key={user.socketId || i}
                className="user-avatar"
                style={{ '--avatar-color': user.color }}
                title={user.username}
              >
                {user.username?.charAt(0).toUpperCase()}
              </div>
            ))}
            {activeUsers.length > 4 && (
              <div className="user-avatar user-avatar-more">+{activeUsers.length - 4}</div>
            )}
          </div>

          {/* Invite */}
          <button
            className="btn btn-secondary btn-sm room-invite-btn"
            onClick={() => setShowInvite(true)}
            id="invite-btn"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
            </svg>
            Invite
          </button>

          {/* Icon buttons */}
          <button className="btn-icon" title="Notifications">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>
          <button className="btn-icon" title="Settings">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>

          {/* User avatar */}
          <div className="room-user-avatar" title="You">
            {useRoomStore.getState().username?.charAt(0).toUpperCase() || 'U'}
          </div>
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
