import { useState, useRef, useEffect } from 'react';
import useRoomStore from '../../store/roomStore';
import './RoomChat.css';

const RoomChat = ({ sendMessage }) => {
  const { chatMessages, username } = useRoomStore();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);

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
      <div className="chat-messages" id="chat-messages">
        {chatMessages.length === 0 && (
          <div className="chat-empty">
            No messages yet. Say hello! 👋
          </div>
        )}
        {chatMessages.map((msg, i) => {
          const isOwn = msg.username === username;
          return (
            <div key={i} className={`chat-message ${isOwn ? 'own' : ''}`}>
              {!isOwn && (
                <div className="chat-sender">{msg.username}</div>
              )}
              <div className="chat-bubble">
                <span className="chat-text">{msg.message}</span>
                <span className="chat-time">{formatTime(msg.timestamp)}</span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSend} id="chat-input-form">
        <input
          type="text"
          className="chat-input"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          id="chat-input"
        />
        <button type="submit" className="chat-send-btn" id="chat-send-btn" title="Send">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </form>
    </div>
  );
};

export default RoomChat;
