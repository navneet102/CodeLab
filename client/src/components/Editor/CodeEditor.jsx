import { useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import useYjs from '../../hooks/useYjs';
import useEditorStore from '../../store/editorStore';
import useRoomStore from '../../store/roomStore';
import { LANGUAGES } from '../../utils/languages';
import './CodeEditor.css';

const CodeEditor = ({ roomId, starterCode }) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const { language, theme, fontSize } = useEditorStore();
  const { room } = useRoomStore();

  const handleEditorDidMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Focus the editor
    editor.focus();

    // Set editor options
    editor.updateOptions({
      fontSize,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
      fontLigatures: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      smoothScrolling: true,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      renderLineHighlight: 'all',
      padding: { top: 16 },
      lineNumbers: 'on',
      roundedSelection: true,
      automaticLayout: true,
      tabSize: 4,
      wordWrap: 'on',
    });
  }, [fontSize]);

  // Set up Yjs collaboration
  useYjs(roomId, editorRef, monacoRef);

  // Get current code from editor
  const getCode = useCallback(() => {
    if (editorRef.current) {
      return editorRef.current.getValue();
    }
    return '';
  }, []);

  // Expose getCode to parent via the ref
  if (typeof window !== 'undefined') {
    window.__codesync_getCode = getCode;
  }

  const langConfig = LANGUAGES[language] || LANGUAGES.python;

  return (
    <div className="code-editor-wrapper" id="code-editor">
      <Editor
        height="100%"
        language={langConfig.monacoLanguage}
        theme={theme}
        defaultValue={starterCode || langConfig.defaultCode}
        onMount={handleEditorDidMount}
        loading={
          <div className="editor-loading">
            <div className="editor-loading-spinner" />
            <span>Loading editor...</span>
          </div>
        }
        options={{
          fontSize,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          minimap: { enabled: false },
          automaticLayout: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;
