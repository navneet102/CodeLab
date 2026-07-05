import { useState } from 'react';
import './InviteModal.css';

const InviteModal = ({ inviteCode, onClose }) => {
  const [copied, setCopied] = useState(false);

  const inviteUrl = `${window.location.origin}/room/${inviteCode}`;

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} id="invite-modal-overlay">
      <div className="modal invite-modal" onClick={(e) => e.stopPropagation()} id="invite-modal">
        <div className="modal-title">Invite Collaborators</div>
        <p className="text-muted text-sm" style={{ marginBottom: 'var(--space-lg)' }}>
          Share this code or link to invite others to your room.
        </p>

        <div className="invite-code-display" id="invite-code-display">
          <span className="invite-code-label">Room Code</span>
          <div className="invite-code-value">{inviteCode}</div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => copyToClipboard(inviteCode)}
          >
            {copied ? '✓ Copied!' : 'Copy Code'}
          </button>
        </div>

        <div className="invite-link-display">
          <span className="invite-code-label">Invite Link</span>
          <div className="invite-link-value truncate">{inviteUrl}</div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => copyToClipboard(inviteUrl)}
          >
            {copied ? '✓ Copied!' : 'Copy Link'}
          </button>
        </div>

        <button className="btn btn-ghost w-full" onClick={onClose} style={{ marginTop: 'var(--space-md)' }}>
          Close
        </button>
      </div>
    </div>
  );
};

export default InviteModal;
