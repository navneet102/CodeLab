const http = require('http');
const WebSocket = require('ws');
const Y = require('yjs');
const { setupWSConnection } = require('./yjsUtils');
const { YJS_PORT } = require('../config/env');

// Store active Yjs documents
const docs = new Map();

const getYDoc = (docName) => {
  if (!docs.has(docName)) {
    const doc = new Y.Doc();
    docs.set(docName, doc);
  }
  return docs.get(docName);
};

const startYjsServer = () => {
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Yjs WebSocket Server');
  });

  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws, req) => {
    // Extract room ID from URL path: /roomId
    const docName = req.url.slice(1).split('?')[0];
    console.log(`📝 Yjs connection for document: ${docName}`);

    const doc = getYDoc(docName);
    setupWSConnection(ws, doc, docName);
  });

  server.listen(YJS_PORT, () => {
    console.log(`✅ Yjs WebSocket server running on port ${YJS_PORT}`);
  });

  return server;
};

module.exports = { startYjsServer, getYDoc };
