import { useEffect, useRef } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import useRoomStore from '../store/roomStore';

const YJS_URL = import.meta.env.VITE_YJS_URL || 'ws://localhost:3001/yjs';

const useYjs = (roomId, editorRef, monacoRef) => {
  const providerRef = useRef(null);
  const docRef = useRef(null);
  const bindingRef = useRef(null);
  const { username, userColor } = useRoomStore();

  useEffect(() => {
    if (!roomId || !editorRef.current || !monacoRef.current) return;

    const editor = editorRef.current;
    const model = editor.getModel();
    if (!model) return;

    // Create Yjs document
    const ydoc = new Y.Doc();
    docRef.current = ydoc;

    // Connect to Yjs WebSocket server
    const provider = new WebsocketProvider(YJS_URL, roomId, ydoc, {
      connect: true,
      params: {},
    });
    providerRef.current = provider;

    // Set awareness (local user info)
    provider.awareness.setLocalStateField('user', {
      name: username || 'Anonymous',
      color: userColor || '#6C3FE2',
    });

    // Bind Yjs to Monaco
    const ytext = ydoc.getText('monaco');
    const binding = new MonacoBinding(
      ytext,
      model,
      new Set([editor]),
      provider.awareness
    );
    bindingRef.current = binding;

    provider.on('status', ({ status }) => {
      console.log(`📝 Yjs: ${status}`);
    });

    return () => {
      if (bindingRef.current) {
        bindingRef.current.destroy();
        bindingRef.current = null;
      }
      if (providerRef.current) {
        providerRef.current.destroy();
        providerRef.current = null;
      }
      if (docRef.current) {
        docRef.current.destroy();
        docRef.current = null;
      }
    };
  }, [roomId, editorRef.current, monacoRef.current, username, userColor]);

  return {
    provider: providerRef,
    doc: docRef,
  };
};

export default useYjs;
