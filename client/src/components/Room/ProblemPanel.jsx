import useRoomStore from '../../store/roomStore';
import './ProblemPanel.css';

const ProblemPanel = () => {
  const { room, username } = useRoomStore();

  if (!room) return null;

  const isOwner = room.owner === username;
  const isInterview = room.mode === 'interview';

  // Filter test cases — hide hidden ones from non-owners in interview mode
  const visibleTestCases = (room.testCases || []).filter(
    (tc) => !isInterview || isOwner || !tc.isHidden
  );

  const hiddenCount = (room.testCases || []).length - visibleTestCases.length;

  return (
    <div className="problem-panel" id="problem-panel">
      <div className="panel-header">
        <span>📝 Problem</span>
      </div>
      <div className="problem-body">
        {room.description ? (
          <div className="problem-description">
            {room.description.split('\n').map((line, i) => (
              <p key={i}>{line || '\u00A0'}</p>
            ))}
          </div>
        ) : (
          <p className="text-muted text-sm">No problem description provided.</p>
        )}

        {visibleTestCases.length > 0 && (
          <div className="test-cases-section">
            <h4 className="test-cases-title">Test Cases</h4>
            {visibleTestCases.map((tc, index) => (
              <div key={index} className="test-case-item" id={`tc-${index}`}>
                <div className="tc-header">
                  <span className="tc-label">Test #{index + 1}</span>
                  {tc.isHidden && isOwner && (
                    <span className="badge badge-warning">Hidden</span>
                  )}
                </div>
                <div className="tc-content">
                  <div className="tc-field">
                    <span className="tc-field-label">Input</span>
                    <pre className="tc-field-value">{tc.input || '(none)'}</pre>
                  </div>
                  <div className="tc-field">
                    <span className="tc-field-label">Expected Output</span>
                    <pre className="tc-field-value">{tc.expectedOutput || '(none)'}</pre>
                  </div>
                </div>
              </div>
            ))}
            {hiddenCount > 0 && !isOwner && (
              <p className="text-muted text-xs" style={{ marginTop: 'var(--space-sm)' }}>
                🔒 {hiddenCount} hidden test case{hiddenCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemPanel;
