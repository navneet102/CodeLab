const http = require('http');
const WebSocket = require('ws');
const Y = require('yjs');
const { setupWSConnection } = require('./yjsUtils');

// Store active Yjs documents
const docs = new Map();

const getYDoc = (docName) => {
  if (!docs.has(docName)) {
    const doc = new Y.Doc();
    docs.set(docName, doc);
  }
  return docs.get(docName);
};

const startYjsServer = (server) => {
  const wss = new WebSocket.Server({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    // Intercept WebSocket upgrade requests matching /yjs/
    if (request.url.startsWith('/yjs/')) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', (ws, req) => {
    // Extract room ID from URL path: /yjs/roomId
    const docName = req.url.split('/yjs/')[1]?.split('?')[0];
    if (!docName) return ws.close();

    console.log(`📝 Yjs connection for document: ${docName}`);

    const doc = getYDoc(docName);
    setupWSConnection(ws, doc, docName);
  });
};

module.exports = { startYjsServer };
