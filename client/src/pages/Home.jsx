import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useRoomStore from '../store/roomStore';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const { username, setUsername } = useRoomStore();
  const [localUsername, setLocalUsername] = useState(username);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!joinCode.trim() || !localUsername.trim()) return;
    setUsername(localUsername.trim());
    navigate(`/room/${joinCode.trim().toUpperCase()}`);
  };

  return (
    <div className="home" id="home-page">
      {/* Background effects */}
      <div className="home-bg">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
        <div className="bg-grid" />
      </div>

      <main className="home-content">
        {/* Hero Section */}
        <section className="hero animate-fadeIn" id="hero-section">
          <div className="hero-badge">
            <span className="badge badge-primary">⚡ Real-time Collaborative Coding</span>
          </div>
          <h1 className="hero-title">
            Code Together,<br />
            <span className="hero-gradient">Learn Together</span>
          </h1>
          <p className="hero-subtitle">
            A collaborative coding platform where multiple developers can write,
            run, and debug code together — with real-time sync, code execution,
            and interview mode.
          </p>

          {/* Join Room Form */}
          <div className="hero-actions" id="hero-actions">
            <form className="join-form" onSubmit={handleJoin} id="join-form">
              <div className="join-inputs">
                <input
                  type="text"
                  className="input"
                  placeholder="Your name"
                  value={localUsername}
                  onChange={(e) => setLocalUsername(e.target.value)}
                  id="username-input"
                  required
                />
                <input
                  type="text"
                  className="input"
                  placeholder="Room code (e.g. ABC123)"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  id="room-code-input"
                  required
                />
                <button type="submit" className="btn btn-primary" id="join-btn">
                  Join Room →
                </button>
              </div>
            </form>
            <div className="hero-divider">
              <span>or</span>
            </div>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => navigate('/room/create')}
              id="create-room-hero-btn"
            >
              ✨ Create a New Room
            </button>
          </div>
        </section>

        {/* Features */}
        <section className="features animate-fadeIn" id="features-section">
          <div className="features-grid">
            <div className="feature-card" id="feature-realtime">
              <div className="feature-icon">🔄</div>
              <h3>Real-Time Collaboration</h3>
              <p>Edit code simultaneously with live cursors and conflict-free sync powered by CRDT technology.</p>
            </div>
            <div className="feature-card" id="feature-execute">
              <div className="feature-icon">▶️</div>
              <h3>Code Execution</h3>
              <p>Run C++, Java, and Python code in sandboxed Docker containers with shared output across all users.</p>
            </div>
            <div className="feature-card" id="feature-interview">
              <div className="feature-icon">📋</div>
              <h3>Interview Mode</h3>
              <p>Set coding problems with test cases, hidden tests, and automated evaluation for technical interviews.</p>
            </div>
            <div className="feature-card" id="feature-chat">
              <div className="feature-icon">💬</div>
              <h3>Built-in Chat</h3>
              <p>Communicate with your team in real-time without leaving the editor. Everything in one tab.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;
