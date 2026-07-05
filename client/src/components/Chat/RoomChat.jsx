import { useState, useRef, useEffect } from 'react';
import useRoomStore from '../../store/roomStore';
import './RoomChat.css';

const RoomChat = ({ sendMessage }) => {
  const { chatMessages, username } = useRoomStore();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessage(message.trim());
    setMessage('');
  };

  const formatTime = (timestamp) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="room-chat" id="room-chat">
      <div className="panel-header">
        <span>💬 Chat</span>
        <span className="text-xs text-muted">{chatMessages.length} messages</span>
      </div>
      <div className="chat-messages" id="chat-messages">
        {chatMessages.length === 0 && (
          <div className="chat-empty text-muted text-xs text-center">
            No messages yet. Say hello! 👋
          </div>
        )}
        {chatMessages.map((msg, i) => (
          <div
            key={i}
            className={`chat-message ${msg.username === username ? 'own' : ''}`}
          >
            <div className="chat-meta">
              <span className="chat-username">{msg.username}</span>
              <span className="chat-time">{formatTime(msg.timestamp)}</span>
            </div>
            <div className="chat-text">{msg.message}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form className="chat-input-form" onSubmit={handleSend} id="chat-input-form">
        <input
          type="text"
          className="input chat-input"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          id="chat-input"
        />
        <button type="submit" className="btn btn-primary btn-sm" id="chat-send-btn">
          Send
        </button>
      </form>
    </div>
  );
};

export default RoomChat;
