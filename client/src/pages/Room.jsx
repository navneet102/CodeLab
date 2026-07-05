import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useRoomStore from '../store/roomStore';
import useEditorStore from '../store/editorStore';
import useSocket from '../hooks/useSocket';
import { getRoomByCode } from '../services/api';
import CodeEditor from '../components/Editor/CodeEditor';
import RoomHeader from '../components/Room/RoomHeader';
import UserPresence from '../components/Room/UserPresence';
import ProblemPanel from '../components/Room/ProblemPanel';
import RoomChat from '../components/Chat/RoomChat';
import OutputTerminal from '../components/Terminal/OutputTerminal';
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

  const { joinRoom, leaveRoom, sendMessage, runCode, runTests } = useSocket(inviteCode);

  // If user has no username, prompt them
  useEffect(() => {
    if (!username) {
      setNeedsUsername(true);
    }
  }, [username]);

  // Fetch room data and join
  useEffect(() => {
    if (!inviteCode || needsUsername) return;

    const init = async () => {
      try {
        setLoading(true);
        const { room: roomData } = await getRoomByCode(inviteCode);

        // Set the language from room settings
        if (roomData.language) {
          setLanguage(roomData.language);
        }

        // Join via socket (short delay to ensure socket is connected)
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

  // Loading state
  if (loading) {
    return (
      <div className="room-loading">
        <div className="editor-loading-spinner" style={{ width: 40, height: 40, borderWidth: 4 }} />
        <p>Connecting to room...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="room-loading">
        <p className="text-muted">{error}</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Go Home
        </button>
      </div>
    );
  }

  const isInterview = room?.mode === 'interview';
  const hasTestCases = room?.testCases?.length > 0;

  return (
    <div className="room-page" id="room-page">
      <RoomHeader onLeave={handleLeave} />

      <div className="room-workspace">
        {/* Left: Problem Panel */}
        <div className="workspace-left" id="workspace-left">
          <ProblemPanel />
        </div>

        {/* Center: Editor + Terminal */}
        <div className="workspace-center" id="workspace-center">
          <div className="editor-area">
            <CodeEditor
              roomId={room?._id}
              starterCode={room?.starterCode}
            />
          </div>

          <div className="execution-bar" id="execution-bar">
            <div className="execution-bar-left">
              <button
                className="btn btn-primary btn-sm"
                onClick={handleRunCode}
                id="run-code-btn"
              >
                ▶ Run
              </button>
              {(isInterview || hasTestCases) && (
                <button
                  className="btn btn-secondary btn-sm"
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
                placeholder="stdin input (optional)"
                value={stdinInput}
                onChange={(e) => setStdinInput(e.target.value)}
                id="stdin-input"
              />
            </div>
          </div>

          <div className="terminal-area">
            <OutputTerminal />
          </div>
        </div>

        {/* Right: Chat + Users */}
        <div className="workspace-right" id="workspace-right">
          <UserPresence />
          <RoomChat sendMessage={sendMessage} />
        </div>
      </div>
    </div>
  );
};

export default Room;
