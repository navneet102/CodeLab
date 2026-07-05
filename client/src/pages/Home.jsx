import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useRoomStore from '../store/roomStore';
import './Home.css';
import Navbar from '../components/Layout/Navbar';

// Mock data for Recent Sessions sidebar
const RECENT_SESSIONS = [
  {
    type: 'teaching',
    title: 'Rust Memory Safety Deep Dive',
    meta: 'Duration: 1h 24m | Participants: 12',
    sub: 'Shared by: @prof_dev',
    time: '15m ago',
  },
  {
    type: 'interview',
    title: 'Mid-Level Backend Interview',
    meta: 'Status: Completed | Feedback Sent',
    sub: 'Role: Node.js Engineer',
    time: '2h ago',
  },
  {
    type: 'collab',
    title: 'Project: Zen-Architecture Refactor',
    meta: 'Sync session for core contributors',
    sub: 'Repo: zen-core-v2',
    time: 'Yesterday',
  },
];

const SESSION_TYPE_LABEL = {
  teaching:  'Teaching',
  interview: 'Interview',
  collab:    'Collab',
};

// Mock active rooms for the table
const MOCK_ACTIVE_ROOMS = [
  {
    id: 'room-1',
    name: 'System Design Review',
    type: 'teaching',
    participants: ['JD', 'AS', '+2'],
    topic: 'Microservices',
    inviteCode: null,
  },
  {
    id: 'room-2',
    name: 'FE Engineer Candidate #2',
    type: 'interview',
    participants: ['HF', 'C'],
    topic: 'React / Hooks',
    inviteCode: null,
  },
  {
    id: 'room-3',
    name: 'LeetCode Grind — Graph Problems',
    type: 'collab',
    participants: ['A', '+6'],
    topic: 'DFS / BFS',
    inviteCode: null,
  },
];

const SessionChip = ({ type }) => (
  <span className={`badge badge-${type}`}>
    {SESSION_TYPE_LABEL[type] || type}
  </span>
);

const ParticipantAvatars = ({ participants }) => (
  <div className="participant-avatars">
    {participants.map((p, i) => (
      <div key={i} className={`participant-avatar ${p.startsWith('+') ? 'more' : ''}`}>
        {p}
      </div>
    ))}
  </div>
);

const Home = () => {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const { username, setUsername } = useRoomStore();
  const [localUsername, setLocalUsername] = useState(username);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    if (localUsername.trim()) setUsername(localUsername.trim());
    navigate(`/room/${joinCode.trim().toUpperCase()}`);
  };

  const displayName = username || 'Developer';

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
                  Browse Rooms
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
                <button className="filter-chip filter-chip--active">Teaching</button>
                <button className="filter-chip">Interview</button>
                <button className="filter-chip">Collab</button>
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
                {MOCK_ACTIVE_ROOMS.map((room) => (
                  <tr key={room.id} className="rooms-table-row" id={room.id}>
                    <td className="room-name-cell">{room.name}</td>
                    <td>
                      <SessionChip type={room.type} />
                    </td>
                    <td>
                      <ParticipantAvatars participants={room.participants} />
                    </td>
                    <td className="room-topic-cell">{room.topic}</td>
                    <td>
                      <button
                        className="join-room-link"
                        onClick={() => room.inviteCode && navigate(`/room/${room.inviteCode}`)}
                      >
                        Join Room
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="active-rooms-footer">
              <button className="view-all-link" id="view-all-rooms-btn">
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
              <button className="view-all-link">View All</button>
            </div>
            <div className="recent-sessions-list">
              {RECENT_SESSIONS.map((s, i) => (
                <div key={i} className="recent-session-item" id={`recent-session-${i}`}>
                  <div className="rs-top">
                    <SessionChip type={s.type} />
                    <span className="rs-time">{s.time}</span>
                  </div>
                  <div className="rs-title">{s.title}</div>
                  <div className="rs-meta">{s.meta}</div>
                  <div className="rs-sub">{s.sub}</div>
                </div>
              ))}
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
                <div className="gateway-stat-value">8,142</div>
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
