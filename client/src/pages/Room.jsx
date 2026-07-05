import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useRoomStore from '../store/roomStore';
import useEditorStore from '../store/editorStore';
import useSocket from '../hooks/useSocket';
import { getRoomByCode } from '../services/api';
import CodeEditor from '../components/Editor/CodeEditor';
import RoomHeader from '../components/Room/RoomHeader';
import ProblemPanel from '../components/Room/ProblemPanel';
import RoomChat from '../components/Chat/RoomChat';
import OutputTerminal from '../components/Terminal/OutputTerminal';
import UserPresence from '../components/Room/UserPresence';
import './Room.css';

const Room = () => {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const { room, isJoined, username } = useRoomStore();
  const { language, setLanguage } = useEditorStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stdinInput, setStdinInput] = useState('');
  const [localUsername, setLocalUsername] = useState(username || '');
  const [needsUsername, setNeedsUsername] = useState(!username);
  const [activeSidebar, setActiveSidebar] = useState('problem'); // 'problem' | null

  const { joinRoom, leaveRoom, sendMessage, runCode, runTests } = useSocket(inviteCode);

  useEffect(() => {
    if (!username) setNeedsUsername(true);
  }, [username]);

  useEffect(() => {
    if (!inviteCode || needsUsername) return;
    const init = async () => {
      try {
        setLoading(true);
        const { room: roomData } = await getRoomByCode(inviteCode);
        if (roomData.language) setLanguage(roomData.language);
        setTimeout(() => {
          joinRoom(inviteCode.toUpperCase());
        }, 500);
        setLoading(false);
      } catch (err) {
        setError('Room not found. Check the invite code.');
        setLoading(false);
      }
    };
    init();
  }, [inviteCode, needsUsername]);

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    if (!localUsername.trim()) return;
    useRoomStore.getState().setUsername(localUsername.trim());
    setNeedsUsername(false);
  };

  const handleRunCode = () => {
    const code = window.__codesync_getCode?.() || '';
    runCode(language, code, stdinInput);
  };

  const handleRunTests = () => {
    if (!room?.testCases?.length) return;
    const code = window.__codesync_getCode?.() || '';
    runTests(language, code, room.testCases);
  };

  const handleLeave = () => {
    leaveRoom();
    navigate('/');
  };

  // Username prompt
  if (needsUsername) {
    return (
      <div className="room-username-prompt" id="username-prompt">
        <div className="username-card animate-fadeIn">
          <div className="username-card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h2>Join Room</h2>
          <p className="text-muted text-sm">Enter your name to join room <strong>{inviteCode}</strong></p>
          <form onSubmit={handleUsernameSubmit}>
            <input
              type="text"
              className="input"
              placeholder="Your name"
              value={localUsername}
              onChange={(e) => setLocalUsername(e.target.value)}
              autoFocus
              id="join-username-input"
              required
            />
            <button type="submit" className="btn btn-primary w-full" style={{ marginTop: 'var(--space-md)' }}>
              Join →
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="room-loading">
        <div className="room-loading-spinner" />
        <p>Connecting to room...</p>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="room-loading">
        <p className="text-muted">{error}</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  const isInterview = room?.mode === 'interview';
  const hasTestCases = room?.testCases?.length > 0;

  return (
    <div className="room-page" id="room-page">
      {/* Top header bar */}
      <RoomHeader onLeave={handleLeave} stdinInput={stdinInput} setStdinInput={setStdinInput} />

      <div className="room-body">
        {/* ── Left icon sidebar ── */}
        {/* <div className="room-icon-sidebar" id="room-icon-sidebar">
          <button
            className={`icon-sidebar-btn ${activeSidebar === 'problem' ? 'active' : ''}`}
            title="Problem / Files"
            onClick={() => setActiveSidebar(s => s === 'problem' ? null : 'problem')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </button>
          <button
            className="icon-sidebar-btn"
            title="Code / Editor"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <polyline points="16 18 22 12 16 6"/>
              <polyline points="8 6 2 12 8 18"/>
            </svg>
          </button>
          <button
            className="icon-sidebar-btn"
            title="Help"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </button>
        </div> */}

        {/* ── Problem Panel (collapsible left panel) ── */}
        {/* {activeSidebar === 'problem' && (
          <div className="workspace-left" id="workspace-left">
            <ProblemPanel />
          </div>
        )} */}

        {/* ── Center: Editor + Execution bar + Terminal ── */}
        <div className="workspace-center" id="workspace-center">
          {/* Tab bar above editor */}
          <div className="editor-tab-bar" id="editor-tab-bar">
            <div className="editor-tab active">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              scratchpad.js
            </div>
          </div>

          <div className="editor-area">
            <CodeEditor
              roomId={room?._id}
              starterCode={room?.starterCode}
            />
          </div>

          {/* Run / Submit bar */}
          <div className="execution-bar" id="execution-bar">
            <div className="execution-bar-left">
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleRunCode}
                id="run-code-btn"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                Run
              </button>
              {(isInterview || hasTestCases) && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={handleRunTests}
                  id="run-tests-btn"
                >
                  🧪 Run Tests
                </button>
              )}
            </div>
            <div className="execution-bar-right">
              <input
                type="text"
                className="input stdin-input"
                placeholder="stdin input..."
                value={stdinInput}
                onChange={(e) => setStdinInput(e.target.value)}
                id="stdin-input"
              />
              <button
                className="btn btn-primary btn-sm"
                onClick={handleRunCode}
                id="submit-solution-btn"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.24h3a2 2 0 0 1 2 1.72"/>
                </svg>
                Submit Solution
              </button>
            </div>
          </div>

          {/* Terminal / Output */}
          <div className="terminal-area">
            <OutputTerminal />
          </div>
        </div>

        {/* ── Right Panel: Host Controls + Participants + Chat ── */}
        <div className="workspace-right" id="workspace-right">
          {/* Host Controls */}
          <div className="right-panel-section host-controls-section" id="host-controls">
            <div className="right-panel-header">
              <span className="label-caps" style={{ color: 'var(--outline)' }}>Host Controls</span>
              <span className="badge badge-success" style={{ fontSize: '10px', padding: '1px 6px' }}>● Active</span>
            </div>

            <div className="host-control-body">
              <div className="form-group">
                <label className="form-label">Input Test Case</label>
                <textarea
                  className="textarea host-textarea"
                  placeholder={`{"nums": [2,7,11,15], "target": 9}`}
                  rows={3}
                  id="host-test-case-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Expected Output</label>
                <textarea
                  className="textarea host-textarea"
                  placeholder="[0, 1]"
                  rows={2}
                  id="host-expected-output"
                />
              </div>
              <div className="host-visibility-row">
                <span className="body-sm">Public visibility</span>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked id="visibility-toggle" />
                  <span className="toggle-slider" />
                </label>
              </div>
              <button className="btn btn-secondary w-full btn-sm" id="push-to-participants-btn">
                Push to All Participants
              </button>
            </div>
          </div>

          {/* Participants */}
          <div className="right-panel-section" id="participants-section">
            <div className="right-panel-header">
              <span className="label-caps" style={{ color: 'var(--outline)' }}>Participants</span>
            </div>
            <UserPresence compact />
          </div>

          {/* Room Chat */}
          <div className="right-panel-section chat-section" id="chat-section">
            <div className="right-panel-header">
              <span className="label-caps" style={{ color: 'var(--outline)' }}>Room Chat</span>
            </div>
            <RoomChat sendMessage={sendMessage} />
          </div>
        </div>
      </div>

      {/* ── Status bar ── */}
      <div className="room-status-bar" id="room-status-bar">
        <div className="status-bar-left">
          <span className="status-item">
            <span className="status-dot status-dot--green" />
            SESSION: {inviteCode}
          </span>
          <span className="status-separator">|</span>
          <span className="status-item">
            <span className="status-dot status-dot--blue" />
            LIVE SYNC: ACTIVE
          </span>
        </div>
        <div className="status-bar-right">
          <span className="status-item">ROOM CAPACITY: {(room?.capacity || 5) + '/5'}</span>
          <span className="status-separator">|</span>
          <span className="status-item">UTF-8</span>
          <span className="status-separator">|</span>
          <span className="status-item">{language?.toUpperCase() || 'PYTHON'}</span>
          <span className="status-separator">|</span>
          <span className="status-item status-item--accent">
            ⚡ HOST MODE
          </span>
        </div>
      </div>
    </div>
  );
};

export default Room;
