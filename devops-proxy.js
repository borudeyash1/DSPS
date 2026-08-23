const http = require('http');
const fs = require('fs');
const path = require('path');
const net = require('net');

const PREVIEW_PORT = process.env.PORT || 3001;
const BACKEND_PORT = 5001;
const CLIENT_DIST = path.resolve(__dirname, 'client/dist');
const CLIENT_BUILD = path.resolve(__dirname, 'client/build');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With,x-workspace-id,Cookie',
  'Access-Control-Allow-Credentials': 'true'
};

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json'
};

// Build sanitized headers: strip Origin/Referer so backend CORS passes, spoof Host to backend port
function buildBackendHeaders(req) {
  const headers = Object.assign({}, req.headers);
  delete headers['origin'];
  delete headers['referer'];
  headers['host'] = 'localhost:' + BACKEND_PORT;
  return headers;
}

const server = http.createServer((req, res) => {
  const url = req.url;

  // Handle CORS preflight from browser before proxying
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  const isApiReq = url.startsWith('/api/') || url.startsWith('/socket.io/') || url.startsWith('/uploads/') || url.startsWith('/webhook') || url.startsWith('/razorpay');

  if (isApiReq) {
    const proxyReq = http.request({
      host: 'localhost',
      port: BACKEND_PORT,
      path: req.url,
      method: req.method,
      headers: buildBackendHeaders(req)
    }, (proxyRes) => {
      const responseHeaders = Object.assign({}, proxyRes.headers, CORS_HEADERS);
      res.writeHead(proxyRes.statusCode, responseHeaders);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      res.writeHead(502, CORS_HEADERS);
      res.end('Proxy Error: ' + err.message);
    });

    req.pipe(proxyReq);
    return;
  }

  let staticPath = CLIENT_DIST;
  if (!fs.existsSync(staticPath)) {
    staticPath = CLIENT_BUILD;
  }

  let filePath = path.join(staticPath, url === '/' ? 'index.html' : url);
  
  if (!filePath.startsWith(staticPath)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(staticPath, 'index.html');
      fs.stat(filePath, (err2, stats2) => {
        if (err2 || !stats2.isFile()) {
          const proxyReq = http.request({
            host: 'localhost',
            port: BACKEND_PORT,
            path: req.url,
            method: req.method,
            headers: req.headers
          }, (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res);
          });
          proxyReq.on('error', (err) => {
            res.writeHead(502);
            res.end('Proxy Error: ' + err.message);
          });
          req.pipe(proxyReq);
          return;
        }
        serveFile(filePath, res);
      });
      return;
    }
    serveFile(filePath, res);
  });
});

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
}

server.on('upgrade', (req, socket, head) => {
  const proxySocket = net.connect(BACKEND_PORT, 'localhost', () => {
    let rawHeaders = req.method + ' ' + req.url + ' HTTP/' + req.httpVersion + '\r\n';
    for (let i = 0; i < req.rawHeaders.length; i += 2) {
      rawHeaders += req.rawHeaders[i] + ': ' + req.rawHeaders[i+1] + '\r\n';
    }
    rawHeaders += '\r\n';
    proxySocket.write(rawHeaders);
    if (head && head.length > 0) {
      proxySocket.write(head);
    }
    proxySocket.pipe(socket);
    socket.pipe(proxySocket);
  });
  proxySocket.on('error', () => {
    socket.end();
  });
});

server.listen(PREVIEW_PORT, () => {
  console.log('[DEVOPS PROXY] Listening on port ' + PREVIEW_PORT + ', proxying APIs to port ' + BACKEND_PORT);
});