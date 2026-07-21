import { useEffect, useRef } from 'react';
import useVoiceChat from '../../hooks/useVoiceChat';
import useRoomStore from '../../store/roomStore';
import './VoiceChat.css';

const VoiceChat = ({ roomId }) => {
  const {
    micEnabled,
    speakersEnabled,
    toggleMic,
    toggleSpeakers,
    remoteStreams,
    activeSpeaker,
  } = useVoiceChat(roomId);

  const { activeUsers } = useRoomStore();

  const getUsername = (socketId) => {
    const user = activeUsers.find((u) => u.socketId === socketId);
    return user ? user.username : 'Someone';
  };

  return (
    <div className="voice-chat-container">
      {/* Hidden audio elements for remote streams */}
      <div style={{ display: 'none' }}>
        {Object.entries(remoteStreams).map(([socketId, stream]) => (
          <AudioPlayer key={socketId} stream={stream} muted={!speakersEnabled} />
        ))}
      </div>

      <div className="voice-chat-status">
        {activeSpeaker ? (
          <div className="active-speaker animate-pulse">
            <span className="speaker-icon">🔊</span>
            <span className="speaker-name">{getUsername(activeSpeaker)} is speaking</span>
          </div>
        ) : (
          <div className="voice-idle">
            <span className="speaker-icon" style={{ opacity: 0.5 }}>🔈</span>
            <span>Voice Chat</span>
          </div>
        )}
      </div>

      <div className="voice-chat-controls">
        <button
          className={`voice-btn ${micEnabled ? 'active' : 'muted'}`}
          onClick={toggleMic}
          title={micEnabled ? 'Mute Microphone' : 'Enable Microphone'}
        >
          {micEnabled ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="1" y1="1" x2="23" y2="23"/>
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
              <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          )}
        </button>

        <button
          className={`voice-btn ${speakersEnabled ? 'active' : 'muted'}`}
          onClick={toggleSpeakers}
          title={speakersEnabled ? 'Mute Speakers' : 'Enable Speakers'}
        >
          {speakersEnabled ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <line x1="23" y1="9" x2="17" y2="15"/>
              <line x1="17" y1="9" x2="23" y2="15"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

// Component to handle attaching stream to an audio element
const AudioPlayer = ({ stream, muted }) => {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current && stream) {
      audioRef.current.srcObject = stream;
    }
  }, [stream]);

  return <audio ref={audioRef} autoPlay muted={muted} />;
};

export default VoiceChat;
