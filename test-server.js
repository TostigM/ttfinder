// TTFinder — Node.js server test
// Temporarily set this as the startup file in cPanel Setup Node.js App
// to verify Node.js is running before deploying the full app.
// Restore startup file to server.js when done.

const http = require("http");

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>TTFinder — Node.js Test</title>
        <style>
          body { font-family: sans-serif; max-width: 600px; margin: 60px auto; padding: 0 20px; }
          .ok  { color: green; }
          .info { color: #555; font-size: 0.9em; }
          pre  { background: #f4f4f4; padding: 12px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <h1>TTFinder</h1>
        <p class="ok">&#10003; Node.js is running on this server.</p>
        <pre>
Node version : ${process.version}
Platform     : ${process.platform}
Architecture : ${process.arch}
Port         : ${port}
Environment  : ${process.env.NODE_ENV || "not set"}
Time (UTC)   : ${new Date().toUTCString()}
        </pre>
        <p class="info">This is a temporary test page. Remove test-server.js and restore the startup file to <strong>server.js</strong> when the app is ready.</p>
      </body>
    </html>
  `);
});

server.listen(port, () => {
  console.log(`Test server running on port ${port}`);
});
