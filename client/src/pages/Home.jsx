import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useRoomStore from '../store/roomStore';
import { listRooms } from '../services/api';
import './Home.css';
import Navbar from '../components/Layout/Navbar';

const SESSION_TYPE_LABEL = {
  teaching:  'Teaching',
  interview: 'Interview',
  collaborate: 'Collab',
  collab:    'Collab',
};

const formatDuration = (start, end) => {
  if (!start) return '';
  const startTime = new Date(start);
  const endTime = end ? new Date(end) : new Date();
  const diffMs = Math.abs(endTime - startTime);
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'under a min';
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

const timeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  return `${diffDays}d ago`;
};

const SessionChip = ({ type }) => (
  <span className={`badge badge-${type === 'collaborate' ? 'collab' : type}`}>
    {SESSION_TYPE_LABEL[type] || type}
  </span>
);

const ParticipantAvatars = ({ participants }) => {
  const displayNames = participants.map(p => typeof p === 'string' ? p : p.username);
  const maxAvatars = 3;
  const toShow = displayNames.slice(0, maxAvatars);
  const remaining = displayNames.length - maxAvatars;

  return (
    <div className="participant-avatars">
      {toShow.map((name, i) => {
        const initial = name ? name.charAt(0).toUpperCase() : '?';
        return (
          <div key={i} className="participant-avatar" title={name}>
            {initial}
          </div>
        );
      })}
      {remaining > 0 && (
        <div className="participant-avatar more" title={`${remaining} more`}>
          +{remaining}
        </div>
      )}
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const { username, setUsername } = useRoomStore();
  const [localUsername, setLocalUsername] = useState(username);
  const [activeRooms, setActiveRooms] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await listRooms();
        if (data.success) {
          setActiveRooms(data.activeRooms || []);
          setRecentSessions(data.recentSessions || []);
        }
      } catch (err) {
        console.error('Error fetching rooms:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
    // Poll every 10 seconds to keep rooms active list updated
    const interval = setInterval(fetchRooms, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    if (localUsername.trim()) setUsername(localUsername.trim());
    navigate(`/room/${joinCode.trim().toUpperCase()}`);
  };

  const displayName = username || 'Developer';

  const filteredRooms = activeRooms.filter((room) => {
    if (activeFilter === 'all') return true;
    return room.mode === activeFilter;
  });

  const liveUsersCount = activeRooms.reduce((sum, r) => sum + (r.activeUsers?.length || 0), 0);

  return (
    <>
    <Navbar />
    <div className="home" id="home-page">
      <div className="home-layout">
        {/* ── Main Content ── */}
        <main className="home-main animate-fadeIn">
          {/* Welcome header */}
          <div className="home-welcome" id="home-welcome">
            <h1 className="home-welcome-title">Welcome back, {displayName}</h1>
            <p className="home-welcome-sub">
              Collaborate on code in real-time. Start a teaching session, conduct an interview, or join an active room to solve challenges together.
            </p>
          </div>

          {/* Bento cards row */}
          <div className="home-bento-row" id="home-bento-row">
            {/* Create a Room card */}
            <div className="bento-card bento-card--create" id="bento-create">
              <div className="bento-bg-icon">
                <svg viewBox="0 0 80 80" fill="none">
                  <rect x="8" y="8" width="64" height="64" rx="12" stroke="currentColor" strokeWidth="3"/>
                  <path d="M40 22v36M22 40h36" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="bento-icon-wrapper">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <rect x="3" y="3" width="18" height="18" rx="3"/>
                  <path d="M12 8v8M8 12h8" strokeLinecap="round"/>
                </svg>
              </div>
              <h2 className="bento-title">Create a Room</h2>
              <p className="bento-desc">
                Host a new private or public session. Perfect for code reviews, pair programming, or technical interviews.
              </p>
              <button
                className="btn btn-primary bento-action"
                onClick={() => navigate('/room/create')}
                id="create-room-hero-btn"
              >
                New Session <span>+</span>
              </button>
            </div>

            {/* Join Room card */}
            <div className="bento-card bento-card--join" id="bento-join">
              <div className="bento-bg-icon">
                <svg viewBox="0 0 80 80" fill="none">
                  <circle cx="28" cy="32" r="12" stroke="currentColor" strokeWidth="3"/>
                  <circle cx="52" cy="32" r="12" stroke="currentColor" strokeWidth="3"/>
                  <path d="M8 64c0-12 10-20 20-20h24c10 0 20 8 20 20" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="bento-icon-wrapper">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <h2 className="bento-title">Join Room</h2>
              <p className="bento-desc">
                Enter a room code or browse public active sessions to jump in and start collaborating instantly.
              </p>
              <form onSubmit={handleJoin} className="join-inline-form" id="join-form">
                <input
                  type="text"
                  className="input join-code-input"
                  placeholder="Room code (e.g. ABC123)"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  id="room-code-input"
                />
                <button type="submit" className="btn btn-secondary bento-action" id="browse-rooms-btn">
                  Join Room
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </form>
            </div>
          </div>

          {/* Active Rooms Table */}
          <div className="active-rooms-card" id="active-rooms-card">
            <div className="active-rooms-header">
              <h2 className="active-rooms-title">Active Rooms</h2>
              <div className="active-rooms-filters">
                <button
                  className={`filter-chip ${activeFilter === 'all' ? 'filter-chip--active' : ''}`}
                  onClick={() => setActiveFilter('all')}
                >
                  All
                </button>
                <button
                  className={`filter-chip ${activeFilter === 'teaching' ? 'filter-chip--active' : ''}`}
                  onClick={() => setActiveFilter('teaching')}
                >
                  Teaching
                </button>
                <button
                  className={`filter-chip ${activeFilter === 'interview' ? 'filter-chip--active' : ''}`}
                  onClick={() => setActiveFilter('interview')}
                >
                  Interview
                </button>
                <button
                  className={`filter-chip ${activeFilter === 'collaborate' ? 'filter-chip--active' : ''}`}
                  onClick={() => setActiveFilter('collaborate')}
                >
                  Collab
                </button>
              </div>
            </div>

            <table className="rooms-table" id="rooms-table">
              <thead>
                <tr>
                  <th className="label-caps">Room Name</th>
                  <th className="label-caps">Session Type</th>
                  <th className="label-caps">Participants</th>
                  <th className="label-caps">Topic</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--outline)', padding: '24px' }}>
                      Loading active rooms...
                    </td>
                  </tr>
                ) : filteredRooms.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--outline)', padding: '24px' }}>
                      No active rooms found. Start a new session above!
                    </td>
                  </tr>
                ) : (
                  filteredRooms.map((room) => (
                    <tr key={room._id} className="rooms-table-row" id={room._id}>
                      <td className="room-name-cell">{room.title}</td>
                      <td>
                        <SessionChip type={room.mode} />
                      </td>
                      <td>
                        <ParticipantAvatars participants={room.activeUsers || []} />
                      </td>
                      <td className="room-topic-cell">
                        {room.description ? (
                          room.description.length > 50 ? `${room.description.substring(0, 50)}...` : room.description
                        ) : (
                          `Code in ${room.language}`
                        )}
                      </td>
                      <td>
                        <button
                          className="join-room-link"
                          onClick={() => room.inviteCode && navigate(`/room/${room.inviteCode}`)}
                        >
                          Join Room
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="active-rooms-footer">
              <button className="view-all-link" id="view-all-rooms-btn" onClick={() => setActiveFilter('all')}>
                View All Active Rooms
              </button>
            </div>
          </div>
        </main>

        {/* ── Right Sidebar ── */}
        <aside className="home-sidebar animate-slideInRight" id="home-sidebar">
          {/* Recent Sessions */}
          <div className="sidebar-card" id="recent-sessions-card">
            <div className="sidebar-card-header">
              <span>Recent Sessions</span>
            </div>
            <div className="recent-sessions-list">
              {loading ? (
                <div style={{ padding: '16px', color: 'var(--outline)', fontSize: '13px' }}>
                  Loading recent sessions...
                </div>
              ) : recentSessions.length === 0 ? (
                <div style={{ padding: '16px', color: 'var(--outline)', fontSize: '13px' }}>
                  No recent sessions.
                </div>
              ) : (
                recentSessions.map((room) => (
                  <div
                    key={room._id}
                    className="recent-session-item"
                    id={`recent-session-${room._id}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/room/${room.inviteCode}`)}
                  >
                    <div className="rs-top">
                      <SessionChip type={room.mode} />
                      <span className="rs-time">{timeAgo(room.closedAt || room.updatedAt)}</span>
                    </div>
                    <div className="rs-title">{room.title}</div>
                    <div className="rs-meta">
                      Duration: {formatDuration(room.createdAt, room.closedAt)} | Participants: {room.participants?.length || 0}
                    </div>
                    <div className="rs-sub">Shared by: @{room.owner}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Gateway Status */}
          <div className="sidebar-card gateway-card" id="gateway-card">
            <div className="gateway-status">
              <span className="gateway-dot" />
              <span className="gateway-label">Collaboration Gateway Active</span>
            </div>
            <div className="gateway-stats">
              <div className="gateway-stat">
                <div className="gateway-stat-label label-caps">Sync Latency</div>
                <div className="gateway-stat-value">~12ms P99</div>
              </div>
              <div className="gateway-stat">
                <div className="gateway-stat-label label-caps">Live Users</div>
                <div className="gateway-stat-value">{liveUsersCount}</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
    </>
  );
};

export default Home;
