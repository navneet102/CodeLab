import { useState } from 'react';
import useRoomStore from '../../store/roomStore';
import './OutputTerminal.css';

const OutputTerminal = () => {
  const { executionStatus, executionResult, testResults } = useRoomStore();
  const [activeTab, setActiveTab] = useState('output'); // 'output' | 'debug'

  const hasTestResults = testResults && testResults.length > 0;
  const passedCount = hasTestResults ? testResults.filter((t) => t.passed).length : 0;
  const totalCount = hasTestResults ? testResults.length : 0;

  return (
    <div className="output-terminal" id="output-terminal">
      {/* Tab bar */}
      <div className="terminal-tab-bar">
        <button
          className={`terminal-tab ${activeTab === 'output' ? 'active' : ''}`}
          onClick={() => setActiveTab('output')}
          id="tab-output"
        >
          OUTPUT
        </button>
        <button
          className={`terminal-tab ${activeTab === 'debug' ? 'active' : ''}`}
          onClick={() => setActiveTab('debug')}
          id="tab-debug"
        >
          DEBUG CONSOLE
        </button>

        {/* Status badges */}
        <div className="terminal-tab-badges">
          {executionStatus && (
            <span className={`badge ${
              executionStatus === 'queued'    ? 'badge-warning' :
              executionStatus === 'running'   ? 'badge-primary animate-pulse' :
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

        {/* Sync indicator */}
        {/* <div className="terminal-sync-indicator">
          <span className="sync-dot" />
          Sync: 12ms delay
        </div> */}
      </div>

      {/* Body */}
      {activeTab === 'output' && (
        <div className="terminal-body" id="terminal-output">
          {!executionResult && !executionStatus && (
            <div className="terminal-placeholder">
              Click <strong>▶ Run</strong> to execute your code
            </div>
          )}

          {(executionStatus === 'queued' || executionStatus === 'running') && (
            <div className="terminal-status">
              <div className="terminal-spinner" />
              {executionStatus === 'queued' ? 'Waiting in queue...' : 'Executing code...'}
            </div>
          )}

          {executionResult?.stdout && (
            <div className="terminal-section">
              <div className="terminal-section-label">stdout</div>
              <pre className="terminal-output stdout">{executionResult.stdout}</pre>
            </div>
          )}

          {executionResult?.stderr && (
            <div className="terminal-section">
              <div className="terminal-section-label error">stderr</div>
              <pre className="terminal-output stderr">{executionResult.stderr}</pre>
            </div>
          )}

          {executionResult?.executionTimeMs > 0 && (
            <div className="terminal-meta">
              ⏱ {executionResult.executionTimeMs}ms
              {executionResult.exitCode !== undefined && (
                <span> · Exit code: {executionResult.exitCode}</span>
              )}
            </div>
          )}

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
                    <span className="test-result-icon">{tr.passed ? '✅' : '❌'}</span>
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
      )}

      {/* {activeTab === 'debug' && (
        <div className="terminal-body terminal-debug" id="terminal-debug">
          {executionResult?.executionTimeMs > 0 && (
            <>
              <div className="debug-line">
                <span className="debug-timestamp">[{new Date().toLocaleTimeString()}]</span>
                <span className="debug-system">System:</span>
                <span> Session initialized.</span>
              </div>
              {executionResult.exitCode === 0 ? (
                <div className="debug-line success">
                  <span className="debug-timestamp">[{new Date().toLocaleTimeString()}]</span>
                  <span className="debug-success">Success:</span>
                  <span> Execution finished in {executionResult.executionTimeMs}ms.</span>
                </div>
              ) : (
                <div className="debug-line error">
                  <span className="debug-timestamp">[{new Date().toLocaleTimeString()}]</span>
                  <span className="debug-error">Error:</span>
                  <span> Exit code {executionResult.exitCode}.</span>
                </div>
              )}
            </>
          )}
          {!executionResult && (
            <div className="terminal-placeholder">No debug output yet.</div>
          )}
        </div>
      )} */}
    </div>
  );
};

export default OutputTerminal;
