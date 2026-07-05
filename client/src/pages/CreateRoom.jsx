import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoom } from '../services/api';
import { LANGUAGE_LIST, LANGUAGES } from '../utils/languages';
import useRoomStore from '../store/roomStore';
import './CreateRoom.css';

const MODES = [
  { id: 'collaborate', name: 'Collaborate', icon: '🤝', desc: 'Free coding with everyone editing together' },
  { id: 'interview', name: 'Interview', icon: '📋', desc: 'Set problems with test cases for evaluation' },
  { id: 'teaching', name: 'Teaching', icon: '📚', desc: 'Teacher-led coding with guided exercises' },
];

const CreateRoom = () => {
  const navigate = useNavigate();
  const { username, setUsername } = useRoomStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    owner: username,
    title: '',
    description: '',
    language: 'python',
    mode: 'collaborate',
    starterCode: '',
    testCases: [{ input: '', expectedOutput: '', isHidden: false }],
  });

  const updateForm = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const addTestCase = () => {
    setForm((f) => ({
      ...f,
      testCases: [...f.testCases, { input: '', expectedOutput: '', isHidden: false }],
    }));
  };

  const updateTestCase = (index, key, value) => {
    setForm((f) => {
      const tc = [...f.testCases];
      tc[index] = { ...tc[index], [key]: value };
      return { ...f, testCases: tc };
    });
  };

  const removeTestCase = (index) => {
    setForm((f) => ({
      ...f,
      testCases: f.testCases.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.owner.trim() || !form.title.trim()) {
      setError('Name and room title are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      setUsername(form.owner.trim());
      const { room } = await createRoom({
        ...form,
        starterCode: form.starterCode || LANGUAGES[form.language].defaultCode,
      });
      navigate(`/room/${room.inviteCode}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-room-page" id="create-room-page">
      <div className="create-room-container animate-fadeIn">
        <div className="create-room-header">
          <h1>Create a Room</h1>
          <p className="text-muted">Set up a collaborative coding session</p>
        </div>

        <form onSubmit={handleSubmit} className="create-room-form" id="create-room-form">
          {error && <div className="form-error">{error}</div>}

          {/* Basic Info */}
          <div className="form-section">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Enter your name"
                  value={form.owner}
                  onChange={(e) => updateForm('owner', e.target.value)}
                  id="owner-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Room Title</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Two Sum Problem"
                  value={form.title}
                  onChange={(e) => updateForm('title', e.target.value)}
                  id="title-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Problem Description</label>
              <textarea
                className="textarea"
                placeholder="Describe the coding problem or session topic... (Markdown supported)"
                value={form.description}
                onChange={(e) => updateForm('description', e.target.value)}
                rows={4}
                id="description-input"
              />
            </div>
          </div>

          {/* Language & Mode */}
          <div className="form-section">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Language</label>
                <select
                  className="select"
                  value={form.language}
                  onChange={(e) => updateForm('language', e.target.value)}
                  id="language-select"
                >
                  {LANGUAGE_LIST.map((lang) => (
                    <option key={lang.id} value={lang.id}>{lang.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Mode</label>
                <div className="mode-selector" id="mode-selector">
                  {MODES.map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      className={`mode-option ${form.mode === mode.id ? 'active' : ''}`}
                      onClick={() => updateForm('mode', mode.id)}
                      title={mode.desc}
                    >
                      <span className="mode-icon">{mode.icon}</span>
                      <span className="mode-name">{mode.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Starter Code */}
          <div className="form-section">
            <div className="form-group">
              <label className="form-label">
                Starter Code <span className="text-muted">(optional — default template used if empty)</span>
              </label>
              <textarea
                className="textarea code-textarea"
                placeholder={LANGUAGES[form.language].defaultCode}
                value={form.starterCode}
                onChange={(e) => updateForm('starterCode', e.target.value)}
                rows={6}
                id="starter-code-input"
              />
            </div>
          </div>

          {/* Test Cases (Interview Mode) */}
          {(form.mode === 'interview' || form.mode === 'teaching') && (
            <div className="form-section" id="test-cases-section">
              <div className="section-header">
                <label className="form-label">Test Cases</label>
                <button type="button" className="btn btn-ghost btn-sm" onClick={addTestCase}>
                  + Add Test Case
                </button>
              </div>
              {form.testCases.map((tc, index) => (
                <div key={index} className="test-case-row" id={`test-case-${index}`}>
                  <div className="test-case-num">#{index + 1}</div>
                  <div className="test-case-fields">
                    <div className="form-group">
                      <label className="form-label text-xs">Input (stdin)</label>
                      <textarea
                        className="textarea"
                        placeholder="Input to pass to stdin"
                        value={tc.input}
                        onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label text-xs">Expected Output</label>
                      <textarea
                        className="textarea"
                        placeholder="Expected stdout output"
                        value={tc.expectedOutput}
                        onChange={(e) => updateTestCase(index, 'expectedOutput', e.target.value)}
                        rows={2}
                      />
                    </div>
                  </div>
                  <div className="test-case-actions">
                    <label className="hidden-toggle" title="Hidden from candidates">
                      <input
                        type="checkbox"
                        checked={tc.isHidden}
                        onChange={(e) => updateTestCase(index, 'isHidden', e.target.checked)}
                      />
                      <span className="text-xs">Hidden</span>
                    </label>
                    {form.testCases.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => removeTestCase(index)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loading}
            id="submit-create-room"
          >
            {loading ? 'Creating...' : '🚀 Create Room'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateRoom;
