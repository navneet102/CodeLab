const Y = require('yjs');
const syncProtocol = require('y-protocols/sync');
const awarenessProtocol = require('y-protocols/awareness');
const encoding = require('lib0/encoding');
const decoding = require('lib0/decoding');

const messageSync = 0;
const messageAwareness = 1;

// Store awareness per document
const awarenessMap = new Map();

const getAwareness = (docName, doc) => {
  if (!awarenessMap.has(docName)) {
    const awareness = new awarenessProtocol.Awareness(doc);
    awarenessMap.set(docName, awareness);
  }
  return awarenessMap.get(docName);
};

const setupWSConnection = (ws, doc, docName) => {
  const awareness = getAwareness(docName, doc);

  // Store connections per doc
  if (!doc.conns) doc.conns = new Set();
  doc.conns.add(ws);

  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      const buf = new Uint8Array(message);
      const decoder = decoding.createDecoder(buf);
      const messageType = decoding.readVarUint(decoder);

      switch (messageType) {
        case messageSync: {
          const encoder = encoding.createEncoder();
          encoding.writeVarUint(encoder, messageSync);
          syncProtocol.readSyncMessage(decoder, encoder, doc, null);
          if (encoding.length(encoder) > 1) {
            ws.send(encoding.toUint8Array(encoder));
          }
          break;
        }
        case messageAwareness: {
          awarenessProtocol.applyAwarenessUpdate(
            awareness,
            decoding.readVarUint8Array(decoder),
            ws
          );
          break;
        }
      }
    } catch (err) {
      console.error('Yjs message error:', err);
    }
  });

  // Send sync step 1
  {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageSync);
    syncProtocol.writeSyncStep1(encoder, doc);
    ws.send(encoding.toUint8Array(encoder));
  }

  // Send current awareness state
  const awarenessStates = awareness.getStates();
  if (awarenessStates.size > 0) {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageAwareness);
    encoding.writeVarUint8Array(
      encoder,
      awarenessProtocol.encodeAwarenessUpdate(
        awareness,
        Array.from(awarenessStates.keys())
      )
    );
    ws.send(encoding.toUint8Array(encoder));
  }

  // Broadcast doc updates to all connected clients
  const docUpdateHandler = (update, origin) => {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageSync);
    syncProtocol.writeUpdate(encoder, update);
    const message = encoding.toUint8Array(encoder);

    doc.conns.forEach((conn) => {
      if (conn !== origin && conn.readyState === 1) {
        conn.send(message);
      }
    });
  };

  doc.on('update', docUpdateHandler);

  // Broadcast awareness updates
  const awarenessChangeHandler = ({ added, updated, removed }, origin) => {
    const changedClients = added.concat(updated).concat(removed);
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageAwareness);
    encoding.writeVarUint8Array(
      encoder,
      awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients)
    );
    const message = encoding.toUint8Array(encoder);

    doc.conns.forEach((conn) => {
      if (conn.readyState === 1) {
        conn.send(message);
      }
    });
  };

  awareness.on('update', awarenessChangeHandler);

  // Clean up on close
  ws.on('close', () => {
    doc.conns.delete(ws);
    awarenessProtocol.removeAwarenessStates(awareness, [doc.clientID], null);
    doc.off('update', docUpdateHandler);
    awareness.off('update', awarenessChangeHandler);

    if (doc.conns.size === 0) {
      // Optionally clean up empty docs after a delay
    }
  });
};

module.exports = { setupWSConnection };
