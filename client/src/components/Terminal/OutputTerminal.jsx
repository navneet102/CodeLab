import useRoomStore from '../../store/roomStore';
import './OutputTerminal.css';

const OutputTerminal = () => {
  const { executionStatus, executionResult, testResults } = useRoomStore();

  const hasTestResults = testResults && testResults.length > 0;
  const passedCount = hasTestResults ? testResults.filter((t) => t.passed).length : 0;
  const totalCount = hasTestResults ? testResults.length : 0;

  return (
    <div className="output-terminal" id="output-terminal">
      <div className="panel-header">
        <span>📟 Output</span>
        {executionStatus && (
          <span className={`badge ${
            executionStatus === 'queued' ? 'badge-warning' :
            executionStatus === 'running' ? 'badge-primary animate-pulse' :
            executionStatus === 'completed' ? 'badge-success' :
            'badge-error'
          }`}>
            {executionStatus === 'running' ? '⏳ Running...' : executionStatus}
          </span>
        )}
        {hasTestResults && (
          <span className={`badge ${passedCount === totalCount ? 'badge-success' : 'badge-error'}`}>
            {passedCount}/{totalCount} passed
          </span>
        )}
      </div>

      <div className="terminal-body" id="terminal-output">
        {!executionResult && !executionStatus && (
          <div className="terminal-placeholder">
            Click <strong>"▶ Run"</strong> to execute your code
          </div>
        )}

        {executionStatus === 'queued' && (
          <div className="terminal-status">
            <div className="terminal-spinner" />
            Waiting in queue...
          </div>
        )}

        {executionStatus === 'running' && (
          <div className="terminal-status">
            <div className="terminal-spinner" />
            Executing code...
          </div>
        )}

        {executionResult && executionResult.stdout && (
          <div className="terminal-section">
            <div className="terminal-section-label">stdout</div>
            <pre className="terminal-output stdout">{executionResult.stdout}</pre>
          </div>
        )}

        {executionResult && executionResult.stderr && (
          <div className="terminal-section">
            <div className="terminal-section-label error">stderr</div>
            <pre className="terminal-output stderr">{executionResult.stderr}</pre>
          </div>
        )}

        {executionResult && executionResult.executionTimeMs > 0 && (
          <div className="terminal-meta">
            ⏱ {executionResult.executionTimeMs}ms
            {executionResult.exitCode !== undefined && (
              <span> · Exit code: {executionResult.exitCode}</span>
            )}
          </div>
        )}

        {/* Test Results */}
        {hasTestResults && (
          <div className="test-results">
            <div className="terminal-section-label">Test Results</div>
            {testResults.map((tr, i) => (
              <div
                key={i}
                className={`test-result-item ${tr.passed ? 'passed' : 'failed'}`}
                id={`test-result-${i}`}
              >
                <div className="test-result-header">
                  <span className="test-result-icon">
                    {tr.passed ? '✅' : '❌'}
                  </span>
                  <span className="test-result-label">
                    Test #{i + 1} — {tr.passed ? 'Passed' : 'Failed'}
                  </span>
                </div>
                {!tr.passed && (
                  <div className="test-result-diff">
                    <div className="diff-row">
                      <span className="diff-label">Input:</span>
                      <pre className="diff-value">{tr.input || '(none)'}</pre>
                    </div>
                    <div className="diff-row">
                      <span className="diff-label">Expected:</span>
                      <pre className="diff-value">{tr.expectedOutput}</pre>
                    </div>
                    <div className="diff-row">
                      <span className="diff-label">Got:</span>
                      <pre className="diff-value error">{tr.actualOutput}</pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputTerminal;
